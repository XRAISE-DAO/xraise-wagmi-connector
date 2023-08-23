'use client';

/// Stores some non sensitive data in browser. Mostly in localStorage. But may vary in some browsers e.g. use service worker, cookies
interface INonSensitiveDataStorage {
  storeValue(key: string, value: string): void;
  storeObject(key: any, value: string): void;
  storePrefixedValue(prefix: string, key: string, value: string): void;

  getValue(key: string): string | undefined;
  getObject(key: string): object | undefined;
  getPrefixedValue(prefix: string, key: string): string | undefined;

  remove(key: string): void;
  removeAll(...keys: string[]): void;

  removePrefixed(prefix: string, key: string, value: string): void;
}

export const RECOVERY_CODE_PREFIX = 'recovery_code';
export const DEVICE_CONNECT_CODE_PREFIX = 'device_connect_code';
export const DEVICE_TRANSACTION_APPROVE_PREFIX = 'raisewallet.approve';

export class LocalStorageProvider implements INonSensitiveDataStorage {
  storeValue(key: string, value: string) {
    localStorage[key] = value;
  }
  storeObject(key: string, value: any) {
    localStorage[key] = JSON.stringify(value);
  }
  storePrefixedValue(prefix: string, key: string, value: string) {
    localStorage[`${prefix}_${key}`] = value;
  }

  getValue(key: string) {
    return localStorage[key];
  }
  getObject(key: string) {
    return localStorage[key] ? JSON.parse(localStorage[key]) : undefined;
  }
  getPrefixedValue(prefix: string, key: string) {
    return localStorage[`${prefix}_${key}`];
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
  removeAll(...keys: string[]) {
    keys.forEach((key) => localStorage.removeItem(key));
  }
  removePrefixed(prefix: string, key: string) {
    return localStorage.removeStorage(`${prefix}_${key}`);
  }
}

export const defaultLocalStorage = new LocalStorageProvider();
export const defaultNonsensitiveStorage = defaultLocalStorage; // Can vary for different supported technologies
