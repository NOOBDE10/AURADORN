import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * FIREBASE_SERVICE_ACCOUNT holds the service-account JSON, either raw or base64-encoded.
 * Set it in Vercel → Project → Settings → Environment Variables (never commit it).
 */
function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
  const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(json);
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(loadServiceAccount()) });
}

export const db = getFirestore();

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/** Last 10 digits of a Pakistani mobile number, e.g. "+92 300-1234567" → "3001234567". */
export function phoneKey(phone: string): string {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}
