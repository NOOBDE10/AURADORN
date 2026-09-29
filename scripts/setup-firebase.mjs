#!/usr/bin/env node
/**
 * One-time / repeatable Firebase setup using the service-account key.
 *
 *   node scripts/setup-firebase.mjs --admin-email you@example.com [--key secrets/aa-jewelers-admin.json] [--reset-password]
 *
 * - Deploys firestore.rules
 * - Seeds settings/general and the default categories (only if missing)
 * - Creates (or finds) the admin login and marks it as admin in /admins/{uid}
 */
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getSecurityRules } from 'firebase-admin/security-rules';

const args = process.argv.slice(2);
const arg = name => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const keyPath = arg('key') || 'secrets/aa-jewelers-admin.json';
const adminEmail = arg('admin-email');
const resetPassword = args.includes('--reset-password');

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const SETTINGS = {
  brandName: 'Aura Adorn',
  tagline: 'Artificial Jewellery • Luxury Look, Everyday Price',
  logo: '/logo-512.jpg',
  phone: '+92 333 8282369',
  whatsappNumber: '+923338282369',
  email: 'auraadornjewellers@gmail.com',
  orderAlertEmail: 'auraadornjewellers@gmail.com',
  address: 'Lahore, Pakistan (online store)',
  deliveryCharge: 200,
  freeDeliveryThreshold: 0,
  currency: 'PKR',
  currencySymbol: 'Rs',
  announcementText: 'Cash on Delivery all over Pakistan • Delivery Rs 200',
  heroBanner: {
    tag: 'New Collection',
    title: 'Elegant Artificial Jewellery for Every Occasion',
    subtitle: 'Bridal sets, jhumkas, bangles, rings and everyday pieces. Beautifully finished, honestly priced, delivered to your door with Cash on Delivery.',
    image: '/logo-512.jpg',
    ctaText: 'Shop Now',
    ctaLink: '#products',
  },
  returnPolicy: 'If your item arrives damaged or incorrect, contact us on WhatsApp within 3 days of delivery with photos and we will arrange an exchange.',
  shippingPolicy: 'We deliver all over Pakistan with Cash on Delivery. Orders are usually delivered within 3–5 working days. Delivery charge: Rs 200.',
  warrantyPolicy: 'All our jewellery is high-quality artificial (imitation) jewellery. To keep the finish bright, keep it away from water, perfume and sweat, and store it in a dry box or pouch.',
};

const CATEGORIES = [
  ['necklace-sets', 'Necklace Sets', 'Kundan, AD and pearl necklace sets with matching earrings.'],
  ['earrings', 'Earrings', 'Jhumkas, studs, tops, drops and chandbalis.'],
  ['bangles', 'Bangles & Kangan', 'Bangle sets, kangan, kara and bracelets.'],
  ['rings', 'Rings', 'Adjustable, cocktail and AD rings.'],
  ['bridal-sets', 'Bridal Sets', 'Complete bridal, walima and mehndi jewellery sets.'],
  ['tikka-matha-patti', 'Tikka & Matha Patti', 'Maang tikka, matha patti and jhoomar.'],
];

async function main() {
  console.log(`Project: ${serviceAccount.project_id}`);

  // 1. Firestore must exist
  try {
    await db.doc('settings/general').get();
  } catch (e) {
    if (String(e.message).includes('NOT_FOUND') || e.code === 5) {
      console.error('\n✗ No Firestore database found. Create it in Firebase console → Firestore Database → Create database (production mode), then re-run.');
      process.exit(1);
    }
    throw e;
  }

  // 2. Security rules
  const rules = readFileSync('firestore.rules', 'utf8');
  await getSecurityRules().releaseFirestoreRulesetFromSource(rules);
  console.log('✓ firestore.rules deployed');

  // 3. Settings + categories (never overwrite existing data)
  const settingsRef = db.doc('settings/general');
  if (!(await settingsRef.get()).exists) {
    await settingsRef.set(SETTINGS);
    console.log('✓ settings/general created');
  } else {
    console.log('• settings/general already exists (left unchanged)');
  }

  const cats = await db.collection('categories').limit(1).get();
  if (cats.empty) {
    const batch = db.batch();
    CATEGORIES.forEach(([id, name, description], order) =>
      batch.set(db.doc(`categories/${id}`), { id, name, slug: id, description, image: '', itemCount: 0, featured: true, order })
    );
    await batch.commit();
    console.log(`✓ ${CATEGORIES.length} categories created`);
  } else {
    console.log('• categories already exist (left unchanged)');
  }

  // 4. Admin user
  if (!adminEmail) {
    console.log('\n(No --admin-email given; skipping admin account.)');
    return;
  }
  const auth = getAuth();
  let user;
  let password;
  try {
    user = await auth.getUserByEmail(adminEmail);
    if (resetPassword) {
      password = randomBytes(12).toString('base64url');
      await auth.updateUser(user.uid, { password });
    }
    console.log(`• admin user exists: ${user.uid}`);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e;
    password = randomBytes(12).toString('base64url');
    user = await auth.createUser({ email: adminEmail, password, emailVerified: true, displayName: 'Store Admin' });
    console.log(`✓ admin user created: ${user.uid}`);
  }
  await db.doc(`admins/${user.uid}`).set({ email: adminEmail, role: 'admin', createdAt: new Date().toISOString() }, { merge: true });
  console.log('✓ admins record written');

  console.log('\n=== Admin login ===');
  console.log(`Email:    ${adminEmail}`);
  console.log(password ? `Password: ${password}` : 'Password: (unchanged; use --reset-password to generate a new one)');
}

main().catch(e => {
  console.error('\n✗ Setup failed:', e.message);
  process.exit(1);
});
