import { WebAuthnProviderLoginManager } from '../platform_authenticator/WebAuthnProvider';
import { RaiseAuthnProviderLoginManager } from '../platform_authenticator/RaiseAuthnProvider';
import { ILoginManager } from '../platform_authenticator/ILoginManager';

export enum WenauthnSupportStatus {
  Supported = 'Supported',
  RoamOnly = 'Roam only',
  NotSupported = 'Not supported',
}

export enum ServiceWorkerSupportStatus {
  Supported = 'Supported',
  NotSupported = 'Not supported',
}

export async function webauthnSupportStatus(): Promise<WenauthnSupportStatus> {
  if (!window.PublicKeyCredential) return WenauthnSupportStatus.NotSupported;

  /// On some devices e.g. realme & vivo isUserVerifyingPlatformAuthenticatorAvailable never fulfills
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('TimeoutError while webauthn support check'));
    }, 2000);
  });

  console.log('Checking', window.PublicKeyCredential);
  console.log('Calling isUserVerifyingPlatformAuthenticatorAvailable');

  let supportStatus: WenauthnSupportStatus;

  try {
    supportStatus = (await Promise.race([
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
      timeout,
    ]))
      ? WenauthnSupportStatus.Supported
      : WenauthnSupportStatus.RoamOnly;
  } catch (e) {
    console.error('Webauthn checking timeout');
    supportStatus = WenauthnSupportStatus.Supported;
  }

  console.log(
    'Got isUserVerifyingPlatformAuthenticatorAvailable response',
    supportStatus,
  );

  return supportStatus;
}

export function serviceWorkerSupportStatus(): ServiceWorkerSupportStatus {
  return window.navigator.serviceWorker == null ||
    window.navigator.serviceWorker.controller == null
    ? ServiceWorkerSupportStatus.NotSupported
    : ServiceWorkerSupportStatus.Supported;
}

export async function getSupportedLoginManager(): Promise<ILoginManager> {
  const webauthnStatus = await webauthnSupportStatus();
  console.log('Webauthn support status', webauthnStatus);
  // return new RaiseAuthnProviderLoginManager();

  return webauthnStatus == WenauthnSupportStatus.Supported
    ? new WebAuthnProviderLoginManager()
    : new RaiseAuthnProviderLoginManager();
}

export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Request signature while wallet window is opened not after. Required by Safari
export function isInstantSignature(): boolean {
  return isSafari();
}
