import { Provider } from 'zksync-web3';
import { IAuthProvider } from './IAuthProvider';

export interface GuardianSignature {
  signature: string;
  expiresAt: number;
}

/**
 * Needs to login / signup user and create platform auth.
 * Uses events to update progress in wallet ui
 */
export interface ILoginManager extends EventTarget {
  /**
   * Auth mechanism name
   */
  authMethodName: string;
  /**
   * Is password required to create and unlock wallet
   */
  isPasswordRequired: boolean;

  /**
   * @param provider ZkSync provider to use for account deploy
   * @param email email to login to
   */
  login(provider: Provider, email: String): Promise<IAuthProvider>;
  /**
   *
   * @param provider ZkSync provider to use for account deploy
   * @param email email to sign up to
   */
  signup(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string,
  ): Promise<IAuthProvider>;

  /**
   *
   * @param provider ZkSync provider to use for account deploy
   * @param email email to sign up to
   * @param signRequestId request id from guardian
   * @param walletPassword optional password
   */
  recovery(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string,
  ): Promise<string[]>;

  /**
   *
   * @param provider ZkSync provider to use for account deploy
   * @param email email to sign up to
   * @param signRequestId request id from guardian
   * @param walletPassword optional password
   */

  connectNewDevice(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string,
  ): Promise<string[]>;
}
