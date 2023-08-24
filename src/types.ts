import { Provider, types } from 'zksync-web3';
import { Deferrable, parseUnits } from 'ethers/lib/utils.js';
import { TransactionRequest } from 'zksync-web3/build/src/types';
import { BigNumber, ethers } from 'ethers';
import { ERC20Token } from './constants/tokens';

export interface IWalletPaymaster {
  id: string;
  address: string;
  getPaymasterParams(
    provider: Provider,
    transaction: Deferrable<TransactionRequest>,
  ): Promise<{
    paymasterParams: types.PaymasterParams | undefined;
    minimalAllowance: BigNumber;
    feeToken: ERC20Token | undefined;
    estimatedFee: BigNumber | undefined;
  }>;
  getFeeToken(): ERC20Token | undefined;
  getEstimatedFee(
    transaction: ethers.utils.Deferrable<types.TransactionRequest>,
  ): BigNumber;
}
