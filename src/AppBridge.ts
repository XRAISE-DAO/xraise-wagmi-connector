import { connectToChild } from 'penpal';
import qs from 'qs';
import { arrayify, Deferrable } from 'ethers/lib/utils.js';
import {
  PaymasterParams,
  TransactionRequest,
} from 'zksync-web3/build/src/types';
import { types } from 'zksync-web3';
import { serialize } from 'zksync-web3/build/src/utils';

export interface SessionCreationParams {
  allowedAddresses: string[];
}
/**
 * Methods defined on key holder side to be called through bridge
 */
interface WalletApi {
  login(): Promise<void>;
  logout(): Promise<void>;
  getAddress(): Promise<string | null>;
  signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
  trySignUsingSession(
    transaction: Deferrable<TransactionRequest>,
  ): Promise<string>;
  createSession(params: SessionCreationParams): Promise<string>;
  approveSession(sessionPubKey: string): Promise<boolean>;
  getLocalSessions(): Promise<ISession[]>;
}

/**
 * Methods defined on web3 website side to be called through bridge
 */
interface AppApi {
  onLoginCompleted(address: string): void;
  onLogoutCompleted(): void;
}

export interface ISession {
  allowedAddresses: string[];
  sessionAddress: string;
  userAccount: string;
}

/**
 * The bridge on web3 website side. Connects to the keys holder, representative of the raise pay on foreign web3 website inside iframe
 */
export class AppBridge {
  url =
    process.env.NEXT_PUBLIC_WALLET_ENV == 'local'
      ? 'http://localhost:3000'
      : `https://${process.env.NEXT_PUBLIC_WALLET_ENV}.xraise.io`;

  connection: WalletApi | undefined;
  promise: Promise<WalletApi> | undefined;
  window: Window | undefined;
  transactionWindow: Window | undefined;

  /**
   * Connects to iframe on our domain that holds domain-pinned webauthn auth, keypairs
   * Creates brige connection to key holder website
   * @param iframe iframe where keys holder, representative of the raise pay on foreign web3, is located
   * @param onLoginCompleted Callback, called after raise wallet connected
   * @param onLogoutCompleted Callback, called after raise wallet logged out
   */
  async connect(
    iframe: HTMLIFrameElement,
    onLoginCompleted: (address: string) => void,
    onLogoutCompleted: () => void,
  ) {
    const connection = connectToChild<WalletApi>({
      iframe,
      debug: true,
      methods: {
        /// Called by key holder (iframe) if user logged in using his wallet
        onLoginCompleted(address: string) {
          // console.log(window.location.href, '[Parent]: on login complete');
          onLoginCompleted(address);
        },
        /// Called by key holder (iframe) if user logged out
        onLogoutCompleted() {
          // console.log(window.location.href, '[Parent]: on logout complete');
          onLogoutCompleted();
        },
      },
    });

    /// Penpal promise that waits for communication channel established with key holder (iframe)
    (this.promise as any) = connection.promise;

    await connection.promise.then((child: any) => {
      /// After connection made saving the actial communication bridge
      this.connection = child;
      // console.log(window.location.href, '[Parent]: connection set', child);
    });
  }
  /**
   * Opens login window or restores focus if window already opened
   * Because the window has the same origin as wallet, they have the shared localStorage.
   */
  async openLoginWindow() {
    if (!this.window || this.window.closed) {
      this.window = window.open(
        `${this.url}/wallet?${qs.stringify({
          origin: window.origin,
        })}&embedded=true&mode=login`,
        '_blank',
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`,
      )!;
    } else {
      this.window.focus();
    }

    const this_ = this;
    window.onunload = function () {
      if (this_.window && !this_.window.closed) {
        this_.window.close();
      }
    };
  }

  /**
   * Opens wallet main window. Used to open wallet window on merchant site.
   */
  async openWalletWindow() {
    if (!this.window || this.window.closed) {
      this.window = window.open(
        `${this.url}/wallet?${qs.stringify({
          origin: window.origin,
        })}&embedded=true`,
        '_blank',
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`,
      )!;

      const this_ = this;
      window.onunload = function () {
        if (this_.window && !this_.window.closed) {
          this_.window.close();
        }
      };
    } else {
      this.window.focus();
    }
  }

  /**
   * Opens wallet transaction window. Ask to approve or reject transaction
   */
  async openTransactionWindow(
    transaction: string,
  ): Promise<{ instantSignature?: string; paymasterParams?: PaymasterParams }> {
    if (window.location.pathname == '/wallet') {
      document.dispatchEvent(
        new CustomEvent<{ tx: string }>('new_tx', {
          detail: { tx: transaction },
        }),
      );

      const { instantSignature, paymasterParams } = await new Promise<{
        instantSignature?: string;
        paymasterParams?: PaymasterParams;
      }>((resolve) => {
        const handleTxApproved = (event: Event) => {
          console.log('Received event', event);
          if ((event as CustomEvent).detail.paymasterAddress) {
            console.log(
              'Got custom paymaster options',
              (event as CustomEvent).detail.feeToken,
            );
          }
          if ((event as CustomEvent).detail.instantSignature) {
            console.log(
              'Got instant signature',
              (event as CustomEvent).detail.instantSignature,
            );
            console.log((event as CustomEvent).detail.instantSignature);
          }
          document.removeEventListener('tx_approved', handleTxApproved);
          resolve({
            instantSignature: (event as CustomEvent).detail.instantSignature,
            paymasterParams: (event as CustomEvent).detail.paymasterAddress
              ? {
                  paymaster: (event as CustomEvent).detail.paymasterAddress,
                  paymasterInput: arrayify(
                    (event as CustomEvent).detail.paymasterInput,
                  ),
                }
              : undefined,
          });
        };

        document.addEventListener('tx_approved', handleTxApproved);
      });
      return { instantSignature, paymasterParams };
    }

    if (!this.transactionWindow || this.transactionWindow.closed) {
      this.transactionWindow = window.open(
        `${this.url}/wallet?mode=transaction&${qs.stringify({
          tx: transaction,
        })}&embedded=true`,
        '_blank',
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`,
      )!;

      if (this.transactionWindow == null) {
        throw new Error('Window blocked');
      }

      const this_ = this;
      window.onunload = function () {
        if (this_.transactionWindow && !this_.transactionWindow.closed) {
          this_.transactionWindow.close();
        }
      };

      const { instantSignature, paymasterParams } = await new Promise<{
        instantSignature?: string;
        paymasterParams?: PaymasterParams;
      }>((resolve, reject) => {
        window.onmessage = function (e) {
          if (e.data.from != 'transactionView') return;

          if (e.data.instantSignature) {
            console.log('Got instant signature');
            console.log(e.data.instantSignature);
          }

          if (e.data.approveStatus == 'approved') {
            resolve({
              instantSignature: e.data.instantSignature,
              paymasterParams: e.data.paymasterAddress
                ? {
                    paymaster: e.data.paymasterAddress,
                    paymasterInput: e.data.paymasterInput,
                  }
                : undefined,
            });
          } else {
            reject('Not approved');
          }
        };
        // onload required because of onunload called while page prepared
        // https://stackoverflow.com/questions/7476660/why-does-window-open-onunload-function-not-work-as-i-expect
        this.transactionWindow!.onload = () => {
          this.transactionWindow!.onunload = () => {
            reject('Not approved'); // closed
          };
        };
      });

      return { instantSignature, paymasterParams };
    } else {
      /// @todo Maybe focus and send message to change tx
      this.transactionWindow.close();
      this.transactionWindow = undefined;
      return await this.openTransactionWindow(transaction);
    }
  }

  /**
   * Opens wallet error window. Ask to approve or reject transaction
   */
  async openNoFundsErrorWindow() {
    if (!this.transactionWindow || this.transactionWindow.closed) {
      this.transactionWindow = window.open(
        `${this.url}/wallet?mode=error_no_funds&embedded=true`,
        '_blank',
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`,
      )!;

      const this_ = this;
      window.onunload = function () {
        if (this_.transactionWindow && !this_.transactionWindow.closed) {
          this_.transactionWindow.close();
        }
      };
    } else {
      this.transactionWindow.focus();
    }
  }

  /**
   * Requests login in the wallet. If connection made, does nothing. Otherwise opens wallet login window and requests login in the key holder through bridge
   */
  async login() {
    // console.log('[wagmi] Logging in');
    await this.promise;

    const address = await this.connection?.getAddress();

    if (address != null && address != '0x') return;

    this.openLoginWindow();
    this.connection?.login();
  }

  /**
   * Requests transaction signature on the key holder through bridge
   * @param signedTxHash tx hash to sign
   * @returns Signature of the tx hash
   */
  async signTransaction(
    transaction: Deferrable<TransactionRequest>,
  ): Promise<string> {
    try {
      return (await this.connection?.trySignUsingSession(transaction!))!;
    } catch (e) {
      console.log('Failed to sign in background, no sessions', e);
      // Failed to sign in background, no sessions
    }

    const { instantSignature, paymasterParams } =
      await this.openTransactionWindow(
        serialize(transaction as TransactionRequest),
      );

    (transaction.customData as types.Eip712Meta).paymasterParams =
      paymasterParams;

    if (instantSignature) {
      (transaction.customData as types.Eip712Meta).customSignature =
        instantSignature;

      return serialize(transaction as any);
    }

    return await this.connection?.signTransaction(transaction)!;
  }

  /**
   * Requests logout on the key holder through bridge
   */
  async logout() {
    await this.connection?.logout();
  }

  async createSession(params: SessionCreationParams): Promise<string> {
    return (await this.connection?.createSession(params)) as string;
  }

  async approveSession(sessionPubKey: string): Promise<boolean> {
    return (await this.connection?.approveSession(sessionPubKey)) as boolean;
  }

  /**
   * Requests current wallet address (address of user account abstraction) on the key holder through bridge
   * @returns User wallet address
   */
  async getAddress(): Promise<string | null> {
    return (await this.connection?.getAddress()) || null;
  }

  /**
   * Requests sessions stored on client
   * @returns Stored client sessions
   */
  async getLocalSessions(): Promise<ISession[] | null> {
    return (await this.connection?.getLocalSessions()) || null;
  }
}
