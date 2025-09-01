import { User } from '../types';
import { computeDeviceFingerprint, getDeviceInfo } from './deviceFingerprint';

const NOTIFY_BASE = 'http://localhost:3002';

export async function notifyLoginIfUnapproved(user: User): Promise<void> {
  try {
    const fingerprint = computeDeviceFingerprint();
    const deviceInfo = getDeviceInfo();
    const payload = {
      userEmail: user.email,
      userId: user.id,
      role: user.role,
      fingerprint,
      deviceInfo,
      timestamp: new Date().toISOString(),
    };

    await fetch(`${NOTIFY_BASE}/notify-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Ne bloque pas le flux d'authentification si le serveur de notification n'est pas disponible
    console.warn('Login notify failed:', error);
  }
}


