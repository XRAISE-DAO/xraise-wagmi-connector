import { WebAuthnProviderLoginManager } from "../platform_authenticator/WebAuthnProvider";

import { RaiseAuthnProviderLoginManager } from "../platform_authenticator/RaiseAuthnProvider";
import { ILoginManager } from "../platform_authenticator/ILoginManager";

export enum WenauthnSupportStatus {
  Supported = "Supported",
  RoamOnly = "Roam only",
  NotSupported = "Not supported",
}

export enum ServiceWorkerSupportStatus {
  Supported = "Supported",
  NotSupported = "Not supported",
}

export async function webauthnSupportStatus(): Promise<WenauthnSupportStatus> {
  if (!window.PublicKeyCredential) return WenauthnSupportStatus.NotSupported;

  return (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    ? WenauthnSupportStatus.Supported
    : WenauthnSupportStatus.RoamOnly;
}

export function serviceWorkerSupportStatus(): ServiceWorkerSupportStatus {
  return window.navigator.serviceWorker == null ||
    window.navigator.serviceWorker.controller == null
    ? ServiceWorkerSupportStatus.NotSupported
    : ServiceWorkerSupportStatus.Supported;
}

export async function getSupportedLoginManager(): Promise<ILoginManager> {
  const webauthnStatus = await webauthnSupportStatus();
  console.log("Webauthn support status", webauthnStatus);
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
