import { connectToChild, connectToParent } from "penpal";
import qs from "qs";
import { compareArrays, restorePlatformAuth } from "./utils";
import { IAuthProvider } from "./platform_authenticator/IAuthProvider";
import { arrayify, Deferrable, hexlify } from "ethers/lib/utils.js";
import {
  PaymasterParams,
  TransactionRequest,
} from "zksync-web3/build/src/types";
import { EIP712Signer, types } from "zksync-web3";
import { serialize } from "zksync-web3/build/src/utils";
import { ethers } from "ethers";
import { defaultNonsensitiveStorage } from "./platform_support/NonSensitiveStorage";

const WALLET_URL = "https://dev.raisepay.io";

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
    transaction: Deferrable<TransactionRequest>
  ): Promise<string>;
  createSession(params: SessionCreationParams): Promise<string>;
  approveSession(sessionPubKey: string): Promise<boolean>;
}

/**
 * Methods defined on web3 website side to be called through bridge
 */
interface AppApi {
  onLoginCompleted(address: string): void;
  onLogoutCompleted(): void;
}

/**
 * The bridge on web3 website side. Connects to the keys holder, representative of the raise pay on foreign web3 website inside iframe
 */
export class AppBridge {
  url = WALLET_URL;
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
    onLogoutCompleted: () => void
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
        "_blank",
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`
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
        "_blank",
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`
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
    transaction: string
  ): Promise<{ instantSignature?: string; paymasterParams?: PaymasterParams }> {
    if (window.location.pathname == "/wallet") {
      document.dispatchEvent(
        new CustomEvent<{ tx: string }>("new_tx", {
          detail: { tx: transaction },
        })
      );

      const { instantSignature, paymasterParams } = await new Promise<{
        instantSignature?: string;
        paymasterParams?: PaymasterParams;
      }>((resolve) => {
        const handleTxApproved = (event: Event) => {
          console.log("Received event", event);
          if ((event as CustomEvent).detail.paymasterAddress) {
            console.log(
              "Got custom paymaster options",
              (event as CustomEvent).detail.feeToken
            );
          }
          if ((event as CustomEvent).detail.instantSignature) {
            console.log(
              "Got instant signature",
              (event as CustomEvent).detail.instantSignature
            );
            console.log((event as CustomEvent).detail.instantSignature);
          }
          document.removeEventListener("tx_approved", handleTxApproved);
          resolve({
            instantSignature: (event as CustomEvent).detail.instantSignature,
            paymasterParams: (event as CustomEvent).detail.paymasterAddress
              ? {
                  paymaster: (event as CustomEvent).detail.paymasterAddress,
                  paymasterInput: arrayify(
                    (event as CustomEvent).detail.paymasterInput
                  ),
                }
              : undefined,
          });
        };

        document.addEventListener("tx_approved", handleTxApproved);
      });
      return { instantSignature, paymasterParams };
    }

    if (!this.transactionWindow || this.transactionWindow.closed) {
      this.transactionWindow = window.open(
        `${this.url}/wallet?mode=transaction&${qs.stringify({
          tx: transaction,
        })}&embedded=true`,
        "_blank",
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`
      )!;

      if (this.transactionWindow == null) {
        throw new Error("Window blocked");
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
          if (e.data.from != "transactionView") return;

          if (e.data.instantSignature) {
            console.log("Got instant signature");
            console.log(e.data.instantSignature);
          }

          if (e.data.approveStatus == "approved") {
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
            reject("Not approved");
          }
        };
        // onload required because of onunload called while page prepared
        // https://stackoverflow.com/questions/7476660/why-does-window-open-onunload-function-not-work-as-i-expect
        this.transactionWindow!.onload = () => {
          this.transactionWindow!.onunload = () => {
            reject("Not approved"); // closed
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
        "_blank",
        `height=650,width=400,top=${(window.screen.height - 650) / 2},left=${
          (window.screen.width - 400) / 2
        }`
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

    if (address != null && address != "0x") return;

    this.openLoginWindow();
    this.connection?.login();
  }

  /**
   * Requests transaction signature on the key holder through bridge
   * @param signedTxHash tx hash to sign
   * @returns Signature of the tx hash
   */
  async signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    try {
      return (await this.connection?.trySignUsingSession(transaction!))!;
    } catch (e) {
      // Failed to sign in background, no sessions
    }

    const { instantSignature, paymasterParams } =
      await this.openTransactionWindow(
        serialize(transaction as TransactionRequest)
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
}

/**
 * The bridge on the keys holder, representative of the raise pay on foreign web3 website inside iframe. Connects to the web3 website
 */
export class WalletBridge {
  url = WALLET_URL;
  transactionWindow: Window | undefined;

  connection: AppApi | undefined;
  authProvider: IAuthProvider | null;

  INTERNVAL = 100;
  TIMEOUT = 1000 * 60 * 3;

  constructor() {
    this.authProvider = null;
    window.addEventListener("message", (event) => {
      // console.log('WALL EVENT', event?.data);
    });
  }

  /**
   * Logout method processed after web3 site request through bridge
   * Requests logout on auth provider and calls onLogoutCompleted on website
   */
  async logOut() {
    this.authProvider?.logout();
    this.connection?.onLogoutCompleted();
  }

  /**
   * Connect method processed after web3 site request through bridge
   * Restores auth provder. Creates bridge to web3 website
   */
  async connect() {
    const this_ = this;

    this.authProvider = await restorePlatformAuth();

    // console.log('Connect to parent');

    const connection = connectToParent<AppApi>({
      methods: {
        async login() {
          this_.authProvider = await restorePlatformAuth();
        },
        async onLoginCompletedParent() {
          // Can be used instead of watcher using https://stackoverflow.com/questions/25775862/return-a-value-from-window-open
          this_.authProvider = await restorePlatformAuth();

          if (this_.authProvider != null && this_.connection != undefined) {
            this_.connection?.onLoginCompleted(
              this_.authProvider.walletAddress
            );
          }
        },
        async signTransaction(transaction: Deferrable<TransactionRequest>) {
          return new Promise((resolve) => {
            this_
              .signTransaction(transaction)
              .then((serializedTx) => resolve(serializedTx));
          });
        },
        async trySignUsingSession(transaction: Deferrable<TransactionRequest>) {
          return new Promise((resolve, reject) => {
            this_
              .trySignUsingSession(transaction)
              .then((serializedTx) => resolve(serializedTx))
              .catch((err) => reject(err));
          });
        },
        async createSession(params: SessionCreationParams) {
          return new Promise<string>((resolve) => {
            this_.createSession(params).then((r) => resolve(r as string));
          });
        },
        async approveSession(sessionPubKey: string) {
          return new Promise<boolean>((resolve) => {
            this_
              .approveSession(sessionPubKey)
              .then((r) => resolve(r as boolean));
          });
        },
        async getAddress() {
          return this_.authProvider?.walletAddress;
        },
        async logout() {
          this_.logOut();
        },
      },
    });

    connection.promise.then((bridge) => {
      this.connection = bridge;
      if (this.authProvider != null && this.connection != undefined) {
        bridge.onLoginCompleted(this.authProvider.walletAddress);
      }
    });

    connection.promise.then((parent) => {
      this.connection = parent;
      // console.log(window.location.href, '[Child]: connection set', parent);
    });
  }

  async trySignUsingSession(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    const signedTxHash = EIP712Signer.getSignedDigest(transaction as any);

    window.navigator.serviceWorker.controller!.postMessage({
      command: "getSessions",
      args: {
        userAccount: this.authProvider?.walletAddress,
      },
    });

    const savedSessions = await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.requestType == "getSessions") {
          // console.log('Saved sessions event', event);

          resolve(event.data);
        }
      });
    });

    // console.log('Saved sessions', savedSessions);

    for (const session of (savedSessions as {
      requestType: string;
      sessions: { allowedAddresses: string[]; sessionAddress: string }[];
    })!.sessions!) {
      if (
        session.allowedAddresses
          .map((x) => x.toLowerCase())
          .includes((transaction.to! as string).toLowerCase())
      ) {
        // console.log('Found session that can sign the transaction', session);
        // console.log('Requesting session signature...');

        window.navigator.serviceWorker.controller!.postMessage({
          command: "getSessionSignature",
          args: {
            userAccount: this.authProvider?.walletAddress,
            challenge: ethers.utils.arrayify(signedTxHash),
            sessionAddress: session.sessionAddress,
          },
        });

        const credentials = (await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data.requestType == "getSessionSignature") {
              // console.log('Resp getSessionSignature event', event);
              if (
                compareArrays(
                  event.data.challenge,
                  ethers.utils.arrayify(signedTxHash)
                )
              )
                resolve(event.data);
            }
          });
        })) as any;

        // console.log('Got signature from session', credentials);

        (transaction.customData as types.Eip712Meta).customSignature =
          credentials.signature;

        return serialize(transaction as any);
        break;
      }
    }
    throw Error("No session");
  }

  async signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    console.log("tx", transaction);

    const signedTxHash = EIP712Signer.getSignedDigest(transaction as any);

    window.navigator.serviceWorker.controller!.postMessage({
      command: "checkApprove",
      txHash: signedTxHash,
    });

    const isApprovedInWorker = await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.requestType == "checkApprove") {
          resolve(event.data.isApproved);
        }
      });
    });

    if (
      defaultNonsensitiveStorage.getPrefixedValue(
        "raisewallet.approve",
        hexlify(signedTxHash)
      ) != "true" ||
      !isApprovedInWorker
    ) {
      throw "Not approved";
    }

    const signature = await this.authProvider!.signTransaction(signedTxHash);

    (transaction.customData as types.Eip712Meta).customSignature = signature;

    return serialize(transaction as any);
  }

  async createSession(params: SessionCreationParams): Promise<string> {
    console.log(
      "Requesting service worker to create session with params",
      params
    );

    window.navigator.serviceWorker.controller!.postMessage({
      command: "createSession",
      params: {
        ...params,
        userAccount: this.authProvider?.walletAddress,
      },
    });

    const sessionAddress = await new Promise<string>((resolve) => {
      navigator.serviceWorker.addEventListener("message", (event) => {
        // console.log('Got create session resp', event);
        if (event.data.requestType == "createSession") {
          resolve(event.data.publicKey as string);
        }
      });
    });

    return sessionAddress;
  }

  async approveSession(sessionPubKey: string): Promise<boolean> {
    console.log(
      "Requesting service worker to approve session with pub key",
      sessionPubKey
    );

    window.navigator.serviceWorker.controller!.postMessage({
      command: "approveSession",
      params: { sessionPubKey },
    });

    const success = await new Promise<boolean>((resolve) => {
      navigator.serviceWorker.addEventListener("message", (event) => {
        // console.log('Got create session resp', event);
        if (event.data.requestType == "approveSession") {
          resolve(event.data.success as boolean);
        }
      });
    });

    return success;
  }
}
