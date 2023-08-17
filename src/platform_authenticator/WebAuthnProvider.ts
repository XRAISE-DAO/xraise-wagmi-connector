"use client";

import base64url from "base64url";
import { ethers } from "ethers";
import { utils } from "zksync-web3";
import {
  ACCOUNT_FACTORY_ADDRESS,
  PAYMASTER_ADDRESS,
  RAISE_EMAIL_GUARDIAN_ADDRESS,
} from "../constants/index";
import * as zksync from "zksync-web3";
import { AccountFactory } from "../abis/AccountFactory";
import { AccountFacetABI } from "../abis/AccountFacet";
import { Provider } from "zksync-web3";
import { randomBytes } from "crypto";
import {
  getCreateCredentialDefaultArgs,
  getDeviceId,
  NULL_ADDRESS,
  parseAuthData,
  sleep,
} from "../utils";
import { EVENTS } from "../events";
import { IAuthProvider } from "./IAuthProvider";
import { ILoginManager } from "./ILoginManager";
import { zeroPad } from "ethers/lib/utils.js";
import { zkSyncProvider } from "../utils";
import { SocialRecoveryFacetABI } from "../abis/SocialRecoveryFacet";
import {
  defaultNonsensitiveStorage,
  DEVICE_CONNECT_CODE_PREFIX,
  RECOVERY_CODE_PREFIX,
} from "../platform_support/NonSensitiveStorage";

/**
 * Webauthn provider. Authorizes user on blockchain and backend using webauthn
 */
export class WebAuthnProvider implements IAuthProvider {
  /**
   * zkSync provider to use
   */
  provider: Provider = zkSyncProvider;
  /**
   * Credential id that is associated with webauthn internal keypair used for user auth
   */
  credentialId: string;
  /**
   * User account abstraction address
   */
  walletAddress: string;
  /**
   * Auth method name
   */
  authMethodName = "webauthn";

  /**
   * Password is required to use webauthn wallet
   */
  isPasswordRequired = false;

  /**
   * @param credentialId Credential id that is associated with keypair used for user auth
   * @param walletAddress User account abstraction address
   */
  constructor(credentialId: string, walletAddress: string) {
    this.walletAddress = walletAddress;
    this.credentialId = credentialId;
  }

  /**
   * Make webauthn signature request
   * @param txHash tx hash to sign
   * @returns webauthn signature request result
   */
  async sign(txHash: ethers.utils.BytesLike) {
    var id = base64url.toBuffer(this.credentialId);

    return (await navigator.credentials.get({
      publicKey: {
        rpId:
          process.env.NODE_ENV == "production" ? "raisepay.io" : "localhost",
        challenge: ethers.utils.arrayify(txHash),
        timeout: 60000,
        allowCredentials: [
          {
            type: "public-key",
            id,
          },
        ],
        userVerification: "required",
      },
    })) as unknown as PublicKeyCredential & {
      response: AuthenticatorAssertionResponse;
    };
  }

  /**
   * Signs tx hash using webauthn internal keypair associated with user credentialId
   * @param txHash tx hash to sign
   * @returns Actual signature of tx hash
   */
  async signTransaction(txHash: ethers.utils.BytesLike): Promise<string> {
    const signature = await this.sign(txHash);

    const webnSignature = Buffer.from(signature.response.signature);
    const webnClientJson = Buffer.from(signature.response.clientDataJSON);
    const webnAuthData = Buffer.from(signature.response.authenticatorData);
    const abiCoder = new ethers.utils.AbiCoder();

    const customSignature = abiCoder.encode(
      ["bytes", "bytes", "bytes", "uint256", "uint32"],
      [
        webnSignature,
        webnClientJson,
        webnAuthData,
        webnClientJson.indexOf('"challenge":'),
        getDeviceId(),
      ]
    );
    return customSignature;
  }

  /**
   * Deploys user account abstraction
   * @param publicKeyX Webauthn public key x part
   * @param publicKeyY Webauthn public key y part
   * @returns new account address
   */
  async deployUserAccount(
    algoId: number,
    publicKeyX: string,
    publicKeyY: string,
    email: string,
    guardianAddress: string,
    signRequestId: string
  ) {
    const wallet = zksync.Wallet.createRandom().connect(this.provider!); // Temp keypair, will sig the deploy transaction

    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: "General",
      innerInput: new Uint8Array(),
    });

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet
    );

    const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));

    const signResp = await fetch(`/api/signup/sign`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: signRequestId,
        loginInfo: {
          credentialId: this.credentialId,
          algoId,
          publicKeyX,
          publicKeyY,
          publicAddress: "0x0000000000000000000000000000000000000000",
          deviceId: getDeviceId(),
        },
      }),
    });

    const signRespContent = await signResp.json();

    console.log("Got signature from guardian", signRespContent);

    const gasLimit = await accountFactory.estimateGas.deployAccount(
      {
        credentialId: zeroPad(base64url.toBuffer(this.credentialId), 32),
        algoId,
        publicKeyX,
        publicKeyY,
        publicAddress: NULL_ADDRESS,
        deviceId: getDeviceId(),
      },
      emailHash,
      guardianAddress,
      signRespContent.signature,
      signRespContent.expiresAt,
      {
        customData: {
          ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      }
    );

    const gasPrice = await this.provider.getGasPrice();
    const fee = gasPrice.mul(gasLimit.toString());

    let tx = await accountFactory.deployAccount(
      {
        credentialId: zeroPad(base64url.toBuffer(this.credentialId), 32),
        algoId,
        publicKeyX,
        publicKeyY,
        publicAddress: NULL_ADDRESS,
        deviceId: getDeviceId(),
      },
      emailHash,
      RAISE_EMAIL_GUARDIAN_ADDRESS,
      signRespContent.signature,
      signRespContent.expiresAt,
      {
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        customData: {
          paymasterParams,
          ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
        gasLimit,
      }
    );

    console.log("Account creation transaction", tx);
    const receipt = await tx.wait();
    const newAccountAddress = receipt.events.find(
      (event: any) => event.event == "AccountCreated"
    );

    return newAccountAddress.args[0];
  }

  /**
   * @returns Is test signature result valid on blockchain
   */
  async checkSignatureIsValid(): Promise<boolean> {
    console.log("Checking signature is valid");
    const randomHash = randomBytes(32);
    const customSignature = await this.signTransaction(randomHash);
    const wallet = zksync.Wallet.createRandom().connect(this.provider!);
    const account = new ethers.Contract(
      this.walletAddress!,
      AccountFacetABI,
      wallet
    );

    const returnedSig = await account.isValidSignature(
      randomHash,
      customSignature
    );
    console.log("Returned sig", returnedSig);
    return returnedSig == "0x1626ba7e";
  }

  /**
   * Initiates recovery for user account
   * @param publicKeyX Webauthn public key x part
   * @param publicKeyY Webauthn public key y part
   * @returns recovery code
   */
  async initRecovery(
    algoId: number,
    publicKeyX: string,
    publicKeyY: string,
    email: string,
    guardianAddress: string,
    signRequestId: string
  ) {
    const wallet = zksync.Wallet.createRandom().connect(this.provider!); // Temp keypair, will sig the deploy transaction

    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: "General",
      innerInput: new Uint8Array(),
    });

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet
    );

    const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));

    const [walletAddress, credentialId] =
      await accountFactory.getUserWalletInfo(emailHash, getDeviceId());

    const socialRecovery = new ethers.Contract(
      walletAddress,
      SocialRecoveryFacetABI,
      wallet
    );

    const signResp = await fetch(`/api/recovery/sign`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: signRequestId,
        loginInfo: {
          credentialId: this.credentialId,
          algoId,
          publicKeyX: publicKeyX,
          publicKeyY: publicKeyY,
          publicAddress: "0x0000000000000000000000000000000000000000",
          deviceId: getDeviceId(),
        },
      }),
    });

    const signRespContent = await signResp.json();

    console.log("Got signature for recovery from guardian", signRespContent);
    console.log("Guardian address", guardianAddress);

    const gasLimit = await socialRecovery.estimateGas.initRecovery(
      {
        credentialId: zeroPad(base64url.toBuffer(this.credentialId), 32),
        algoId,
        publicKeyX,
        publicKeyY,
        publicAddress: NULL_ADDRESS,
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
      }
    );

    const gasPrice = await this.provider.getGasPrice();
    const fee = gasPrice.mul(gasLimit.toString());

    let tx = await socialRecovery.initRecovery(
      {
        credentialId: zeroPad(base64url.toBuffer(this.credentialId), 32),
        algoId,
        publicKeyX,
        publicKeyY,
        publicAddress: NULL_ADDRESS,
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
      }
    );

    console.log("Recovery tx", tx);
    const receipt = await tx.wait();
    const recoveryCode = receipt.events.find(
      (event: any) => event.event == "RecoveryInit"
    );

    const recoveryIdString = ethers.utils.toUtf8String(recoveryCode.args[3]);

    defaultNonsensitiveStorage.storeObject(RECOVERY_CODE_PREFIX, {
      address: walletAddress,
      recoveryId: recoveryIdString,
    });

    return [recoveryIdString, walletAddress];
  }

  /**
   * Initiates recovery for user account
   * @param publicKeyX Webauthn public key x part
   * @param publicKeyY Webauthn public key y part
   * @returns recovery code
   */
  async connectNewDevice(
    algoId: number,
    publicKeyX: string,
    publicKeyY: string,
    email: string,
    guardianAddress: string,
    signRequestId: string
  ) {
    const wallet = zksync.Wallet.createRandom().connect(this.provider!); // Temp keypair, will sig the deploy transaction

    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: "General",
      innerInput: new Uint8Array(),
    });

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet
    );

    const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));

    const [walletAddress, credentialId] =
      await accountFactory.getUserWalletInfo(emailHash, getDeviceId());

    const accountFacet = new ethers.Contract(
      walletAddress,
      AccountFacetABI,
      wallet
    );

    const signResp = await fetch(`/api/device_connect/sign`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: signRequestId,
        loginInfo: {
          credentialId: this.credentialId,
          algoId,
          publicKeyX,
          publicKeyY,
          publicAddress: "0x0000000000000000000000000000000000000000",
          deviceId: getDeviceId(),
        },
      }),
    });

    const signRespContent = await signResp.json();

    console.log("Got signature for recovery from guardian", signRespContent);
    console.log("Guardian address", guardianAddress);

    let tx = await accountFacet.connectNewDevice(
      {
        credentialId: zeroPad(base64url.toBuffer(this.credentialId), 32),
        algoId,
        publicKeyX,
        publicKeyY,
        publicAddress: NULL_ADDRESS,
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
      }
    );

    console.log("Connect tx", tx);
    const receipt = await tx.wait();
    const recoveryCode = receipt.events.find(
      (event: any) => event.event == "DeviceConnectionInit"
    );

    const connectionIdString = ethers.utils.toUtf8String(recoveryCode.args[1]);

    defaultNonsensitiveStorage.storeObject(DEVICE_CONNECT_CODE_PREFIX, {
      address: walletAddress,
      recoveryId: connectionIdString,
    });

    return [connectionIdString, walletAddress];
  }

  /**
   * Save current webauthn session data
   * @param isConnected Is session marked as connected
   */
  save(isConnected: boolean) {
    defaultNonsensitiveStorage.storeValue("authType", "ES256");
    defaultNonsensitiveStorage.storeValue("credentialId", this.credentialId);
    defaultNonsensitiveStorage.storeValue("address", this.walletAddress);
    defaultNonsensitiveStorage.storeValue(
      "connected",
      isConnected ? "true" : "false"
    );
  }

  /**
   * Restore raiseauthn session from saved
   * @returns Webauthn provider if restorable
   */
  static restore(): WebAuthnProvider | null {
    const authType = defaultNonsensitiveStorage.getValue("authType");
    const connected = defaultNonsensitiveStorage.getValue("connected");
    const credentialId = defaultNonsensitiveStorage.getValue("credentialId");
    const address = defaultNonsensitiveStorage.getValue("address");

    if (connected != "true" || !credentialId || !address || authType != "ES256")
      return null;
    return new WebAuthnProvider(credentialId, address);
  }

  /**
   * Removes saved auth session
   */
  logout() {
    defaultNonsensitiveStorage.removeAll(
      "connected",
      "credentialId",
      "address",
      "authType"
    );
  }
}

/**
 * Login manager. Intended to create raiseauthn provider using login / signup
 */
export class WebAuthnProviderLoginManager
  extends EventTarget
  implements ILoginManager
{
  private _loginAttempt: Event = new Event(EVENTS.LOGIN_ATTEMPT);
  private _loginSuccess: Event = new Event(EVENTS.LOGIN_SUCCESS);
  private _loginFail: Event = new Event(EVENTS.LOGIN_FAIL);

  private _signupAttempt: Event = new Event(EVENTS.SIGNUP_ATTEMPT);
  private _signupKeypair: Event = new Event(
    EVENTS.SIGNUP_CREDENTIAL_GENERATION
  );
  private _signupCredentialCreationSuccess: Event = new Event(
    EVENTS.SIGNUP_CREDENTIAL_SUCCESS
  );
  private _signupAccountAbstractionGenerated: Event = new Event(
    EVENTS.SIGNUP_ACCOUNT_GENERATED
  );

  private _signupAccountVerified: Event = new Event(
    EVENTS.SIGNUP_ACCOUNT_VERIFIED
  );

  private _loginSignatureVerification: Event = new Event(
    EVENTS.LOGIN_SIGNATURE_VERIFICATION
  );

  private _signupSuccess: Event = new Event(EVENTS.SIGNUP_SUCCESS);
  private _signupFail: Event = new Event(EVENTS.SIGNUP_FAIL);

  constructor() {
    super();
  }

  /**
   * Auth method name
   */
  authMethodName = "webauthn";

  /**
   * Password is required to use webauthn wallet
   */
  isPasswordRequired = false;

  /**
   * @param provider zkSync provider to access blockchain
   * @param email Email used to login
   * @returns Auth provider
   */
  async login(provider: Provider, email: string): Promise<WebAuthnProvider> {
    // If recovery code saved, we'll drop it
    defaultNonsensitiveStorage.remove(RECOVERY_CODE_PREFIX);

    this.dispatchEvent(this._loginAttempt);
    if (!email) {
      throw new Error("No email");
    }
    const wallet = zksync.Wallet.createRandom().connect(provider); // Temp keypair, will sig the deploy transaction

    const accountFactory = new ethers.Contract(
      ACCOUNT_FACTORY_ADDRESS,
      AccountFactory,
      wallet
    );

    const [walletAddress, credentialId] =
      await accountFactory.getUserWalletInfo(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email)),
        getDeviceId()
      );
    const decodedCredentialId = base64url.encode(
      Buffer.from(ethers.utils.arrayify(credentialId))
    );
    if (walletAddress == NULL_ADDRESS) {
      this.dispatchEvent(this._loginFail);
      throw new Error("User not registered");
    }

    const authProvider = new WebAuthnProvider(
      decodedCredentialId,
      walletAddress
    );
    this.dispatchEvent(this._loginSignatureVerification);
    return authProvider;
  }

  /**
   *
   * @param provider ZkSync used to deploy user account
   * @param email Email to sign up to
   * @returns Webauthn auth provider
   */
  async signup(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string
  ): Promise<WebAuthnProvider> {
    // If recovery code saved, we'll drop it
    defaultNonsensitiveStorage.remove(RECOVERY_CODE_PREFIX);

    try {
      if (!email) {
        throw new Error("No email");
      }

      const challenge = randomBytes(32);

      let createCredentialDefaultArgs: CredentialCreationOptions =
        getCreateCredentialDefaultArgs(challenge, email);

      this.dispatchEvent(this._signupKeypair);

      const credentials = (await navigator.credentials.create(
        createCredentialDefaultArgs
      )) as PublicKeyCredential & {
        response: AuthenticatorAttestationResponse & {
          getPublicKey(): ArrayBuffer | null;
        };
      };

      const credentialId = credentials.id;
      console.log("Signup credential id", credentialId);

      this.dispatchEvent(this._signupCredentialCreationSuccess);

      const { arg1, arg2, algoId } = parseAuthData(
        credentials.response.attestationObject
      );

      const walletAddress = NULL_ADDRESS;
      this.dispatchEvent(this._signupAccountAbstractionGenerated);

      const authProvider = new WebAuthnProvider(credentialId, walletAddress);
      // this.dispatchEvent(this._signupAccountVerified);

      const newWalletAddress = await authProvider.deployUserAccount(
        algoId,
        arg1,
        arg2,
        email,
        RAISE_EMAIL_GUARDIAN_ADDRESS,
        signRequestId
      );

      authProvider.walletAddress = newWalletAddress;

      authProvider.save(true);

      this.dispatchEvent(this._signupSuccess);
      // wait 1sec for nicer UI
      await sleep(1000);

      return authProvider;
    } catch (err) {
      console.error(err);
      this.dispatchEvent(this._signupFail);
      throw new Error(`[WebAuthnSigner]: ${err}`);
    }
  }

  // @todo Fix events for actual UI
  /**
   *
   * @param provider ZkSync used to deploy user account
   * @param email Email to sign up to
   * @returns Webauthn auth provider
   */
  async recovery(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string
  ): Promise<string[]> {
    try {
      if (!email) {
        throw new Error("No email");
      }

      const challenge = randomBytes(32);

      let createCredentialDefaultArgs: CredentialCreationOptions =
        getCreateCredentialDefaultArgs(challenge, email);
      this.dispatchEvent(this._signupKeypair);

      const credentials = (await navigator.credentials.create(
        createCredentialDefaultArgs
      )) as PublicKeyCredential & {
        response: AuthenticatorAttestationResponse & {
          getPublicKey(): ArrayBuffer | null;
        };
      };

      const credentialId = credentials.id;
      console.log("Restore credential id", credentialId);

      this.dispatchEvent(this._signupCredentialCreationSuccess);

      const { arg1, arg2, algoId } = parseAuthData(
        credentials.response.attestationObject
      );

      const walletAddress = NULL_ADDRESS;
      this.dispatchEvent(this._signupAccountAbstractionGenerated);

      const authProvider = new WebAuthnProvider(credentialId, walletAddress);
      // this.dispatchEvent(this._signupAccountVerified);

      const [recoveryCode, accAddress] = await authProvider.initRecovery(
        algoId,
        arg1,
        arg2,
        email,
        RAISE_EMAIL_GUARDIAN_ADDRESS,
        signRequestId
      ); // @todo Pass recovery code to the UI maybe using custom event

      // authProvider.walletAddress = newWalletAddress;

      this.dispatchEvent(this._signupSuccess);
      // wait 1sec for nicer UI
      await sleep(1000);

      return [recoveryCode, accAddress];
    } catch (err) {
      console.error(err);
      this.dispatchEvent(this._signupFail);
      throw new Error(`[WebAuthnSigner]: ${err}`);
    }
  }

  // @todo Fix events for actual UI
  /**
   *
   * @param provider ZkSync used to deploy user account
   * @param email Email to sign up to
   * @returns Webauthn auth provider
   */
  async connectNewDevice(
    provider: Provider,
    email: string,
    signRequestId: string,
    walletPassword?: string
  ): Promise<string[]> {
    try {
      if (!email) {
        throw new Error("No email");
      }

      const challenge = randomBytes(32);

      let createCredentialDefaultArgs: CredentialCreationOptions =
        getCreateCredentialDefaultArgs(challenge, email);

      this.dispatchEvent(this._signupKeypair);

      const credentials = (await navigator.credentials.create(
        createCredentialDefaultArgs
      )) as PublicKeyCredential & {
        response: AuthenticatorAttestationResponse & {
          getPublicKey(): ArrayBuffer | null;
        };
      };

      const credentialId = credentials.id;
      console.log("Restore credential id", credentialId);

      this.dispatchEvent(this._signupCredentialCreationSuccess);

      const { arg1, arg2, algoId } = parseAuthData(
        credentials.response.attestationObject
      );

      const walletAddress = NULL_ADDRESS;
      this.dispatchEvent(this._signupAccountAbstractionGenerated);

      const authProvider = new WebAuthnProvider(credentialId, walletAddress);
      // this.dispatchEvent(this._signupAccountVerified);

      const [recoveryCode, accAddress] = await authProvider.connectNewDevice(
        algoId,
        arg1,
        arg2,
        email,
        RAISE_EMAIL_GUARDIAN_ADDRESS,
        signRequestId
      );

      // authProvider.walletAddress = newWalletAddress;

      this.dispatchEvent(this._signupSuccess);
      // wait 1sec for nicer UI
      await sleep(1000);

      return [recoveryCode, accAddress];
    } catch (err) {
      console.error(err);
      this.dispatchEvent(this._signupFail);
      throw new Error(`[WebAuthnSigner]: ${err}`);
    }
  }
}
