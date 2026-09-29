# Aura Adorn Website: Pre-Launch Audit Report

**Date:** 29 Sep 2026 · **Branch audited:** `ui-update` (commit `62a7c27`) · **Scope:** read-only audit. No code was changed, and nothing was installed or deleted.

---

## Executive Summary

**Overall readiness: about 25%.**
The storefront looks finished: design, animations, cart drawer, product modals, and the admin panel layout are all about 80% done. But almost everything behind the UI is fake, local to the visitor's own browser, or insecure. A real customer can place an order today, and it may reach a database, but **the business owner has no reliable way to see it, is never notified, and the admin panel can be opened by anyone.** All product content describes **real gold and diamond jewellery with fake certificates**. That is wrong for an artificial jewellery business and creates legal and misrepresentation risk.

### Top 5 blockers

1. **The admin panel is open to anyone.** Username `admin` plus any password of 4 or more characters logs in. The hint "default: admin123" is printed on the login screen, and an "Admin Panel" button sits in the public navigation. (`src/context/StoreContext.tsx:496-526`, `src/components/AdminDashboard.tsx:329`, `src/components/Header.tsx:603`)
2. **Orders never reliably reach the owner.** The "owner notification" is only a `console.info` plus the *customer's own* localStorage (`src/services/storeService.ts:489-505`). If the database write fails, the error is swallowed and the customer is still told the order succeeded (`storeService.ts:240-245`). The admin panel only reads real orders when signed in with Google as a specific hardcoded email.
3. **The app is wired to Google AI Studio's Firebase project, not yours.** `src/firebase/config.ts:9` loads `firebase-applet-config.json` (project `reverberant-setting-r3skh`, an AI Studio database). The `VITE_FIREBASE_*` values in your `.env` are **never read**. You may not have console access to the database where orders are stored.
4. **All product content is fake, and wrong for artificial jewellery.** The catalogue claims "GIA certified natural diamonds", "22K hallmarked gold", "BIS 916", "Zambian emeralds", and fake report numbers. It also has fabricated 5-star reviews from fake customers, fake "1 of 3 worldwide" editions, a fake countdown timer, and prices in **USD ($)** for a Pakistani business. (`src/data/initialData.ts`, most components)
5. **No real data or inventory management.** Admin product, price, and settings edits save to the admin's own browser only unless they are Google-signed-in as the right email. Stock is never deducted in the database. Customer accounts (login/register) are fake and only show a toast. Draft products are visible to shoppers, and tracking numbers the admin enters are never saved.

### Rough time to go live

**About 3–5 weeks for one developer** (roughly 2 weeks of engineering blockers, 1 week of content, policies and testing, and some buffer). This assumes the owner supplies product photos, prices, and policy details promptly. Content entry (real products and photos) is usually the slowest part.

### ✅ Confirmed decisions (29 Sep 2026)

| # | Topic | Decision | Effect on the plan |
|---|---|---|---|
| 1 | Brand name | **Aura Adorn** (primary). Keeping the existing "AA" logo is fine, since AA = Aura Adorn | Brand name comes from **admin settings** (default "Aura Adorn"), not hardcoded. Current logo kept for now. All fine-jewellery wording still removed |
| 2 | Categories & materials | **Configurable from the admin panel** | Category management (add, rename, reorder, image, delete) and product attributes (material, finish, stones, colour, sizes) become admin-editable data instead of hardcoded lists. Promoted to a **blocker** (B13). Shop filters are generated from the data |
| 3 | Delivery charge | **Default Rs 200**, editable in admin settings | Seed `deliveryCharge: 200`, currency PKR. Free-delivery threshold stays an admin setting (off unless set) |
| 4 | Payment | **Cash on Delivery only** | No payment gateway work. Checkout stays COD. Online-payment items removed from the roadmap |
| 5 | Owner notifications | **Email now. Browser push if easy** | Email alert on every order is a blocker (B4). Push to the owner's phone or browser is *moderately* easy with Firebase Cloud Messaging, since the site is already a PWA on Firebase: about 1 day, as a follow-up (S11). Caveat: on iPhone it only works if the admin installs the site to the home screen (iOS 16.4+) |
| 6 | Firebase project | **Owned by you** (the `aa-j…` project in `.env`) | B1 moves the app onto it. Old AI Studio database can be ignored unless it holds real orders |
| 7 | Budget | **Free tiers only**, no Blaze plan | Firebase stays on the free **Spark** plan (Firestore + Auth). Cloud Functions and Firebase Storage need Blaze, so: server logic runs as **Netlify Functions** (free, commercial use allowed), images on **Cloudinary** (free), and email via **Gmail SMTP** with an app password (free, about 500/day). See §5.5 |
| 8 | Admin account | **Seed one admin account** and hand over credentials | Email/password Firebase Auth user + `admins/{uid}` record, created by a seed script. Password is changeable afterwards |

---

## 1. Project Overview

### What the app is (plain language)
A **single-page React website** originally generated in Google AI Studio. Everything runs in the visitor's browser. There is **no backend server of your own**. The browser talks directly to **Google Firebase** (Firestore database plus Firebase Authentication). Anything Firebase cannot do (email, notifications, price checks) is either faked or missing.

```
Browser (React SPA) ──► Firebase Firestore  (products, orders, reviews, settings, subscribers)
        │           ──► Firebase Auth       (Google sign-in popup only)
        │           ──► localStorage        (cart, wishlist, AND a fallback copy of everything)
        └──────────► wa.me links            (WhatsApp buttons open a pre-filled chat)
```

### Tech stack
| Area | What's used | Notes |
|---|---|---|
| Framework | React 19 + TypeScript | `src/main.tsx`, `src/App.tsx` |
| Build tool | Vite 8 + Tailwind CSS 4 + `vite-plugin-pwa` | `vite.config.ts` |
| Animations | `motion` (Framer Motion), `lenis` smooth scroll | |
| Database | Firebase Firestore (client SDK) | Named database in AI Studio's project |
| Auth | Firebase Auth, Google popup only | Email/password auth is **not** implemented |
| Routing | **None.** Views are switched with `useState('home' \| 'shop')` | Every page is the same URL |
| State | One large React Context (`src/context/StoreContext.tsx`, 743 lines) | |
| Backend / API | **None** | `express`, `dotenv`, `@google/genai` are installed but never used |
| Payments | Cash on Delivery only, no gateway | |
| Email / SMS | **None** (console log only) | `.env.example` mentions EmailJS and Cloudinary, but no code exists for them |
| Deployment | Nothing configured | No `firebase.json`, Vercel, or Netlify config. README only covers AI Studio |
| Tests | **None** | |

### Folder structure
```
index.html                    SEO meta (all describes fine gold/diamond jewellery)
vite.config.ts                Vite + PWA manifest ("certified diamonds, solid 18K/22K gold")
firebase-applet-config.json   AI Studio Firebase project config  ◄── actually used
firestore.rules               Database security rules (not deployed by anything in repo)
firebase-blueprint.json       AI Studio schema description (documentation only)
metadata.json                 AI Studio metadata (claims "SERVER_SIDE_GEMINI_API", not used)
.env / .env.example           Your own Firebase keys + EmailJS/Cloudinary placeholders ◄── NOT used
public/                       Logo + PWA icons (all the same 566 KB JPEG, some misnamed .png)
src/
  App.tsx                     Page layout, home/shop view switch, all modals mounted
  context/StoreContext.tsx    Cart, coupons, auth, admin login, all app state
  services/storeService.ts    Firestore + localStorage read/write for everything
  data/initialData.ts         10 fake products, 6 categories, 3 fake reviews, store settings
  firebase/config.ts          Firebase init (reads the AI Studio JSON)
  components/ (26 files)      Header, Hero, Shop, ProductCard/Grid, modals, Cart, Checkout,
                              AdminDashboard (1,613 lines), Footer, WhatsApp widget, etc.
```

### Install / build / lint results
I did not run `npm install` because `node_modules/` already exists and you asked for no installs. The build output went to a temporary folder so the repo is untouched.

| Command | Result |
|---|---|
| `npx tsc --noEmit` (the `lint` script) | ✅ Passes, 0 type errors |
| `vite build` | ✅ Builds in about 1.2 s. ⚠️ Warnings below |
| `npm audit` | ✅ 0 known vulnerabilities |

Build warnings:
- **Single JS bundle of 1,218 KB (339 KB gzipped).** Vite warns about chunks over 500 KB. That is heavy for mobile users on 3G/4G in Pakistan.
- **PWA precaches 3.5 MB** on first visit, mostly six copies of the same 566 KB logo JPEG.
- `vite.config.ts:72` uses `__dirname`, which future Vite versions won't support.
- Two lockfiles (`bun.lock` tracked, `package-lock.json` untracked). Pick one package manager.
- `.gitignore` is currently **untracked**. It was deleted from git in an earlier commit and exists only locally. Commit it so `.env` and `node_modules` stay out of git.

---

## 2. What's DONE (genuinely working end to end)

"Working" here means the feature does what it says for a real customer on a real deployment, not just in the preview.

| Feature | Status | Notes |
|---|---|---|
| Product listing, grid, cards | ✅ Works | Reads Firestore `products`. **Falls back to the 10 fake products** if the collection is empty or unreachable |
| Category browsing | ✅ Works | Filters by `category` field. Six categories, hardcoded in admin |
| Search (header + shop page) | ✅ Works | Client-side text match on name, category, metal, stone |
| Filters & sorting | ⚠️ Works, but filters are wrong for the business | Filters are gold karat, platinum, diamond, emerald. Price slider caps at **7,000** (will hide most products once prices are in PKR) |
| Product detail modal | ✅ Works | Gallery, zoom, tabs, related items. No shareable URL |
| Quick view, compare (up to 4), wishlist | ✅ Works (localStorage) | Wishlist is per-browser only, not tied to an account |
| Cart: add / remove / quantity / persistence | ✅ Mostly works | Saved in localStorage. Bugs in §4 (remove deletes all variants; stale prices) |
| Coupon codes | ⚠️ Works, but hardcoded | `AA10`, `AA`, `AURA`, `LUXE10` = 10%; `DIAMOND15` = 15% (`StoreContext.tsx:398-412`). The owner cannot manage them |
| Checkout form (COD) | ✅ Submits | Name, phone, address, city validation is minimal |
| Order saved to Firestore | ⚠️ **Probably**, silently | Rules allow anonymous create. If it fails, the customer still sees success |
| Order success screen + WhatsApp confirm button | ✅ Works | "Confirm on WhatsApp" opens a pre-filled chat to +92 333 8282369. **This is the only way the owner reliably learns about an order today** |
| Order tracking by Order ID | ⚠️ Partly | Works by exact ID. "Track by phone number" only searches the current browser. Opening tracking straight after checkout shows an empty box (bug) |
| WhatsApp floating widget / "Order on WhatsApp" | ✅ Works | Plain `wa.me` links |
| Newsletter signup | ✅ Saves to Firestore | Owner can export CSV only when admin sign-in works properly |
| Mobile layout | ✅ Generally responsive | Mobile menu, mobile search, drawers. Needs a real-device QA pass |
| Header / footer / navigation | ⚠️ Works | No Privacy, Terms, Returns, or Contact pages. Instagram and Facebook links are `href="#"` |
| PWA ("install app") | ✅ Works | Icons are wrong size or format (see §4) |

---

## 3. What's MISSING or FAKE

### 3.1 Fake / hardcoded content
- **All 10 products are fictional fine-jewellery items** (`src/data/initialData.ts:86-477`). They include fake GIA, IGI, SSEF, and GRS report numbers, "natural diamonds", and "22K hallmarked gold". Prices run from $299 to $5,800 in USD.
- **Three fabricated reviews** from invented people ("Eleanor Vance-Sterling", "Sophia Al-Mansoor"…), marked `verifiedPurchase: true` (`initialData.ts:479-519`).
- **Fake ratings and review counts** on every product (for example "5.0 · 42 reviews"). New admin products default to `rating: 5, reviewCount: 1` (`StoreContext.tsx:597-598`).
- **Fake scarcity**: "Edition 1 of 3 Worldwide", "Piece 2 of 5 Worldwide", "Numbered Batch #14" (`initialData.ts`). The "Vault Deals" countdown starts at 8:42:15 on every page load and resets to 12:00:00 when it hits zero (`VaultDealsSection.tsx:41-62`).
- **Fake address**: "Suite 401, The Diamond Pavilion, Gulberg III, Lahore" (`initialData.ts:10`). Please confirm whether this is real.
- **Placeholder images**: every image is a generic Unsplash stock photo of fine jewellery. The same 5 images are reused across products and categories.
- **Fake customer data inserted into orders**: if the customer leaves these fields blank, checkout silently records email `guest.patron@aajewelers.com`, area `Central District`, postal code `54000`, and notes "Standard white-glove packaging requested" (`CheckoutModal.tsx:81-86`). The owner cannot tell real data from filler.
- **Hardcoded "18K Gold / Platinum" metal selector** on *every* product, all at the same price (`ProductDetailsModal.tsx:60-65`). A customer can "choose Platinum" on a steel bangle.
- **Every customer review is auto-published and labelled "verified purchase"** (`storeService.ts:441`, `ProductDetailsModal.tsx:126`).

### 3.2 Data stored only in the browser (localStorage)
`storeService.ts` writes **everything to localStorage first** and only syncs to Firestore "if `auth.currentUser`" (lines 110, 128, 167, 181, 354, 409, 465, 478). In practice:
- **Admin edits to products, settings, reviews, and order status are saved only in that admin's browser** unless the admin signed in with Google. The password login never creates a Firebase session, so nothing reaches the database, yet the UI says "saved".
- **Stock deduction happens only in the customer's localStorage** (`storeService.ts:247-264`). Real stock in Firestore never changes, so you can oversell.
- **"Admin notifications" live in the customer's browser** (`storeService.ts:497-504`), so the owner never sees them.
- If Firestore returns no products, the site shows the fake products. If the owner deletes every product, the fakes come back (`storeService.ts:86-95`).

### 3.3 Missing backend / APIs
- **No server code at all.** No order-placement API, no email sending, no price validation, no webhook handling. `express`, `dotenv`, and `@google/genai` are unused dependencies.
- **`.env.example` references `SETUP.md`, EmailJS, and Cloudinary.** None of these exist in the code. It looks like someone started planning this.
- No image upload: admin can only paste an image URL (`AdminDashboard.tsx`, product form).
- No category management UI. Categories are hardcoded in the admin dropdown.
- No coupon management, no delivery-zone rules, no customer list for admin.

### 3.4 Fake checkout / notifications
- Payment is COD only, which is fine for launch. There is no gateway and no online payment.
- The checkout footer says "Store owner automatically notified: auraadornjewellers@gmail.com" (`CheckoutModal.tsx:389`), and the success screen shows "✓ Admin notification dispatched" (`OrderSuccessModal.tsx:105`). **Both are false.** No email is sent.
- The admin button "Save Tracking & Notify Client" (`AdminDashboard.tsx:1195`) notifies nobody. The tracking number and courier aren't even saved to Firestore, because `updateOrderStatus` in `storeService.ts:325-366` ignores them.

### 3.5 Authentication
- **Admin login is fake and insecure** (see Critical #1).
- **Customer login/register is fake.** `loginUser` shows "Welcome back" and closes the modal (`StoreContext.tsx:550-552`). `registerUser` shows a toast and does nothing (`:555-557`). Nobody is actually logged in, so "My Orders" is always empty for customers.
- The only real sign-in is the Google popup, and it's shown only on the admin screen.

### 3.6 Dead buttons / broken links / leftovers
- Footer Instagram and Facebook: `href="#"` (`Footer.tsx:71, 78`).
- "Bespoke Ring Sizing Guide" just opens WhatsApp (`Footer.tsx`). "Staff & Owner Access" is a public footer link to the login.
- Unused import `Printer` in `OrderSuccessModal.tsx:11`. The admin `activeTab` type includes `'reviews'`, but there is no reviews tab, so reviews can't be moderated.
- Leftover names from earlier AI iterations: localStorage keys `aura_carat_*`, order IDs `AC-2026-…` (year hardcoded, `storeService.ts:195`), coupon `AURA`, `LUXE10`, emails `admin@auraadorn.com`, console tag "Aura & Carat".
- No TODO/FIXME comments exist, but that's because the fakes are presented as finished features.

---

## 4. Issues by Severity

Format: **file:line**. What's wrong → why it matters → fix.

### 🔴 Critical

**C1. Admin authentication is bypassable by anyone**
- `src/context/StoreContext.tsx:496-526`: IDs `admin`, `owner`, and others are accepted. The password check `!validPasswords.includes(p) && p.length < 4` means **any password of 4+ characters works**. The admin flag is stored in localStorage (`aura_carat_admin_user`), so anyone can also set it in devtools. The UI hint "default: admin123" is at `AdminDashboard.tsx:329`, the login hint is at `CustomerAccountModal.tsx:186`, and a public "Admin Panel" nav button is at `Header.tsx:603`.
- Why: Firestore rules limit what a fake admin can *write*, but anyone can open the dashboard and view whatever orders and customer data are cached in that browser. It looks broken and unprofessional, and it trains the owner to use a login that doesn't sync.
- Fix: delete the password login entirely. Use Firebase Auth (Google or email/password) and check admin rights with a **custom claim** or an `admins/{uid}` doc that the security rules enforce. Hide admin entry points from the public nav. Consider a separate `/admin` route.

**C2. Orders can be lost silently, and the owner is never notified**
- `src/services/storeService.ts:240-245`: the Firestore write error is caught and swallowed, and the function still returns the order as successful. Notification at `:489-505` is `console.info` plus the customer's localStorage.
- `fetchAllOrders` (`:281-302`) only queries Firestore when `isOwnerAuthenticated`, meaning a Google login whose email is hardcoded (`StoreContext.tsx:253-255`). Firestore rules only recognise `nirbanmubashirzubair@gmail.com` or an `admins` doc (`firestore.rules:17`), **not** `auraadornjewellers@gmail.com`. So even the "owner" email shown on screen may be denied.
- Why: lost orders mean lost revenue and angry customers who were told "order placed".
- Fix: create orders through a **server function** (Firebase Cloud Function) that validates and writes the order, then sends the owner an email and/or WhatsApp message. Surface failures to the customer ("couldn't place order, please try again or WhatsApp us"). Build a proper admin orders list backed by Firestore with real-time updates.

**C3. The app points at Google AI Studio's Firebase project, and your `.env` is ignored**
- `src/firebase/config.ts:9, 16-24` imports `firebase-applet-config.json` (project `reverberant-setting-r3skh`, database `ai-studio-aajewellers-…`). No code reads `import.meta.env.VITE_FIREBASE_*`.
- Why: you likely have no Firebase console access to this project. That means you can't see orders, deploy security rules, back up data, add admins, or control billing. The project can disappear if the AI Studio app is deleted.
- Fix: read config from `import.meta.env.VITE_FIREBASE_*` (your `.env` already has values for a project starting `aa-j…`), use the default Firestore database, deploy `firestore.rules` with the Firebase CLI, and remove `firebase-applet-config.json`.

**C4. Order prices and totals are trusted from the browser**
- `CheckoutModal.tsx:87-101` sends `price`, `subtotal`, `discount`, and `totalAmount` computed on the client. `firestore.rules:60-70` only checks that `totalAmount is number`.
- Why: anyone can submit an order for Rs 1, a 100% discount, or products that don't exist. With COD you'd catch it on the confirmation call, but the order data (and any future reporting) is untrustworthy, and it becomes a real problem the moment online payment is added.
- Fix: the server function recomputes prices from Firestore product docs, applies coupons from a server-side coupon collection, computes delivery, checks and decrements stock in a **transaction**, then writes the order. Deny direct client `create` on `orders`.

**C5. Misleading product claims (legal / consumer-protection risk)**
- `initialData.ts` (all products), `index.html:6-15`, `vite.config.ts:20-22`, `Footer.tsx:60, 178, 188`, `HeroSection.tsx:144, 152`, `Header.tsx:204`, `LoyaltyBadge.tsx:69-93`, `WhatsAppConcierge.tsx:13`, `StoreContext.tsx:583-607`, and `AdminDashboard.tsx` defaults all claim solid 18K/22K gold, GIA/IGI-certified natural diamonds, hallmarks, and "lifetime authenticity".
- Why: selling artificial jewellery under these claims is misrepresentation. It risks complaints under Pakistan's provincial consumer protection laws, chargebacks and disputes, ad rejection on Meta and Google, and brand damage. The fake reviews and fake "1 of 3 worldwide" scarcity carry the same risk.
- Fix: replace all copy using the content and branding list in §5.4. Remove fake reviews, ratings, and edition numbers. Replace the fake countdown with a real sale end date or remove it.

### 🟠 High

**H1. Tracking numbers/courier never saved to database.** `storeService.ts:325-366` writes only `status` and `trackingUpdates`. `StoreContext.tsx:563-573` sets them in React state only. The fix is to persist `trackingNumber` and `courierName`, and to write status history server-side.

**H2. Order PII readable by anyone who knows or guesses an order ID.** `firestore.rules:71` has `allow get: if isValidId(orderId)`. IDs are `AC-2026-` plus 8 digits (`storeService.ts:192-196`), and the result includes name, phone, and full address. Fix: use a long random ID (for example Firestore auto-ID) as the lookup token, or require ID **plus** phone number checked in a Cloud Function that returns only status fields.

**H3. Review spam and fake "verified" badges.** `firestore.rules:45-53` lets anyone create reviews and set any `status` and `verifiedPurchase`. The client forces `status: 'approved'` and `verifiedPurchase: true` (`storeService.ts:441`, `ProductDetailsModal.tsx:126`). Fix: create reviews as `pending`, never trust `verifiedPurchase` from the client, add an admin moderation tab (the `'reviews'` tab type already exists but has no UI), and add rate limiting or reCAPTCHA / App Check.

**H4. Stock is never decremented in the database, so overselling is possible.** `storeService.ts:247-264` updates localStorage only. Fix this inside the server-side order transaction (C4).

**H5. Draft/inactive products shown to customers.** `ProductGrid.tsx:30-66` and `ShopPage.tsx:67-113` only hide non-`active` products when "In stock only" is ticked. Header search, Vault Deals, and related products don't filter either. Fix: filter `status === 'active'` centrally when loading products, and preferably in the Firestore query.

**H6. Admin settings form can overwrite real settings with defaults.** `AdminDashboard.tsx:93` initialises `settingsForm` from `settings` once at mount, before Firestore data loads. Saving then writes stale `INITIAL_SETTINGS` (USD, fake address). Also, `fetchStoreSettings` forces `brandName: 'AA JEWELERS'` regardless of the saved value (`storeService.ts:379, 397`). Fix: sync the form when `settings` changes, and remove the forced overrides.

**H7. No URLs / routing.** Home, shop, and products are all one URL (`App.tsx:30`). You can't share a product link on WhatsApp or Instagram, the back button leaves the site, Google can't index products, and ads can't deep-link. Fix: add `react-router` with `/`, `/shop/:category`, `/product/:slug`, `/track`, `/policies/*`, and `/admin`.

**H8. Currency is USD and "$" is hardcoded in about 40 places.** `settings.currency` and `currencySymbol` exist but are never used. The price filter max is hardcoded at `7000` (`ShopPage.tsx:44`, `ProductGrid.tsx:25`), and delivery is `$15` with free delivery over `$200` (`initialData.ts:11-14`). Fix: add a single `formatPrice()` helper using `Intl.NumberFormat('en-PK', {style:'currency', currency:'PKR'})` → "Rs 2,499", and make the price range dynamic.

**H9. Customer accounts are fake.** `StoreContext.tsx:535-557`. Decide between guest checkout only (recommended for launch) and real Firebase email/phone auth. Until then, remove the login/register UI for customers.

### 🟡 Medium

**M1. Cart: "remove" deletes every variant of a product.** `removeFromCart` and `updateCartQuantity` match by `product.id` only (`StoreContext.tsx:314-334`). A ring in size 6 and size 7 are both removed or changed together. Key cart lines by `id + size + variant`.

**M2. Cart state mutation.** `StoreContext.tsx:299` mutates `next[existingIndex].quantity` on a shallow-copied array. The previous state object gets modified, and in React StrictMode (dev) the quantity can double-increment. Use `next[i] = {...next[i], quantity: newQty}`.

**M3. Stale prices and stock in the cart.** The cart stores a full `product` snapshot in localStorage. If the owner changes a price, returning customers still see and submit the old price. Store only `productId`, `qty`, and `variant`, and re-hydrate from the latest products (plus the server check from C4).

**M4. Out-of-stock item can be added with quantity 0.** `StoreContext.tsx:304` has `Math.min(quantity, product.stock)` → 0 when stock is 0. Block adding when `stock <= 0`.

**M5. Tracking modal empty after checkout.** `OrderTrackingModal.tsx:18-22` initialises `query` and `searchedOrder` from `trackingOrderId` once at first mount. The component stays mounted, so "Track Delivery" from the success screen opens an empty box. The same pattern affects `ProductDetailsModal.tsx:39-53` (quantity, metal, and size carry over between products) and `CheckoutModal.tsx:32-41` (`user` captured once).

**M6. Weak checkout validation.** Phone only needs 8+ characters (`CheckoutModal.tsx:60`). There's no Pakistani mobile format check (`03XXXXXXXXX` / `+923XXXXXXXXX`), no city list, and no max lengths matching the Firestore rules (a long address gives a silent failure, see C2). Add proper validation and inline field errors.

**M7. Admin stock input can't show 0.** `AdminDashboard.tsx:1458` has `value={editingProduct.stock || 1}`. Use `?? 0`.

**M8. Admin email check without verification.** `firestore.rules:17` uses `request.auth.token.email == …` without `request.auth.token.email_verified == true`. If email/password sign-up is ever enabled, someone could register that email unverified. Use UID-based admin docs or claims.

**M9. Firebase long-polling forced.** `firebase/config.ts:15-21` sets `experimentalForceLongPolling: true` for the AI Studio iframe, which is slower in production. Remove it.

**M10. Hardcoded owner emails in 10+ places** (`StoreContext.tsx`, `NewsletterSubscription.tsx:29-44`, `CheckoutModal.tsx:389`, `AdminDashboard.tsx`). Move to settings and env, and move admin identity to Firebase.

### ⚡ Performance

| Issue | Where | Fix |
|---|---|---|
| 1.2 MB single JS bundle | build output | Lazy-load `AdminDashboard` (1,613 lines), comparison modal, and the other modals with `React.lazy`. Admin code should never ship to shoppers |
| 566 KB logo JPEG used as `logo.png`, `logo.jpg`, `apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png`, and `src/assets/images/…` | `public/` | Export a proper SVG/PNG logo at about 20–40 KB, and real 192/512 PNG icons |
| PWA precache 3.5 MB | `vite.config.ts:49-50` | Fixing the icons shrinks this. Consider not precaching large images |
| Product images: Unsplash hot-links at 1000px, no `srcset`, `loading="lazy"` only in `ProductCard.tsx:89` | many components | Host real photos on Cloudinary or Firebase Storage with auto format/size (`f_auto,q_auto,w_…`). Add lazy loading everywhere below the fold |
| Loads all products, reviews, and orders on every visit | `StoreContext.tsx:257-281` | Fine for under ~200 products. Later, paginate and load reviews per product |
| Google Fonts: 2 families × many weights | `index.html:20` | Trim to the weights actually used |

### 🔎 SEO & metadata

| Issue | Where | Fix |
|---|---|---|
| Title, description, and OG text describe "Haute Joaillerie… gold, diamond" | `index.html:6-15` | Rewrite for artificial jewellery (§5.4) |
| No `og:image`, `og:url`, canonical, or Twitter image | `index.html` | Add them. Social sharing matters most for this business |
| No `robots.txt`, no `sitemap.xml` | `public/` | Add both (a sitemap needs product URLs, see H7) |
| No product structured data (JSON-LD `Product`, `Offer`, `priceCurrency: PKR`) | n/a | Add per product page |
| SPA with no per-page titles or meta | n/a | With routing, set `<title>` and meta per route. For good product previews on WhatsApp and Facebook, prerender product pages or use SSR (see roadmap) |
| Brand spelled inconsistently: "AA JEWELERS" (US) and "AA JEWELLERS" (UK/PK) | throughout | Choose one (question for you) |
| `lang="en"` only | `index.html:2` | Fine. Consider Urdu copy later |

### ♿ Accessibility & UX
- Dark gold-on-black theme: several small text sizes (`text-[10px]`, `text-[11px]`) in grey `#A89F91` on near-black likely fail WCAG contrast. Check with Lighthouse.
- Modals have no focus trap, no `role="dialog"`/`aria-modal`, and no Escape-to-close in most cases.
- Almost all logo `alt` text is "AA JEWELLERS" (18 instances). Product images use only the product name as alt. Improve per §5.4.
- Loading states: `SkeletonLoader` exists, but checkout errors are generic. There's no offline or error screen if Firestore fails (the site silently shows fake products).
- Heavy animation (Lenis smooth scroll, motion on everything) with no `prefers-reduced-motion` handling. It can feel sluggish on low-end Android phones.
- Mobile menu, drawers, and checkout render and fit, but haven't been device-tested (see testing checklist).

### 🧹 Code quality
- **Unused dependencies:** `@google/genai`, `express`, `dotenv`, `canvas-confetti`, `tsx`, `esbuild`, `autoprefixer`, `@types/express`. Remove them.
- **Duplicated logic:** filtering and sorting is copy-pasted between `ProductGrid.tsx:30-92` and `ShopPage.tsx:67-140`. Owner-email checks are repeated 6+ times. Order status labels are defined in three places.
- **Huge files:** `AdminDashboard.tsx` (1,613 lines), `StoreContext.tsx` (743 lines, with modal state, auth, cart, admin, and data mixed together).
- **Weak types:** many `as any`, `any` in handlers (`handleUpdateDetailStatus(newStatus: any)`), and unused `orderStatus` duplicate field.
- **No tests, no CI, no linter** (the `lint` script is just `tsc`). No ESLint or Prettier.
- `package.json` name is `"react-example"`, version `0.0.0`.
- `npm audit`: **0 vulnerabilities** ✅.

### ⚖️ Legal & business essentials

| Item | Status |
|---|---|
| Privacy Policy | ❌ Missing. Needed: you collect names, phones, addresses, and emails |
| Terms & Conditions | ❌ Missing |
| Return / Refund / Exchange Policy | ❌ Only a one-line fake "30-day insured returns… with certificates" in settings |
| Shipping Policy (areas, charges, timelines) | ❌ Fake "insured express courier, signature required" |
| Contact page (real address, phone, email, hours) | ⚠️ Footer only. Address likely fake |
| Business identity (NTN / registered name) | ❌ Not shown. Payment gateways will require it |
| Cookie notice | ⚠️ Not strictly required in Pakistan without tracking. **Needed once you add Meta Pixel or GA** if you get EU/UK visitors. A simple notice is enough |
| Product disclaimer ("artificial / imitation, gold-plated, not real gold") | ❌ Missing. **Important** to avoid disputes |
| Care instructions for plated jewellery | ❌ Current care text is for fine gold |

---

## 5. Go-Live Roadmap

Effort key: **S** = under 1 day · **M** = 1–3 days · **L** = 3+ days.

### 5.1 Blockers (before any real customer)

| # | Task | Effort |
|---|---|---|
| B1 | **Move to your own Firebase project**: read config from env, use the default DB, deploy `firestore.rules`, remove AI Studio config and long-polling | S |
| B2 | **Real admin auth**: delete password login, use Firebase Auth with an `admins/{uid}` doc or custom claim enforced by rules, hide admin from public nav, add an `/admin` route | M |
| B3 | **Server-side order placement** (Netlify Function `place-order`): validate input, recompute prices, delivery, and coupon from DB, check and decrement stock in a transaction, write the order, return the ID. Deny direct client writes to `orders`. Show real errors to the customer | M–L |
| B4 | **Owner email on every order** (Gmail SMTP, free) from the same function. Recipient email editable in admin settings. Remove the fake "notification dispatched" text | S–M |
| B5 | **Admin orders dashboard reads Firestore** (real-time), with status updates and tracking number/courier persisted | M |
| B6 | **Remove all localStorage "fallback" writes** for products, orders, settings, and reviews. Only cart, wishlist, and compare stay local | M |
| B7 | **Rebrand to Aura Adorn + content rewrite**: rename the brand everywhere. Remove fine-jewellery claims, fake reviews, ratings, editions, countdown, and fake address. Enter real products with real photos in PKR (§5.4) | M (dev) + owner time |
| B8 | **Currency → PKR** everywhere via one formatter. Default delivery **Rs 200** (admin-editable), optional free-delivery threshold. Make the price filter dynamic | S |
| B9 | **Fix order-tracking privacy** (H2) and review spam (H3) | S–M |
| B10 | **Policy pages**: Privacy, Terms, Returns/Exchange, Shipping, Contact, plus an "artificial jewellery" disclaimer | S (dev) + owner content |
| B11 | **Hosting on Netlify (free) + domain + SSL** set up (see below) | S |
| B12 | Hide draft products (H5). Fix the settings form overwrite (H6). Remove fake customer login/register UI (H9) | S |
| B13 | **Admin-configurable catalogue**: category manager (stored in Firestore `categories`), admin-defined product attributes (material, finish, stones, colour) and size/variant options. Shop filters, nav, footer, and product form all read these instead of hardcoded lists | M |

### 5.2 Should have (for a smooth launch)

| # | Task | Effort |
|---|---|---|
| S1 | **Routing + shareable product URLs** (`react-router`), per-page title and meta | M |
| S2 | **Admin image upload** (Cloudinary unsigned preset or Firebase Storage) with multiple images per product | M |
| S3 | Admin: coupon management, review moderation tab, low-stock view (category management moved to B13) | M |
| S4 | Cart fixes (M1–M4). Modal state reset bugs (M5). Checkout validation with PK phone format and city list (M6) | S–M |
| S5 | Customer order confirmation via **WhatsApp or SMS** (Pakistani customers often don't read email). Email confirmation if an email was given | M |
| S6 | Performance: lazy-load admin and modals, real logo and icons, optimised product images | S–M |
| S7 | SEO basics: new meta, OG image, `robots.txt`, `sitemap.xml`, JSON-LD Product | S–M |
| S8 | Analytics (GA4 + Meta Pixel) and error monitoring (Sentry) | S |
| S9 | Remove unused deps, commit `.gitignore`, pick one lockfile, update README with real setup and deploy steps | S |
| S10 | Accessibility pass: contrast, focus traps, Escape to close, reduced motion | S–M |
| S11 | **Owner push notifications** (Firebase Cloud Messaging): admin enables "notify me" in the dashboard, and the order function sends a push alongside the email | S–M |

### 5.3 Nice to have (post-launch)

| Task | Effort |
|---|---|
| Courier API integration (auto booking + tracking number, e.g. PostEx / Trax / Leopards / TCS) | M–L |
| Real customer accounts with order history (phone-OTP login fits PK customers) | M |
| Prerender or SSR for product pages (rich WhatsApp/Facebook previews, better SEO) | M–L |
| Urdu language toggle | M |
| Split `AdminDashboard` and `StoreContext` into smaller modules. Shared filter logic | M |
| Automated tests (Vitest for cart and pricing math, Playwright for the checkout flow) plus CI | M |
| Instagram feed / shop-the-look, abandoned-cart WhatsApp reminders | M |

### 5.4 Content & Branding Fix List (artificial jewellery)

**Remove everywhere:** "Haute Joaillerie", "Maison", "fine jewellery", "solid 18K/22K gold", "hallmarked", "916 / BIS", "platinum", "natural diamond", "VVS", "carat", "GIA / IGI / SSEF / GRS certified", report numbers, "lifetime authenticity", "vault", "armoured / insured / white-glove courier", "signature required", "velvet trousseau chest", "numbered edition X of Y worldwide", "Verified VIP client", "Patron Points", fake reviewer names, fake ratings, the fake countdown, "Diamond Pavilion" address, coupon `DIAMOND15`.

**Files to rewrite:** `src/data/initialData.ts` (all of it), `index.html`, `vite.config.ts` (manifest), `metadata.json`, `HeroSection.tsx`, `Footer.tsx`, `Header.tsx` (announcement, trust line), `VaultDealsSection.tsx` (rename to "Deals" or "Sale"), `LoyaltyBadge.tsx` (probably remove), `CheckoutModal.tsx`, `CartDrawer.tsx`, `OrderSuccessModal.tsx`, `OrderTrackingModal.tsx` (step labels), `CustomerAccountModal.tsx`, `WhatsAppConcierge.tsx` (quick questions), `ProductDetailsModal.tsx` (metal options, care text, sizes), `ShopPage.tsx` (filters), `storeService.ts` (status descriptions), `StoreContext.tsx` (toasts, defaults), `AdminDashboard.tsx` (defaults, labels).

**Suggested category structure** (please confirm what you actually stock):
| Category | Example sub-categories |
|---|---|
| Necklace Sets | Kundan sets, AD / zircon sets, choker sets, pearl sets, long sets (rani haar) |
| Earrings | Jhumkas, studs & tops, drops & danglers, chandbalis, hoops, ear cuffs |
| Bangles & Kangan | Bangle sets, kangan, kara, bracelets |
| Rings | Adjustable rings, cocktail rings, AD rings |
| Bridal Sets | Full bridal sets, walima sets, mehndi/haldi jewellery |
| Maang Tikka & Matha Patti | Tikka, matha patti, jhoomar / passa |
| Nose Pins & Nath | Nose pins, naths |
| Pendants & Chains | Pendant sets, lockets, chains |
| Anklets (Payal) | Single / pair |
| Hair Accessories | Hair pins, clips, juda pins |
| Men / Unisex (if stocked) | Stainless steel chains, bracelets, rings |

**Product data fields to change** (`src/types/index.ts:3-12`): replace `metal / karat / weight / stone / gemstoneWeight / certification / purity` with things like **Material / Base** (alloy, brass, copper, stainless steel), **Finish / Plating** (gold-plated, rose-gold-plated, silver-plated, oxidised), **Stones** (kundan, AD / cubic zirconia, pearls, polki-style, meenakari), **Colour**, **Pieces included** ("necklace + earrings + tikka"), **Size / Adjustable**, **Care / tarnish info**. Replace the hardcoded "18K / Platinum" selector with real variants (colour, bangle size 2.4 / 2.6 / 2.8 / 2.10) that can have their own stock and price.

**Tone of copy:** elegant and aspirational but **honest and affordable**. Say "Luxury look, everyday price" rather than "Maison de Haute Joaillerie". Talk about occasions customers actually shop for (weddings, mehndi, Eid, parties, gifts), mention "Cash on Delivery all over Pakistan", and state plating and care honestly. Keep the dark and gold visual design if you like it; it suits the product. A short line such as *"All our jewellery is high-quality artificial / imitation jewellery, gold- or silver-plated"* on product pages and in the FAQ prevents disputes.

**SEO keywords to target** (confirm cities and products): artificial jewellery Pakistan, artificial jewellery online Pakistan, imitation jewellery Lahore, bridal jewellery set artificial, kundan jewellery set Pakistan, jhumka earrings online, bangles online Pakistan, American diamond (AD) jewellery Pakistan, fashion jewellery cash on delivery, mehndi jewellery, gold-plated jewellery Pakistan, jewellery gifts for her Pakistan.

**Example meta:**
- Title (≤60 chars): `Aura Adorn | Artificial & Bridal Jewellery in Pakistan`
- Description (≤155 chars): `Shop elegant artificial jewellery: kundan & AD sets, jhumkas, bangles, rings & bridal sets. Cash on Delivery all over Pakistan.`

**Alt text pattern:** `"<Product name>: <finish> <type> with <stones>, <view>"`. For example: `"Noor Kundan Choker Set: gold-plated choker necklace with pearl drops and matching jhumkas, front view"`. Logo alt: `"Aura Adorn logo"`. Hero alt should describe the actual photo.

**Order and status wording:** "Order placed → Confirmed (we'll call you) → Packed → Handed to courier (TCS / Leopards / …) → Delivered (cash collected)" instead of "Vault Polish & Assembly" and "Armoured Courier".

### 5.5 Recommendations

#### Backend & database: **Firebase Spark (free) + Netlify Functions (free)**, updated for the "free only" decision
- **Firestore + Firebase Auth** on your `aa-jewelers` project, Spark plan: 50k reads/day, 20k writes/day, 1 GB storage. That's plenty for a small shop.
- **Server logic on Netlify Functions** (Node, 125k calls/month free, commercial use allowed on the free plan). The functions use `firebase-admin` with a service-account key stored as a Netlify secret:
  - `place-order`: recomputes prices, delivery and coupons from the database, checks and decrements stock in a transaction, saves the order, emails the owner (and later sends a push).
  - `track-order`: order ID + phone → returns status only (fixes the privacy issue H2).
- Customers can no longer write orders directly. Security rules deny it, and only the function (admin SDK) writes.
- **Images:** Cloudinary free tier (unsigned upload preset from the admin panel). Firebase Storage now requires Blaze for new buckets.
- **Email:** Gmail SMTP via `nodemailer` using a Gmail **app password** for `auraadornjewellers@gmail.com`. Free, about 500 emails/day.
- **Push (later):** FCM web push is free and is sent from the same function.
- **Trade-off:** two platforms (Firebase for data, Netlify for hosting and functions) instead of one, but $0/month. *Rejected alternative:* browser-only with EmailJS. It's simpler, but anyone could submit fake prices, stock can't be safely decremented, and the email trigger is exposed.

#### Payments: **Cash on Delivery only (confirmed)**
No gateway integration. Checkout stays COD, and all "card / online payment" wording is removed. Consider a **COD confirmation call or WhatsApp step** before dispatch (an order status "Confirmed" the owner sets after calling) to reduce fake and returned orders, a big cost with COD in Pakistan. If online payment is wanted later, Safepay / PayFast / JazzCash / Easypaisa are the usual options, and they need a registered business and NTN.

#### Order management
- **Launch:** the fixed admin dashboard (real-time Firestore list, filters, status updates, tracking number, printable invoice or packing slip, "WhatsApp customer" button, which already exists), plus an **instant email alert to the owner** per order (push notification as a follow-up, S11).
- **Later:** courier booking via API (PostEx / Trax / Leopards / TCS offer COD and APIs), and a CSV export for accounting.

#### Hosting, domain, SSL, secrets
- **Netlify (free)** hosts the site and the functions: free SSL, CDN, auto-deploy on every Git push, and preview URLs for each branch. (Vercel's free tier forbids commercial use, so it's not suitable here.)
- **Domain:** a `.com` or `.pk` (PKNIC). Point DNS to the host, which issues SSL automatically.
- **Secrets:** `VITE_*` variables are **public** once built. That is fine for the Firebase web config, but never put email API keys or gateway secrets there. Store server secrets with `firebase functions:secrets:set`. Enable **Firebase App Check** and restrict the Firebase API key to your domain in Google Cloud Console.

#### Email / notifications
- **Owner alerts (confirmed: email now):** email via **Resend** or **Brevo** from the Cloud Function (free tiers cover this). Sending from your own domain (e.g. `orders@<domain>`) needs a few DNS records; until the domain is ready, Brevo can send from a verified Gmail address.
- **Owner push (follow-up, S11):** Firebase Cloud Messaging web push. The admin taps "Enable notifications" once per device, the token is saved in Firestore, and the order function pushes to it. Works on Android/desktop Chrome directly. On iPhone it needs the site installed to the home screen.
- **Customer:** order confirmation via WhatsApp or SMS (local SMS gateways such as Veevo, Eocean, or Twilio) is more effective in PK than email. Email only if provided. EmailJS (hinted in `.env.example`) works client-side but exposes your template to abuse. Prefer server-side sending.

#### Analytics & monitoring
- **GA4** for traffic and conversions, and the **Meta Pixel + Conversions API** if you run Facebook or Instagram ads (very likely for this business). **Microsoft Clarity** (free) for session recordings and mobile UX issues.
- **Sentry** (free tier) for JavaScript errors in the browser and in Cloud Functions.

### 5.6 Pre-launch testing checklist
- [ ] Place 5+ test orders on the **production URL** (guest, with and without email, with coupon, over and under the free-delivery threshold, multiple variants of the same product).
- [ ] Verify each order appears in the **Firestore console** and the **admin dashboard** within seconds, with correct server-computed totals in PKR.
- [ ] Owner receives the **email/WhatsApp alert** for each. Customer receives a confirmation.
- [ ] Tamper test: edit the price in browser devtools before submitting. The order must be rejected or corrected server-side.
- [ ] Stock: an order reduces stock. You can't order more than is in stock. Out-of-stock products can't be added.
- [ ] Admin: can't reach the dashboard when logged out or logged in as a non-admin Google account. Rules deny writes from non-admins (test with the Firebase Rules Playground).
- [ ] Status change and tracking number persist after a page refresh and on another device. The customer tracking page shows them.
- [ ] Order lookup doesn't expose another customer's address.
- [ ] Mobile: real Android (low-end + mid-range, Chrome) and iPhone (Safari). Menu, search, filters, product gallery, cart, checkout keyboard behaviour, WhatsApp buttons open the app.
- [ ] Lighthouse (mobile): Performance ≥ 70, Accessibility ≥ 90, SEO ≥ 90.
- [ ] Share a product link on WhatsApp and Facebook, and check the preview image and title.
- [ ] All policy pages reachable from the footer. No `href="#"` links. No leftover "diamond / 18K / GIA" text (grep the build).
- [ ] Payment sandbox tests (if a gateway is added): success, failure, cancel, and the webhook marking the order paid.
- [ ] Error path: turn off network mid-checkout. The customer sees a clear error and can retry. No duplicate orders.

---

## 6. Questions for You

### Answered (29 Sep 2026)
- Brand → **Aura Adorn**
- Categories & materials → **configurable from the admin panel**
- Delivery → **default Rs 200** (editable)
- Payment → **COD only**
- Owner alerts → **email now, push if easy** (planned as S11)
- Firebase project in `.env` → **owned by you**

### Still open. The first three are needed before starting work.
1. ~~**Blaze plan:**~~ Answered: free only, see §5.5. Old text: server-side order checks and sending email need Firebase Cloud Functions, which require the **Blaze** (pay-as-you-go) plan. At this volume the cost is normally Rs 0–a few hundred per month, and a budget alert can be set. OK to enable? (Without it, email would have to be sent from the browser via EmailJS, and prices couldn't be verified server-side. Not recommended.)
2. **Order alert email address:** `auraadornjewellers@gmail.com`? Any second recipient?
3. **Admin logins:** which Google account(s) should be admins (e.g. `auraadornjewellers@gmail.com`, `nirbanmubashirzubair@gmail.com`)?
4. **Logo:** the current logo file says "AA Jewellers". Do you have an Aura Adorn logo (SVG or high-res PNG)? If not, I can use a clean text wordmark for now.
5. **Contact details:** real address (or "online only"), phone/WhatsApp (`+92 333 8282369`?), business hours, and Instagram/Facebook/TikTok links.
6. **Free delivery:** free above a certain order amount, or always Rs 200?
7. **Return / exchange policy:** days and conditions (for the policy page).
8. **Courier(s)** you use today (for status wording and the tracking field).
9. **Discount codes** at launch, if any (the current `AA10`, `AURA`, and `DIAMOND15` codes will be removed).
10. **Domain:** do you own one already? Hosting on Firebase Hosting OK?
11. **Design:** keep the dark black-and-gold look?
12. **Products:** will you enter them yourself through the admin panel after launch prep, or send a spreadsheet and photos for bulk import?
