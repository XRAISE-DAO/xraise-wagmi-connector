'use client';

import type { ProviderRpcError } from '@wagmi/core';
import {
  ConnectorNotFoundError,
  getClient,
  normalizeChainId,
} from '@wagmi/core';
import { BigNumber, ethers, Signer } from 'ethers';
import { Bytes, Deferrable, getAddress } from 'ethers/lib/utils.js';
import type { Chain } from '@wagmi/core/chains';
import type { Address } from 'abitype';
import {
  AppBridge,
  ISession,
  SessionCreationParams,
  WalletEnv,
} from './AppBridge';
import { Provider, types, utils, Wallet } from 'zksync-web3';
import { TransactionRequest } from 'zksync-web3/build/src/types';
import { zkSync } from './utils';
import { Connector } from 'wagmi';
import {
  IWalletPaymaster,
  PAYMASTER_ADJUSTED_GASLIMIT,
  RaisePaymaster,
  RaiseSubsidizingPaymaster,
} from './WalletPaymasters';
import { zkSyncProvider } from './utils';
import { sleep } from './utils';
import { ZKSYNC_GAS_PRICE } from './constants/index';

export type ConnectorData<Provider = any> = {
  account?: Address;
  chain?: { id: number; unsupported: boolean };
  provider?: Provider;
};

export type RaiseConnectorOptions = {
  /** Provide your own wallet url  */
  walletEnv?: WalletEnv;
  /** Name of connector */
  name?: string | ((detectedName: string | string[]) => string);
  /**
   * [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Ethereum Provider to target
   *
   * @default
   * () => typeof window !== 'undefined' ? window.ethereum : undefined
   */
  getProvider?: () => Window['ethereum'] | undefined;
  /**
   * MetaMask and other injected providers do not support programmatic disconnect.
   * This flag simulates the disconnect behavior by keeping track of connection status in storage. See [GitHub issue](https://github.com/MetaMask/metamask-extension/issues/10353) for more info.
   * @default true
   */
  shimDisconnect?: boolean;
};

export class RaiseSigner extends Signer {
  readonly address: string | undefined;
  readonly wallet: Wallet;
  readonly bridge: AppBridge;
  readonly paymasters: Record<string, IWalletPaymaster> = {};

  constructor(
    address: string,
    provider: Provider,
    bridge: AppBridge,
    paymasters: IWalletPaymaster[] = [
      new RaisePaymaster(),
      new RaiseSubsidizingPaymaster(),
    ],
  ) {
    super();
    this.address = address;
    (this.provider as any) = provider; // It's ok, it set's parent readonly field in constructor. TODO suppress warning
    this.bridge = bridge;
    const wallet = Wallet.createRandom().connect(provider!); // Temp keypair, will sig the deploy transaction
    this.wallet = wallet;
    for (const paymaster of paymasters)
      this.paymasters[paymaster.id] = paymaster;
  }

  getAddress(): Promise<string> {
    return Promise.resolve(this.address!);
  }

  _fail(message: string, operation: string): Promise<any> {
    console.log('fail', message, operation);
    return (async () => {})();
  }

  signMessage(message: Bytes | string): Promise<string> {
    console.log('Signing');
    return (async () => '0x')();
    return this._fail('RaiseSigner cannot sign messages', 'signMessage');
  }

  async signTransaction(
    transaction: Deferrable<TransactionRequest>,
  ): Promise<string> {
    const paymasterId = (transaction?.customData as any)?.paymasterId;
    let paymaster = this.paymasters[paymasterId || 'raise'];

    const { paymasterParams } = await paymaster.getPaymasterParams(
      this.provider as Provider,
      transaction,
    );

    transaction.customData = {
      // Note, that we are using the `DEFAULT_GAS_PER_PUBDATA_LIMIT`
      ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams,
    } as types.Eip712Meta;

    if (!transaction.gasLimit) {
      const estimatedGas = await this.provider?.estimateGas(transaction);
      transaction.gasLimit = estimatedGas;
    }

    transaction.gasLimit = (transaction.gasLimit as BigNumber).add(
      PAYMASTER_ADJUSTED_GASLIMIT,
    );
    transaction.maxFeePerGas = ZKSYNC_GAS_PRICE;
    transaction.maxPriorityFeePerGas = ZKSYNC_GAS_PRICE;
    transaction.type = 113; // Todo: investigate why transaction type sets as 2 and only for raiseauthn connector. Consider add if (!transaction.type) then

    if (!transaction.value) transaction.value = ethers.BigNumber.from(0);
    if (!transaction.data) transaction.data = '0x';

    return await this.bridge.signTransaction(transaction);
  }

  connect(provider: Provider): RaiseSigner {
    return new RaiseSigner(this.address!, provider, new AppBridge());
  }
}

type ConnectorOptions = RaiseConnectorOptions &
  Required<Pick<RaiseConnectorOptions, 'getProvider'>>;

export class RaiseConnector extends Connector<
  Window['ethereum'],
  ConnectorOptions,
  RaiseSigner
> {
  readonly id: string;
  readonly name: string;
  readonly ready: boolean;

  _provider?: Window['ethereum'];
  _switchingChains?: boolean;

  bridge = new AppBridge();

  iframe: HTMLIFrameElement | null = null;

  protected raiseAddress = 'raise.address';

  private updateIframe() {
    if (typeof window === 'undefined') {
      return; // server side
    }

    let iframe = this.iframe;

    if (iframe == null) {
      iframe = window.document.createElement('iframe');
      iframe.id = 'raise-bridge';
      iframe.src = '/bridge';
      iframe.style.display = 'none';
      iframe.sandbox.add('allow-scripts');
      iframe.sandbox.add('allow-same-origin');
      iframe.sandbox.add('allow-popups');

      iframe.allow = 'publickey-credentials-get *';

      this.iframe = iframe;
    }

    if (!!document.hasStorageAccess) {
      iframe!.sandbox.add('allow-storage-access-by-user-activation');
    }

    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      document.body.appendChild(iframe!);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(iframe!);
      });
    }
  }

  constructor({
    chains,
    options: options_,
  }: {
    chains?: Chain[];
    options?: RaiseConnectorOptions;
  } = {}) {
    // window.addEventListener('message', (event) => {console.log('CONN EVENT', event?.data)});

    const options = {
      shimDisconnect: true,
      getProvider: () => zkSyncProvider, // Here defined provider that is used clientside
      ...options_,
    };

    super({ chains, options: options as any }); // TODO

    if (options?.walletEnv) {
      this.bridge = new AppBridge({ walletEnv: options.walletEnv });
    } else {
      this.bridge = new AppBridge();
    }

    const provider = options.getProvider();
    Object.assign(provider as object, { chains });
    (provider as any).chains = chains;

    if (typeof options.name === 'string') this.name = options.name;
    else if (provider) {
      const detectedName = 'Raise';
      if (options.name) this.name = options.name(detectedName);
      else {
        if (typeof detectedName === 'string') this.name = detectedName;
        else this.name = detectedName[0] as string;
      }
    } else this.name = 'Raise';

    this.id = 'raise';
    this.ready = !!provider;

    sleep(100).then(() => {
      this.updateIframe();
    });
  }

  async connect({ chainId }: { chainId?: number } = {}): Promise<
    Required<ConnectorData>
  > {
    this.updateIframe();

    // window.addEventListener('message', function(event){
    //   console.log('[MSG DEBUG]: Received', event);
    // });

    const bridge = this.bridge;
    const this_ = this;

    const handleWalletEvent = (event: MessageEvent<any>) => {
      if (
        event.data.source &&
        event.data.source == 'raise_wallet' &&
        event.data.event == 'logged_out'
      ) {
        window.addEventListener('message', handleWalletEvent);
        this_.disconnect();
      }
    };

    window.addEventListener('message', handleWalletEvent);

    const address = await new Promise((resolve, reject) => {
      bridge
        .connect(
          this.iframe!,
          () => {
            bridge.getAddress().then((addr) => {
              resolve(addr ?? '0x');
            });
          },
          () => {
            this.onDisconnect();
          },
        )
        .then(() => bridge.login());

      const handleWalletEvent = (event: MessageEvent<any>) => {
        if (
          event.data.source &&
          event.data.source == 'raise_wallet' &&
          event.data.event == 'logged_in'
        ) {
          // console.log('Received address', event.data.address);
          bridge.connection?.login().then(() => {
            window.removeEventListener('message', handleWalletEvent, false);
            resolve(event.data.address);
          });
        }
      };

      window.addEventListener('message', handleWalletEvent);
    });

    getClient().storage?.setItem(this.raiseAddress, address);

    return {
      account: address as any,
      chain: { id: 280, unsupported: false },
      provider: zkSyncProvider, // Starts to work after connect
    };
  }

  async disconnect() {
    const provider = await this.getProvider();
    if (!provider?.removeListener) return;

    provider.removeListener('accountsChanged', this.onAccountsChanged);
    provider.removeListener('chainChanged', this.onChainChanged);
    provider.removeListener('disconnect', this.onDisconnect);

    getClient().storage?.removeItem(this.raiseAddress);

    if (window.opener) {
      window.opener.postMessage(
        { source: 'raise_wallet', event: 'logged_out' },
        '*',
      );
      window.close();
    }

    await this.bridge.logout().then((x) => {
      this.iframe?.remove();
      this.iframe = null;
    });
  }

  async getAccount() {
    if (this.bridge.connection == null) {
      return getClient().storage?.getItem(this.raiseAddress);
    }

    return (await this.bridge.getAddress())! as any;
  }

  async getChainId() {
    return 280;
  }

  async getProvider() {
    const provider = this.options.getProvider();
    if (provider) this._provider = provider;
    return this._provider;
  }

  async getSigner({ chainId }: { chainId?: number } = {}) {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);

    return new RaiseSigner(account, provider as any, this.bridge);
  }

  async isAuthorized() {
    if (this.bridge.connection == null) {
      return getClient().storage?.getItem(this.raiseAddress) != null;
    }

    const isAuthorized = (await this.getAccount()) != null;

    if (!isAuthorized) getClient().storage?.removeItem(this.raiseAddress);

    return isAuthorized;
  }

  async getLocalSessions(): Promise<ISession[] | null> {
    return await this.bridge.getLocalSessions();
  }

  async switchChain(chainId: number): Promise<Chain> {
    console.log('Not implemented');
    return {} as any;
  }

  async watchAsset({
    address,
    decimals = 18,
    image,
    symbol,
  }: {
    address: Address;
    decimals?: number;
    image?: string;
    symbol: string;
  }) {
    console.log('Watch assets requested', address, decimals, image, symbol);
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    return provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          decimals,
          image,
          symbol,
        },
      },
    });
  }

  async createSession(params: SessionCreationParams): Promise<string> {
    const sessionPublicKey = await this.bridge.createSession(params)!;
    return sessionPublicKey;
  }

  async approveSession(sessionPubKey: string): Promise<boolean> {
    const sessionPublicKey = await this.bridge.approveSession(sessionPubKey)!;
    console.log('Approved session', sessionPubKey);
    return sessionPublicKey;
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit('disconnect');
    else
      this.emit('change', {
        account: getAddress(accounts[0] as string),
      });
  };

  protected onChainChanged = (chainId: number | string) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  };

  protected onDisconnect = () => {
    this.emit('disconnect');
    // Remove shim signalling wallet is disconnected
    getClient().storage?.removeItem(this.raiseAddress);
  };

  protected isUserRejectedRequestError(error: unknown) {
    return (error as ProviderRpcError).code === 4001;
  }
}

export const defaultRaiseConnector = new RaiseConnector({
  chains: [zkSync],
}) as any;
