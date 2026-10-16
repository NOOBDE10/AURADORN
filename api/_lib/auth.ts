/**
 * Verifies a customer's Firebase ID token with Google's Identity Toolkit REST API and returns their uid.
 *
 * We deliberately avoid `firebase-admin/auth`: it pulls in jwks-rsa → jose (ESM-only via require()),
 * which crashes on Node runtimes older than 22.12 and took down the whole order function on Vercel.
 */
export async function verifyCustomerToken(idToken: string): Promise<string | null> {
  const apiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey || !idToken || idToken.length > 4096) return null;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) return null; // invalid or expired token
  const data = (await res.json()) as { users?: Array<{ localId?: string; disabled?: boolean }> };
  const user = data.users?.[0];
  return user?.localId && !user.disabled ? user.localId : null;
}
