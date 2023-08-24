import { BigNumber, ethers } from 'ethers';
import { Deferrable, parseUnits } from 'ethers/lib/utils.js';
import { Provider, types, utils } from 'zksync-web3';
import { TransactionRequest } from 'zksync-web3/build/src/types';
import {
  PAYMASTER_ADDRESS,
  USDC_ADDRESS,
  USDT_PAYMASTER_ADDRESS,
} from './constants/index';
import { ERC20Token, FEE_PAYMENT_TOKENS } from './constants/tokens';
import { SupportedChainId } from './constants/chains';
import { IWalletPaymaster } from './types';

export const PAYMASTER_ADJUSTED_GASLIMIT = 30_000; // Additional gas for paymasters execution

export class RaisePaymaster implements IWalletPaymaster {
  id = 'raise';
  token: string;
  address = USDT_PAYMASTER_ADDRESS;

  constructor(token: string = USDC_ADDRESS) {
    this.token = token;
  }

  getFeeToken(): ERC20Token | undefined {
    return Object.values(
      FEE_PAYMENT_TOKENS[SupportedChainId.ZK_SYNC2_TESTNET],
    ).find((token) => token.address == this.token);
  }

  getEstimatedFee(
    transaction: ethers.utils.Deferrable<types.TransactionRequest>,
  ): BigNumber {
    const feeToken = this.getFeeToken();
    const gasPrice = BigNumber.from(250000000); // Constant for zkSync
    const fee = gasPrice.mul(transaction.gasLimit!.toString());

    if (feeToken?.symbol == 'ETH') {
      return fee;
    }

    const estimatedFee = fee
      .mul(15)
      .mul(ethers.BigNumber.from(10).pow(feeToken!.decimals))
      .div(ethers.BigNumber.from(10).pow(18))
      .mul(20);
    return estimatedFee;
  }

  async getPaymasterParams(
    provider: Provider,
    transaction: ethers.utils.Deferrable<types.TransactionRequest>,
  ): Promise<{
    paymasterParams: types.PaymasterParams | undefined;
    minimalAllowance: BigNumber;
    feeToken: ERC20Token | undefined;
    estimatedFee: BigNumber | undefined;
  }> {
    console.log('Paymaster call', transaction.gasLimit);

    if (!transaction.gasLimit) {
      const gasLimit = await provider!.estimateGas(transaction);
      transaction.gasLimit = gasLimit;
    }

    const feeToken = this.getFeeToken();
    const gasPrice = await provider.getGasPrice();
    const fee = gasPrice.mul(transaction.gasLimit!.toString());

    if (feeToken?.symbol == 'ETH') {
      return {
        paymasterParams: undefined,
        minimalAllowance: BigNumber.from(0),
        feeToken,
        estimatedFee: fee,
      };
    }

    const estimatedFee = fee
      .mul(15)
      .mul(ethers.BigNumber.from(10).pow(feeToken!.decimals))
      .div(ethers.BigNumber.from(10).pow(18))
      .mul(20);

    const minimalAllowance = parseUnits('100.0', feeToken?.decimals);

    const paymasterParams = utils.getPaymasterParams(this.address, {
      type: 'ApprovalBased',
      token: this.token,
      // set minimalAllowance as we defined in the paymaster contract
      minimalAllowance,
      innerInput: new Uint8Array(),
    });

    return { paymasterParams, minimalAllowance, feeToken, estimatedFee };
  }
}

export class RaiseSubsidizingPaymaster implements IWalletPaymaster {
  id = 'raiseSubsidizing';
  address = PAYMASTER_ADDRESS;
  async getPaymasterParams(
    provider: Provider,
    transaction: ethers.utils.Deferrable<types.TransactionRequest>,
  ): Promise<{
    paymasterParams: types.PaymasterParams | undefined;
    minimalAllowance: BigNumber;
    feeToken: ERC20Token | undefined;
    estimatedFee: BigNumber | undefined;
  }> {
    const paymasterParams = utils.getPaymasterParams(this.address, {
      type: 'General',
      innerInput: new Uint8Array(),
    });

    return {
      paymasterParams,
      minimalAllowance: BigNumber.from(0),
      feeToken: undefined,
      estimatedFee: undefined,
    };
  }

  getFeeToken(): ERC20Token | undefined {
    return undefined;
  }

  getEstimatedFee(
    transaction: ethers.utils.Deferrable<types.TransactionRequest>,
  ): BigNumber {
    return BigNumber.from(0);
  }
}
