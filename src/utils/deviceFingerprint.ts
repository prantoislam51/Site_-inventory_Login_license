export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timeZone: string;
  timeZoneOffset: number;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  vendor: string;
  touchSupport: boolean;
  installId: string;
}

function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function getOrCreateInstallId(): string {
  try {
    const key = 'app_install_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function getDeviceInfo(): DeviceInfo {
  const nav = navigator as any;
  const scr = window.screen;
  const installId = getOrCreateInstallId();
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform || '',
    language: navigator.language || '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    timeZoneOffset: new Date().getTimezoneOffset(),
    screenWidth: scr?.width || 0,
    screenHeight: scr?.height || 0,
    colorDepth: scr?.colorDepth || 0,
    hardwareConcurrency: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
    deviceMemory: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    vendor: (navigator as any).vendor || '',
    touchSupport: 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0,
    installId,
  };
}

export function computeDeviceFingerprint(): string {
  const info = getDeviceInfo();
  const raw = [
    info.userAgent,
    info.platform,
    info.language,
    info.timeZone,
    String(info.timeZoneOffset),
    String(info.screenWidth),
    String(info.screenHeight),
    String(info.colorDepth),
    String(info.hardwareConcurrency ?? ''),
    String(info.deviceMemory ?? ''),
    info.vendor,
    String(info.touchSupport),
    info.installId,
  ].join('|');
  return simpleHash(raw);
}


