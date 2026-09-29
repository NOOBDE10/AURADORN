# AURA ADORN — Online Jewellery Shop

React + Vite storefront with a built-in admin panel, running on Firebase (Firestore, Auth, Hosting).
Cash on Delivery only, prices in Pakistani Rupees.

**First time? Follow [SETUP.md](SETUP.md).** It covers creating the database, the owner account, email alerts, photo uploads, going live and connecting a domain.

## Commands

```bash
npm install          # install packages
npm run dev          # run locally at http://localhost:3000  (admin: /?admin)
npm run build        # type-check + production build into dist/
npm run deploy       # build and publish website + database rules to Firebase
npm run deploy:rules # publish only firestore.rules
```

Configuration lives in `.env.local` (copy from `.env.example`).

## Features

- **Storefront:** categories, search, filters, product pages with photos, sizes and finishes, wishlist, compare, reviews (owner-approved)
- **Checkout:** Cash on Delivery with Pakistani mobile validation, discount codes, delivery charge with a free-delivery threshold
- **Customers:** optional accounts with order history; order tracking by order number
- **Admin (`/?admin`):**
  - Live orders with a chime and an email alert; status workflow that updates stock automatically; call/WhatsApp buttons; printable invoices; CSV export
  - Products with photo upload; categories; discount codes (percentage or fixed, minimum order, usage limit, expiry)
  - Review moderation; shop settings and policies; newsletter subscribers

## Project layout

```
src/
  context/StoreContext.tsx   app state: live Firestore data, auth, cart
  services/storeService.ts   all database reads/writes
  services/emailService.ts   new-order email (EmailJS)
  services/imageUpload.ts    photo upload (Cloudinary)
  utils/pricing.ts           cart totals, discounts, delivery (single source of truth)
  utils/format.ts            PKR formatting, WhatsApp links, phone validation
  components/                storefront
  components/admin/          admin panel tabs
firestore.rules              database security rules
firebase.json                hosting + rules config
```
