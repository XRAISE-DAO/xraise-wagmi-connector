import { ServiceWorkerApi } from '../platform_support/ServiceWorkerApi';
import { ethers } from 'ethers';
/**
 * Platform auth provider. Account abstracion allows to use different auth mechanisms. This interface abstracts one supported auth mechanism
 */
export interface IAuthProvider {
  /**
   * Actual user account abstraction address
   */
  walletAddress: string;
  /**
   * Auth mechanism name
   */
  authMethodName: string;
  /**
   * Is password required to create and unlock wallet
   */
  isPasswordRequired: boolean;
  /**
   * Service worker api if communucation with service worker is required
   */
  serviceWorkerApi: ServiceWorkerApi | null;
  /**
   * Auth provider can sign transactions
   * @param txHash hash to sign
   */
  signTransaction(txHash: ethers.utils.BytesLike): Promise<string>;
  /**
   * Checks is auth provider test signature is valid on blockchain
   */
  checkSignatureIsValid(): Promise<boolean>;
  /**
   * Saves auth provider data in browser
   * @param isConnected Is session saved as connected
   */
  save(isConnected: boolean): void;
  /**
   * Removes saved auth provider from browser
   */
  logout(): void;
}
