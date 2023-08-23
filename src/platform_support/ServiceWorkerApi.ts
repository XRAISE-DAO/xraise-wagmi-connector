import { WebAuthnProvider } from '../platform_authenticator/WebAuthnProvider';
import {
  ServiceWorkerSupportStatus,
  serviceWorkerSupportStatus,
} from './detections';

/**
 * Communicator with service worker api. Used as sensitive info storage for RaiseAuthn
 * And as an additional layer for Webauthn if browser supports it.
 * Cases to consider:
 * - Browser supports Webauthn and webworker (most of the browsers).
 */
export class ServiceWorkerApi {
  onDecryptionStarted: () => void = () => {};
  onWalletDecryptionEnded: () => void = () => {};
  onWalletDecryptionFailed: () => void = () => {};
  onWalletDecryptionPercentChanged: (percent: number) => void = (percent) => {};

  setOnDecryptionStarted(onDecryptionStarted: () => void) {
    this.onDecryptionStarted = onDecryptionStarted;
  }

  setOnDecryptionEnded(onDecryptionEnded: () => void) {
    this.onWalletDecryptionEnded = onDecryptionEnded;
  }

  setOnDecryptionFailed(onDecryptionFailed: () => void) {
    this.onWalletDecryptionFailed = onDecryptionFailed;
  }

  setOnWalletDecryptionPercentChanged(
    onDecryptionPercentChanged: (percent: number) => void,
  ) {
    this.onWalletDecryptionPercentChanged = onDecryptionPercentChanged;
  }

  async connectRaiseauthn(): Promise<{
    isWalletEncrypted: boolean;
    isWalletSaved: boolean;
  }> {
    if (WebAuthnProvider.restore() != null)
      return new Promise<{
        isWalletEncrypted: boolean;
        isWalletSaved: boolean;
      }>((resolve) =>
        resolve({ isWalletEncrypted: false, isWalletSaved: false }),
      ); // No decyption required if we use webauthn

    const promise = new Promise<{
      isWalletEncrypted: boolean;
      isWalletSaved: boolean;
    }>((resolve) => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from worker', event);

        if (event.data.requestType == 'isWalletEncrypted')
          resolve({
            isWalletEncrypted: event.data.status as boolean,
            isWalletSaved: event.data.isWalletSaved as boolean,
          });

        if (event.data.requestType == 'get') {
          if (event.data.status == 'walletDecryptionStarted')
            this.onDecryptionStarted();

          if (event.data.status == 'walletDecryptionEnded')
            this.onWalletDecryptionEnded();

          if (event.data.status == 'walletDecryptionFailed')
            this.onWalletDecryptionFailed();

          if (event.data.status == 'decryptionPercentChanged')
            this.onWalletDecryptionPercentChanged(event.data.percent);
        }
      });
    });

    window.navigator.serviceWorker.controller!.postMessage({
      command: 'isWalletEncrypted',
    });

    return promise;
  }

  decryptWallet(password: string) {
    window.navigator.serviceWorker.controller!.postMessage({
      command: 'decryptWallet',
      password,
    });
  }

  encryptWallets() {
    // Todo: make this function async and wait for response from worker
    window.navigator.serviceWorker.controller!.postMessage({
      command: 'encryptWallets',
    });
  }

  storeTransactionApprove(txHash: string, decision: boolean) {
    if (serviceWorkerSupportStatus() == ServiceWorkerSupportStatus.Supported) {
      // If we use service worker to handle and check approve later.
      // Used if service worker is supported to make it work on Safari
      window.navigator.serviceWorker.controller?.postMessage({
        command: 'setApprove',
        txHash: txHash,
        isApproved: decision,
      });
    }
  }
}
