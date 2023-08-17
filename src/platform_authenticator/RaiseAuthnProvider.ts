import base64url from 'base64url';
import { utils } from 'zksync-web3';
import {
  ACCOUNT_FACTORY_ADDRESS,
  BYTES32_NULL,
  PAYMASTER_ADDRESS,
  RAISE_EMAIL_GUARDIAN_ADDRESS,
} from '@constants/index';
import * as zksync from 'zksync-web3';
import { AccountFactory } from '@abis/AccountFactory';
import { AccountFacetABI } from '@abis/AccountFacet';
import { Provider } from 'zksync-web3';
import { randomBytes } from 'crypto';
import { compareArrays, getCreateCredentialDefaultArgs, getDeviceId, NULL_ADDRESS, sleep } from '@lib/utils';
import { EVENTS } from '@lib/events';
import { IAuthProvider } from './IAuthProvider';
import { GuardianSignature, ILoginManager } from './ILoginManager';
import { ethers } from 'ethers';
import { zkSyncProvider } from '@lib/utils';
import { SocialRecoveryFacetABI } from '@abis/SocialRecoveryFacet';
import { defaultNonsensitiveStorage, DEVICE_CONNECT_CODE_PREFIX, RECOVERY_CODE_PREFIX } from '@lib/platform_support/NonSensitiveStorage';

/**
 * Raiseauthn provider. Raiseauthn is a webauthn-like protocol built using service worker api.
 * Authorizes user on blockchain and backend using raiseauthn
 */
export class RaiseAuthnProvider implements IAuthProvider {
  /**
   * zkSync provider to use
   */
  provider: Provider = zkSyncProvider;
  /**
   * Credential id that is associated with raiseauthn internal keypair used for user auth
   */
  credentialId: string;
  /**
   * User account abstraction address
   */
  walletAddress: string;
  /**
   * Auth method name
   */
  authMethodName = 'raiseauthn';

  /**
   * Password is required to unlock raiseauthn wallet
   */
  isPasswordRequired = true;

  /**
   * @param credentialId Credential id that is associated with keypair used for user auth
   * @param walletAddress User account abstraction address
   */
  constructor(credentialId: string, walletAddress: string) {
    this.walletAddress = walletAddress;
    this.credentialId = credentialId;
  }

  /**
   * Make raiseauthn signature request
   * @param txHash tx hash to sign
   * @returns raiseauthn signature request result
   */
  async sign(txHash: ethers.utils.BytesLike) {
    var id = this.credentialId;

    window.navigator.serviceWorker.controller!.postMessage({
      command: 'setCurrentCredentialId',
      credentialId: id,
    });

    window.navigator.serviceWorker.controller!.postMessage({
      command: 'getCredential',
      args: {
        publicKey: {
          rpId:
            process.env.NODE_ENV == 'production' ? 'raisepay.io' : 'localhost',
          challenge: ethers.utils.arrayify(txHash),
          timeout: 60000,
          allowCredentials: [
            {
              type: 'public-key',
              id,
            },
          ],
          userVerification: 'required',
        },
      },
    });

    const credentials = (await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.requestType == 'get') {
          if (event.data.status == 'ok') {
            if (
              compareArrays(event.data.challenge, ethers.utils.arrayify(txHash))
            )
              resolve(event.data);
          } else if (event.data.status == 'passwordNeeded') {
            console.log('Password needed');
          }
        }
      });
    })) as any;

    return credentials;
  }

  /**
   * Signs tx hash using raiseauthn internal keypair associated with user credentialId
   * @param txHash tx hash to sign
   * @returns Actual signature of tx hash
   */
  async signTransaction(txHash: ethers.utils.BytesLike): Promise<string> {
    const signature = await this.sign(txHash);
    return signature.signature;
  }

  /**
   * Deploys user account abstraction
   * @param address Address of raiseauthn internal keypair
   */
  async deployUserAccount(
    address: string,
    email: string,
    guardianAddress: string,
    signRequestId: string,
  ) {
    const wallet = zksync.Wallet.createRandom().connect(this.provider!); // Temp keypair, will sig the deploy transaction
    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: 'General',
      innerInput: new Uint8Array(),
    });

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet,
    );

    const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));

    const signResp = await fetch(`/api/signup/sign`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: signRequestId,
        loginInfo: {
          credentialId: this.credentialId,
          algoId: 0,
          publicKeyX: BYTES32_NULL,
          publicKeyY: BYTES32_NULL,
          publicAddress: address,
          deviceId: getDeviceId(),
        },
      }),
    });

    const signRespContent = await signResp.json();

    console.log('Got signature from guardian', signRespContent);

    let tx = await accountFactory.deployAccount(
      {
        credentialId: base64url.toBuffer(this.credentialId),
        algoId: 0,
        publicKeyX: BYTES32_NULL,
        publicKeyY: BYTES32_NULL,
        publicAddress: address,
        deviceId: getDeviceId(),
      },
      emailHash,
      guardianAddress,
      signRespContent.signature,
      signRespContent.expiresAt,
      {
        customData: {
          paymasterParams,
          ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      },
    );

    console.log('Account creation transaction', tx);
    const receipt = await tx.wait();
    const newAccountAddress = receipt.events.find(
      (event: any) => event.event == 'AccountCreated',
    );

    return newAccountAddress.args[0];
  }

  /**
   * @returns Is test signature result valid on blockchain
   */
  async checkSignatureIsValid(): Promise<boolean> {
    const randomHash = randomBytes(32);
    const customSignature = await this.signTransaction(randomHash);

    const wallet = zksync.Wallet.createRandom().connect(this.provider!);
    const account = new ethers.Contract(this.walletAddress!, AccountFacetABI, wallet);

    const returnedSig = await account.isValidSignature(
      randomHash,
      customSignature,
    );
    console.log('Returned sig', returnedSig);
    return returnedSig == '0x1626ba7e';
  }

  /**
   * Initiates recovery for user account
   * @returns recovery code
   */
  async initRecovery(
    address: string,
    email: string,
    guardianAddress: string,
    signRequestId: string,
  ) {
    const wallet = zksync.Wallet.createRandom().connect(this.provider!); // Temp keypair, will sig the deploy transaction

    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: 'General',
      innerInput: new Uint8Array(),
    });

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet,
    );

    const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));

    const [walletAddress, credentialId] =
      await accountFactory.getUserWalletInfo(emailHash, getDeviceId());

    console.log('Wallet address -> ', walletAddress);

    const socialRecovery = new ethers.Contract(
      walletAddress,
      SocialRecoveryFacetABI,
      wallet,
    );

    const signResp = await fetch(`/api/recovery/sign`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: signRequestId,
        loginInfo: {
          credentialId: this.credentialId,
          algoId: 0,
          publicKeyX: BYTES32_NULL,
          publicKeyY: BYTES32_NULL,
          publicAddress: address,
          deviceId: getDeviceId(),
        },
      }),
    });

    const signRespContent = await signResp.json();

    console.log('Got signature from guardian', signRespContent);

    const gasLimit = await socialRecovery.estimateGas.initRecovery(
      {
        credentialId: this.credentialId,
        algoId: 0,
        publicKeyX: BYTES32_NULL,
        publicKeyY: BYTES32_NULL,
        publicAddress: address,
        deviceId: getDeviceId(),
      },
      [guardianAddress],
      [signRespContent.signature],
      [signRespContent.expiresAt],
      {
        customData: {
          ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      },
    );

    const gasPrice = await this.provider.getGasPrice();
    const fee = gasPrice.mul(gasLimit.toString());

    let tx = await socialRecovery.initRecovery(
      {
        credentialId: this.credentialId,
        algoId: 0,
        publicKeyX: BYTES32_NULL,
        publicKeyY: BYTES32_NULL,
        publicAddress: address,
        deviceId: getDeviceId(),
      },
      [RAISE_EMAIL_GUARDIAN_ADDRESS],
      [signRespContent.signature],
      [signRespContent.expiresAt],
      {
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        customData: {
          paymasterParams,
          ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
        gasLimit,
      },
    );

    console.log('Recovery tx', tx);
    const receipt = await tx.wait();
    const recoveryCode = receipt.events.find(
      (event: any) => event.event == 'RecoveryInit',
    );

    const recoveryIdString = ethers.utils.toUtf8String(recoveryCode.args[3]);

    console.log('Recovery code -> ', recoveryIdString);

    defaultNonsensitiveStorage.storeObject(RECOVERY_CODE_PREFIX, { address, recoveryId: recoveryIdString });

    return [recoveryIdString, walletAddress];
  }

  /**
   * Initiates new device connection for existed account
   * @returns recovery code
   */
  async connectNewDevice(
    address: string,
    email: string,
    guardianAddress: string,
    signRequestId: string,
  ) {
    const wallet = zksync.Wallet.createRandom().connect(this.provider!); // Temp keypair, will sig the deploy transaction

    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: 'General',
      innerInput: new Uint8Array(),
    });

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet,
    );

    const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));

    const [walletAddress, credentialId] =
      await accountFactory.getUserWalletInfo(emailHash, getDeviceId());

    console.log('Wallet address -> ', walletAddress);

    const accountFacet = new ethers.Contract(
      walletAddress,
      AccountFacetABI,
      wallet,
    );

    const signResp = await fetch(`/api/device_connect/sign`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: signRequestId,
        loginInfo: {
          credentialId: this.credentialId,
          algoId: 0,
          publicKeyX: BYTES32_NULL,
          publicKeyY: BYTES32_NULL,
          publicAddress: address,
          deviceId: getDeviceId(),
        },
      }),
    });

    const signRespContent = await signResp.json();

    console.log('Got signature from guardian', signRespContent);

    let tx = await accountFacet.connectDevice(
      {
        credentialId: this.credentialId,
        algoId: 0,
        publicKeyX: BYTES32_NULL,
        publicKeyY: BYTES32_NULL,
        publicAddress: address,
        deviceId: getDeviceId(),
      },
      [RAISE_EMAIL_GUARDIAN_ADDRESS],
      [signRespContent.signature],
      [signRespContent.expiresAt],
      {
        customData: {
          paymasterParams,
          ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      },
    );

    console.log('Connect tx', tx);
    const receipt = await tx.wait();
    const connectionCode = receipt.events.find(
      (event: any) => event.event == 'DeviceConnectionInit',
    );

    const connectionIdString = ethers.utils.toUtf8String(connectionCode.args[1]);

    console.log('Connection code -> ', connectionIdString);

    defaultNonsensitiveStorage.storeObject(DEVICE_CONNECT_CODE_PREFIX, { address, recoveryId: connectionIdString });

    return [connectionIdString, walletAddress];
  }

  /**
   * Save current raiseauthn session data
   * @param isConnected Is session marked as connected
   */
  save(isConnected: boolean) {
    defaultNonsensitiveStorage.storeValue('authType', 'RaiseAuthn');
    defaultNonsensitiveStorage.storeValue('credentialId', this.credentialId);
    defaultNonsensitiveStorage.storeValue('address', this.walletAddress);
    defaultNonsensitiveStorage.storeValue('connected', isConnected ? 'true' : 'false');
  }

  /**
   * Restore raiseauthn session from saved
   * @returns Raiseauthn provider if restorable
   */
  static async restore(): Promise<RaiseAuthnProvider | null> {

    const authType = defaultNonsensitiveStorage.getValue('authType');
    const connected = defaultNonsensitiveStorage.getValue('connected');
    const credentialId = defaultNonsensitiveStorage.getValue('credentialId');
    const address = defaultNonsensitiveStorage.getValue('address');

    if (credentialId) {
      window.navigator.serviceWorker.controller!.postMessage({
        command: 'setCurrentCredentialId',
        credentialId,
      });
    }

    if (
      connected != 'true' ||
      !credentialId ||
      !address ||
      authType != 'RaiseAuthn'
    )
      return null;
    return new RaiseAuthnProvider(credentialId, address);
  }

  /**
   * Removes saved auth session
   */
  logout() {
    defaultNonsensitiveStorage.removeAll('connected', 'credentialId', 'address', 'authType');
  }
}

/**
 * Login manager. Intended to create raiseauthn provider using login / signup
 */
export class RaiseAuthnProviderLoginManager
  extends EventTarget
  implements ILoginManager {
  private _loginAttempt: Event = new Event(EVENTS.LOGIN_ATTEMPT);
  private _loginSuccess: Event = new Event(EVENTS.LOGIN_SUCCESS);
  private _loginFail: Event = new Event(EVENTS.LOGIN_FAIL);

  private _signupAttempt: Event = new Event(EVENTS.SIGNUP_ATTEMPT);
  private _signupKeypair: Event = new Event(
    EVENTS.SIGNUP_CREDENTIAL_GENERATION,
  );
  private _signupCredentialCreationSuccess: Event = new Event(
    EVENTS.SIGNUP_CREDENTIAL_SUCCESS,
  );
  private _signupAccountAbstractionGenerated: Event = new Event(
    EVENTS.SIGNUP_ACCOUNT_GENERATED,
  );

  private _signupAccountVerified: Event = new Event(
    EVENTS.SIGNUP_ACCOUNT_VERIFIED,
  );

  private _loginSignatureVerification: Event = new Event(
    EVENTS.LOGIN_SIGNATURE_VERIFICATION,
  );

  private _signupSuccess: Event = new Event(EVENTS.SIGNUP_SUCCESS);
  private _signupFail: Event = new Event(EVENTS.SIGNUP_FAIL);

  constructor() {
    super();
  }

  /**
   * Auth method name
   */
  authMethodName = 'raiseauthn';

  /**
   * Password is required to unlock raiseauthn wallet
   */
  isPasswordRequired = true;

  /**
   * @param provider zkSync provider to access blockchain
   * @param email Email used to login
   * @returns Auth provider
   */
  async login(provider: Provider, email: string): Promise<RaiseAuthnProvider> {
    // If recovery code saved, we'll drop it
    defaultNonsensitiveStorage.remove(RECOVERY_CODE_PREFIX);

    this.dispatchEvent(this._loginAttempt);
    if (!email) {
      throw new Error('No email');
    }

    const wallet = zksync.Wallet.createRandom().connect(provider); // Temp keypair, will sig the deploy transaction

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet,
    );

    const [walletAddress, credentialId] =
      await accountFactory.getUserWalletInfo(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email)),
        getDeviceId(),
      );
    const decodedCredentialId = base64url.encode(
      Buffer.from(ethers.utils.arrayify(credentialId)),
    );
    if (walletAddress == NULL_ADDRESS) {
      this.dispatchEvent(this._loginFail);
      throw new Error('User not registered');
    }

    const authProvider = new RaiseAuthnProvider(
      decodedCredentialId,
      walletAddress,
    );
    this.dispatchEvent(this._loginSignatureVerification);
    return authProvider;
  }
  /**
   *
   * @param provider ZkSync used to deploy user account
   * @param email Email to sign up to
   * @returns Raiseauthn auth provider
   */
  async signup(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string,
  ): Promise<RaiseAuthnProvider> {
    // If recovery code saved, we'll drop it
    defaultNonsensitiveStorage.remove(RECOVERY_CODE_PREFIX);

    try {
      if (!email) {
        throw new Error('No email');
      }

      defaultNonsensitiveStorage.storeValue('lastEmail', email);

      const challenge = randomBytes(32);

      let createCredentialDefaultArgs: CredentialCreationOptions = getCreateCredentialDefaultArgs(challenge, email);

      this.dispatchEvent(this._signupKeypair);

      window.navigator.serviceWorker.controller!.postMessage({
        command: 'createCredential',
        args: createCredentialDefaultArgs,
        password: walletPassword,
      });

      const credentials = (await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('message', (event) => {
          /// @todo event.data.challenge null in some cases – investigate.
          console.log('Listened event', event);
          if (
            event.data.challenge != null &&
            compareArrays(event.data.challenge, challenge)
          ) {
            resolve(event.data);
          }
        });
      })) as any;

      console.log('Event data', credentials);

      const credentialId = credentials.id;

      this.dispatchEvent(this._signupCredentialCreationSuccess);

      const abiCoder = new ethers.utils.AbiCoder();
      const ACCOUNT_DEPLOYMENT_SALT = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(email),
      );

      const wallet = zksync.Wallet.createRandom().connect(provider); // Temp keypair, will sig the deploy transaction
      const accountFactory = new ethers.Contract(
        ACCOUNT_FACTORY_ADDRESS,
        AccountFactory,
        wallet,
      );

      const accountAddress = utils.create2Address(
        ACCOUNT_FACTORY_ADDRESS,
        await accountFactory.aaBytecodeHash(),
        ACCOUNT_DEPLOYMENT_SALT,
        abiCoder.encode(
          [
            'bytes32',
            'int256',
            'bytes32',
            'bytes32',
            'address',
            'uint32',
            'address',
          ],
          [
            base64url.toBuffer(credentialId),
            0,
            BYTES32_NULL,
            BYTES32_NULL,
            credentials.publicKey,
            getDeviceId(),
            RAISE_EMAIL_GUARDIAN_ADDRESS,
          ],
        ),
      );

      const walletAddress = accountAddress;
      this.dispatchEvent(this._signupAccountAbstractionGenerated);

      const authProvider = new RaiseAuthnProvider(credentialId, walletAddress);
      // this.dispatchEvent(this._signupAccountVerified);
      const newAccountAddress = await authProvider.deployUserAccount(
        credentials.publicKey,
        email,
        RAISE_EMAIL_GUARDIAN_ADDRESS,
        signRequestId,
      );

      authProvider.walletAddress = newAccountAddress;
      authProvider.save(true);

      this.dispatchEvent(this._signupSuccess);
      // wait 1sec for nicer UI
      await sleep(1000);

      return authProvider;
    } catch (err) {
      console.error(err);
      this.dispatchEvent(this._signupFail);
      throw new Error(`[RaiseAuthnSigner]: ${err}`);
    }
  }

  // @todo update events to the actual for recovery UI
  /**
   *
   * @param provider ZkSync used to deploy user account
   * @param email Email to sign up to
   * @returns Raiseauthn auth provider
   */
  async recovery(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string,
  ): Promise<string[]> {
    try {
      if (!email) {
        throw new Error('No email');
      }

      defaultNonsensitiveStorage.storeValue('lastEmail', email);

      const challenge = randomBytes(32);

      let createCredentialDefaultArgs: CredentialCreationOptions = getCreateCredentialDefaultArgs(challenge, email);

      this.dispatchEvent(this._signupKeypair);

      window.navigator.serviceWorker.controller!.postMessage({
        command: 'createCredential',
        args: createCredentialDefaultArgs,
        password: walletPassword,
      });

      const credentials = (await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('message', (event) => {
          /// @todo event.data.challenge null in some cases – investigate
          console.log('Lisened event', event);
          console.log(
            'Lisened event',
            event,
            compareArrays(event.data.challenge, challenge),
            event.data.challenge,
            createCredentialDefaultArgs.publicKey!.challenge,
          );

          if (compareArrays(event.data.challenge, challenge))
            resolve(event.data);
        });
      })) as any;

      console.log('Event data', credentials);

      const credentialId = credentials.id;

      this.dispatchEvent(this._signupCredentialCreationSuccess);

      const abiCoder = new ethers.utils.AbiCoder();
      const ACCOUNT_DEPLOYMENT_SALT = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(email),
      );

      const wallet = zksync.Wallet.createRandom().connect(provider); // Temp keypair, will sig the deploy transaction
      const accountFactory = new ethers.Contract(
        ACCOUNT_FACTORY_ADDRESS,
        AccountFactory,
        wallet,
      );

      const accountAddress = utils.create2Address(
        ACCOUNT_FACTORY_ADDRESS,
        await accountFactory.aaBytecodeHash(),
        ACCOUNT_DEPLOYMENT_SALT,
        abiCoder.encode(
          [
            'bytes32',
            'int256',
            'bytes32',
            'bytes32',
            'address',
            'uint32',
            'address',
          ],
          [
            base64url.toBuffer(credentialId),
            0,
            BYTES32_NULL,
            BYTES32_NULL,
            credentials.publicKey,
            getDeviceId(),
            RAISE_EMAIL_GUARDIAN_ADDRESS,
          ],
        ),
      );

      const walletAddress = accountAddress;
      this.dispatchEvent(this._signupAccountAbstractionGenerated);

      const authProvider = new RaiseAuthnProvider(credentialId, walletAddress);
      // this.dispatchEvent(this._signupAccountVerified);
      const [recoveryCode, addressToRecover] = await authProvider.initRecovery(
        credentials.publicKey,
        email,
        RAISE_EMAIL_GUARDIAN_ADDRESS,
        signRequestId,
      );

      this.dispatchEvent(this._signupSuccess);
      // wait 1sec for nicer UI
      await sleep(1000);

      return [recoveryCode, addressToRecover];
    } catch (err) {
      console.error(err);
      this.dispatchEvent(this._signupFail);
      throw new Error(`[RaiseAuthnSigner]: ${err}`);
    }
  }


  // @todo update events to the actual for recovery UI
  /**
   *
   * @param provider ZkSync used to deploy user account
   * @param email Email to sign up to
   * @returns Raiseauthn auth provider
   */
  async connectNewDevice(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string,
  ): Promise<string[]> {
    try {
      if (!email) {
        throw new Error('No email');
      }

      defaultNonsensitiveStorage.storeValue('lastEmail', email);

      const challenge = randomBytes(32);

      let createCredentialDefaultArgs: CredentialCreationOptions = getCreateCredentialDefaultArgs(challenge, email);

      this.dispatchEvent(this._signupKeypair);

      window.navigator.serviceWorker.controller!.postMessage({
        command: 'createCredential',
        args: createCredentialDefaultArgs,
        password: walletPassword,
      });

      const credentials = (await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('message', (event) => {
          /// @todo event.data.challenge null in some cases – investigate
          console.log('Lisened event', event);
          console.log(
            'Lisened event',
            event,
            compareArrays(event.data.challenge, challenge),
            event.data.challenge,
            createCredentialDefaultArgs.publicKey!.challenge,
          );

          if (compareArrays(event.data.challenge, challenge))
            resolve(event.data);
        });
      })) as any;

      console.log('Event data', credentials);

      const credentialId = credentials.id;

      this.dispatchEvent(this._signupCredentialCreationSuccess);

      const abiCoder = new ethers.utils.AbiCoder();
      const ACCOUNT_DEPLOYMENT_SALT = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(email),
      );

      const wallet = zksync.Wallet.createRandom().connect(provider); // Temp keypair, will sig the deploy transaction
      const accountFactory = new ethers.Contract(
        ACCOUNT_FACTORY_ADDRESS,
        AccountFactory,
        wallet,
      );

      const accountAddress = utils.create2Address(
        ACCOUNT_FACTORY_ADDRESS,
        await accountFactory.aaBytecodeHash(),
        ACCOUNT_DEPLOYMENT_SALT,
        abiCoder.encode(
          [
            'bytes32',
            'int256',
            'bytes32',
            'bytes32',
            'address',
            'uint32',
            'address',
          ],
          [
            base64url.toBuffer(credentialId),
            0,
            BYTES32_NULL,
            BYTES32_NULL,
            credentials.publicKey,
            getDeviceId(),
            RAISE_EMAIL_GUARDIAN_ADDRESS,
          ],
        ),
      );

      const walletAddress = accountAddress;
      this.dispatchEvent(this._signupAccountAbstractionGenerated);

      const authProvider = new RaiseAuthnProvider(credentialId, walletAddress);
      // this.dispatchEvent(this._signupAccountVerified);
      const [recoveryCode, addressToRecover] = await authProvider.connectNewDevice(
        credentials.publicKey,
        email,
        RAISE_EMAIL_GUARDIAN_ADDRESS,
        signRequestId,
      );

      this.dispatchEvent(this._signupSuccess);
      // wait 1sec for nicer UI
      await sleep(1000);

      return [recoveryCode, addressToRecover];
    } catch (err) {
      console.error(err);
      this.dispatchEvent(this._signupFail);
      throw new Error(`[RaiseAuthnSigner]: ${err}`);
    }
  }
}
