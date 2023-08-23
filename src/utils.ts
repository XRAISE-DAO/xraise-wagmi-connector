import {
  hexDataSlice,
  hexlify,
  keccak256,
  toUtf8Bytes,
  zeroPad,
} from 'ethers/lib/utils.js';
import cbor from 'cbor';
import { IAuthProvider } from './platform_authenticator/IAuthProvider';
import { ILoginManager } from './platform_authenticator/ILoginManager';
import {
  RaiseAuthnProvider,
  RaiseAuthnProviderLoginManager,
} from './platform_authenticator/RaiseAuthnProvider';
import {
  WebAuthnProvider,
  WebAuthnProviderLoginManager,
} from './platform_authenticator/WebAuthnProvider';
import { Provider } from 'zksync-web3';
import {
  webauthnSupportStatus,
  WenauthnSupportStatus,
} from './platform_support/detections';
import { defaultNonsensitiveStorage } from './platform_support/NonSensitiveStorage';

export const formatAddress = (address: string) => {
  return address.slice(0, 6) + '..' + address.slice(-4);
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const zkSync = {
  id: 280,
  name: 'zkSync alpha testnet',
  network: 'zksync',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://zksync2-testnet.zksync.dev'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'zkScan',
      url: 'https://explorer.zksync.io/',
    },
    default: {
      name: 'zkScan',
      url: 'https://explorer.zksync.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0A14EB2A6A62488F5AFb7113B2358E241EEFC40e' as `0x${string}`,
      blockCreated: 120863,
    },
  },
};

export const zkSyncProvider = Object.assign(
  new Provider('https://zksync2-testnet.zksync.dev', 280),
  { chains: [zkSync] },
) as Provider;

export function parseAuthenticatorData(data: any) {
  const d =
    data instanceof ArrayBuffer
      ? new DataView(data)
      : new DataView(data.buffer, data.byteOffset, data.byteLength);
  let p = 0;

  const result: any = {};

  result.rpIdHash = '';
  for (const end = p + 32; p < end; ++p) {
    result.rpIdHash += d.getUint8(p).toString(16);
  }

  const flags = d.getUint8(p++);
  result.flags = {
    userPresent: (flags & 0x01) !== 0,
    reserved1: (flags & 0x02) !== 0,
    userVerified: (flags & 0x04) !== 0,
    reserved2: ((flags & 0x38) >>> 3).toString(16),
    attestedCredentialData: (flags & 0x40) !== 0,
    extensionDataIncluded: (flags & 0x80) !== 0,
  };

  result.signCount = d.getUint32(p, false);
  p += 4;

  if (result.flags.attestedCredentialData) {
    const atCredData: any = {};
    result.attestedCredentialData = atCredData;

    atCredData.aaguid = '';
    for (const end = p + 16; p < end; ++p) {
      atCredData.aaguid += d.getUint8(p).toString(16);
    }

    atCredData.credentialIdLength = d.getUint16(p, false);
    p += 2;

    atCredData.credentialId = '';
    for (const end = p + atCredData.credentialIdLength; p < end; ++p) {
      atCredData.credentialId += d.getUint8(p).toString(16);
    }

    try {
      const encodedCred = Buffer.from(d.buffer, d.byteOffset + p);
      atCredData.credentialPublicKey = cbor.decodeAllSync(encodedCred)[0];
    } catch (e: any) {
      console.error('Failed to decode CBOR data: ', e);

      atCredData.credentialPublicKey = `Decode error: ${e.toString()}`;
    }
  }

  if (result.flags.extensionDataIncluded) {
    // TODO
  }
  return result;
}

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export async function restorePlatformAuth(): Promise<IAuthProvider | null> {
  const provider =
    WebAuthnProvider.restore() ?? (await RaiseAuthnProvider.restore());
  console.log('Restored provider', provider);
  return provider;
}

export async function getSupportedLoginManager(): Promise<ILoginManager> {
  const webauthnStatus = await webauthnSupportStatus();
  console.log('Webauthn support status', webauthnStatus);
  // return new RaiseAuthnProviderLoginManager();

  return webauthnStatus == WenauthnSupportStatus.Supported
    ? new WebAuthnProviderLoginManager()
    : new RaiseAuthnProviderLoginManager();
}

export function compareArrays(arr1: Uint8Array, arr2: Uint8Array) {
  if (arr1.length != arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] != arr2[i]) return false;
  }

  return true;
}

export function truncate(str: string | undefined, maxDecimalDigits: number) {
  if (str != null && str.includes('.')) {
    const parts = str.split('.');
    return parts[0] + '.' + parts[1].slice(0, maxDecimalDigits);
  }
  return str;
}

export function getDeviceId(): string {
  const savedDeviceId = defaultNonsensitiveStorage.getValue('deviceId');
  if (savedDeviceId) return savedDeviceId;

  const calculatedDeviceId = hexDataSlice(
    keccak256(toUtf8Bytes(window.navigator.userAgent)),
    0,
    4,
  ); // Intended to distinguish user devices if user has multiple webauthn logins
  defaultNonsensitiveStorage.storeValue('deviceId', calculatedDeviceId);

  return calculatedDeviceId;
}

export function getCreateCredentialDefaultArgs(
  challenge: BufferSource,
  email: string,
  userIdSalt: string = '',
): CredentialCreationOptions {
  return {
    publicKey: {
      challenge: challenge,
      rp: {
        name: 'RaisePay',
        id: process.env.NODE_ENV == 'development' ? 'localhost' : 'xraise.io',
      },
      user: {
        name: email,
        displayName: email,
        id: Buffer.from(`${email}${userIdSalt}`),
      },
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7,
        },
        {
          type: 'public-key',
          alg: -257,
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  };
}

export function parseAuthData(attestationObject: ArrayBuffer) {
  const decoded = cbor.decodeAllSync(attestationObject)[0];

  const data = decoded.authData;
  console.log('Raw auth data', hexlify(data));

  const authData = parseAuthenticatorData(data);
  const publicKeyCbor = authData.attestedCredentialData.credentialPublicKey;
  const algoId = publicKeyCbor.get(3);

  console.log('Detected algo id', algoId);

  if (algoId == -7) {
    const x = '0x' + publicKeyCbor.get(-2).toString('hex');
    const y = '0x' + publicKeyCbor.get(-3).toString('hex');
    return {
      kty: 'EC',
      crv: 'P-256',
      algoId: -7,
      arg1: x,
      arg2: y,
    };
  } else if (algoId == -257) {
    const n = keccak256('0x' + publicKeyCbor.get(-1).toString('hex'));
    const e = hexlify(
      zeroPad('0x' + publicKeyCbor.get(-2).toString('hex'), 32),
    );
    return {
      kty: 'RSA',
      algoId: -257,
      arg1: n,
      arg2: e,
    };
  } else throw `Unsupported algo ${algoId}`;
}
