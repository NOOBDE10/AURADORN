# AURA ADORN — Setup & Go-Live Guide

This guide takes the shop from code on your laptop to a live website your brother can run from his phone.
Everything here is **free to start** (Firebase Spark plan, EmailJS free, Cloudinary free). The only paid item is a domain name.

**Time needed:** about 1–2 hours the first time.

**Use your brother's Google account** for Firebase, EmailJS and Cloudinary, so the business owns its data. Add yourself as a collaborator where possible.

---

## What does what

| Piece | Service | Why |
|---|---|---|
| Website hosting | Firebase Hosting | Free, fast, HTTPS included |
| Database (products, orders, settings, discount codes) | Firebase Firestore | Live updates, free tier is plenty to start |
| Owner & customer logins | Firebase Authentication | Email + password |
| New-order email to the owner | EmailJS | Sends email straight from the website, no server needed |
| Product photo uploads | Cloudinary | Free image hosting that auto-compresses photos for mobile |

---

## Step 1 — Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Create a project**.
2. Name it e.g. `aura-adorn`. You can turn **off** Google Analytics.
3. Stay on the free **Spark** plan.

## Step 2 — Connect the website to Firebase

1. In the project, click the **`</>` (Web)** icon → register an app called `aura-adorn-web`. Don't tick "Firebase Hosting" here.
2. Firebase shows a `firebaseConfig = { ... }` block. Keep this page open.
3. In the `mub-web` folder, copy `.env.example` to a new file called **`.env.local`**, and fill in the values from that block:

   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=aura-adorn.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=aura-adorn
   VITE_FIREBASE_STORAGE_BUCKET=aura-adorn.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
   ```

   These keys are **not secret** (they end up in the website anyway). Security comes from the database rules in Step 4.
   `.env.local` is git-ignored, so keep a copy somewhere safe (e.g. a password manager).

## Step 3 — Create the database and turn on logins

**Firestore**
1. Left menu → **Build → Firestore Database → Create database**.
2. Choose **Standard edition**, then **Start in production mode**.
3. Location: **`asia-south1` (Mumbai)**, the closest to Pakistan. ⚠️ This can't be changed later.

**Authentication**
1. Left menu → **Build → Authentication → Get started**.
2. **Sign-in method → Email/Password → Enable → Save.** (Leave "Email link" off.)
3. Optional: **Templates** tab → change the sender name to "AURA ADORN", so password-reset emails look right.

## Step 4 — Install the Firebase tool and upload the security rules

On your laptop, in the `mub-web` folder:

```bash
npm install                      # installs the website's packages
npm install -g firebase-tools    # the Firebase command-line tool (one time)
firebase login                   # opens the browser — log in with the SAME Google account
firebase use --add               # pick your project, give it the alias "default"
npm run deploy:rules             # uploads firestore.rules to your database
```

The rules in `firestore.rules` make sure that:
- Anyone can browse products and place a Cash on Delivery order.
- Only the owner (admin) can change products, prices, settings and discount codes, or see all orders.
- Customers can only see their own orders, and can track one order if they know its order number.
- New reviews stay hidden until the owner approves them.

> Every time you change `firestore.rules`, run `npm run deploy:rules` again.

## Step 5 — Create the owner's admin account

1. Firebase → **Authentication → Users → Add user**. Enter your brother's email and a strong password.
2. Copy the new user's **User UID** (a long code like `Xk3...9aZ`).
3. Firebase → **Firestore Database → + Start collection**:
   - Collection ID: `admins`
   - Document ID: **paste the UID**
   - Add a field: `email` (string) = your brother's email
   - **Save**

That account is now the admin. To add another staff member later, repeat this step with their account.
To remove someone's admin access, delete their document from `admins`.

> The owner can reset a forgotten password from the admin login screen ("Forgot password?").

## Step 6 — New-order emails (EmailJS)

The shop saves every order even without this step, and the admin panel chimes when a new order arrives.
Email just makes sure your brother sees orders when the admin panel isn't open.

1. Sign up at <https://www.emailjs.com> (free: 200 emails/month).
2. **Email Services → Add New Service → Gmail** → connect your brother's Gmail → note the **Service ID**.
3. **Email Templates → Create New Template**:
   - **To Email:** type your brother's email address **directly** (e.g. `owner@gmail.com`).
     ⚠️ Do **not** use a `{{variable}}` here, or strangers could use your account to send spam.
   - **Subject:** `🛍️ New order {{order_id}} — {{total}}`
   - **Reply To:** `{{reply_to}}`
   - **Content:**

     ```
     New Cash on Delivery order on {{brand_name}}

     Order: {{order_id}}   ({{order_date}})
     Customer: {{customer_name}}
     Phone: {{customer_phone}}
     Email: {{customer_email}}
     Address: {{address}}
     Notes: {{notes}}

     Items:
     {{items}}

     Subtotal: {{subtotal}}
     Discount: {{discount}}
     Delivery: {{delivery}}
     TOTAL TO COLLECT: {{total}}

     Open admin panel: {{admin_url}}
     ```

   - Save and note the **Template ID**.
4. **Account → General** → copy your **Public Key**.
5. Add these to `.env.local`:

   ```
   VITE_EMAILJS_SERVICE_ID=service_xxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxx
   ```

6. Tip: on your brother's phone, set a Gmail notification for emails with the subject "New order", so he gets a ping.

## Step 7 — Product photo uploads (Cloudinary)

1. Sign up at <https://cloudinary.com> (free plan). Note your **Cloud name** on the dashboard.
2. **Settings (⚙️) → Upload → Upload presets → Add upload preset**:
   - **Signing mode: Unsigned**
   - **Folder:** `aura-adorn`
   - Optional, recommended: under *Upload manipulations / Incoming transformation*, limit size to width 2000, height 2000 (crop mode "limit").
   - Save and note the **preset name**.
3. Add to `.env.local`:

   ```
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-preset-name
   ```

Photos taken on a phone are automatically shrunk before uploading, and served in the best format for each device.

## Step 8 — Try it on your laptop

```bash
npm run dev
```

Open <http://localhost:3000/?admin> and sign in with the owner account. The **Overview** tab shows a "Getting started" checklist:

1. **Categories** → *Create starter categories* (then rename, re-photo or delete as you like).
2. **Settings** → WhatsApp number, phone, email, address, delivery charge, free-delivery amount, home-page banner, trust points and policies → **Save**.
   Only promise what the business really offers (e.g. don't say "certified" unless it is).
3. **Products** → *Add product* → photos, name, price, stock → **Save**.
4. **Discount codes** → create one to test, e.g. `WELCOME10`.

Then test as a customer in a private/incognito window:
- [ ] Add a product to the bag, apply the discount code, check out with a real mobile number.
- [ ] The order appears in admin within a second (with a chime), and the email arrives.
- [ ] Mark the order **Confirmed**: the product's stock goes down. Mark it **Cancelled**: the stock comes back.
- [ ] Track the order from the site footer using the order number.
- [ ] Leave a review: it shows in admin under **Reviews** and appears on the product only after you approve it.
- [ ] Create a customer account, place an order while signed in, and check it under **My Account**.
- [ ] Delete the test orders afterwards (open the order → Delete).

## Step 9 — Put it live

```bash
npm run deploy
```

This builds the site with your `.env.local` values, then uploads the website and the database rules.
When it finishes it prints your live address: **`https://<project-id>.web.app`** 🎉

Run `npm run deploy` again any time the code changes. Products, prices and settings **don't** need a deploy: the owner changes those in the admin panel and they update live.

## Step 10 — Your own domain (e.g. auraadorn.pk or auraadorn.com)

1. Buy the domain. `.com` domains are available from Namecheap, GoDaddy, Cloudflare and others; `.pk` domains come through PKNIC-accredited resellers.
2. Firebase → **Hosting → Add custom domain** → enter the domain → Firebase shows DNS records (A / TXT).
3. Add those records in your domain seller's DNS settings. It can take a few hours; the HTTPS certificate is set up automatically.
4. Firebase → **Authentication → Settings → Authorized domains → Add domain** → add your new domain.

---

## How your brother runs the shop day to day

- Open **yourdomain.com/?admin** on his phone and sign in (tip: "Add to Home Screen" so it works like an app).
- **New order** → email + chime → open **Orders** → tap the order → **Call** or **WhatsApp** the customer to confirm.
- Change the status as the order moves: **Confirmed → Packing → Dispatched → Delivered (paid)**.
  Stock goes down automatically when an order is confirmed, and comes back if it is cancelled.
- Put the courier tracking number in the order's **private note**.
- **Print invoice** gives a packing slip showing the amount to collect.
- **Products**: add or edit pieces, change prices and stock, hide a product (draft), or mark it sold out.
- **Discount codes**: percentage or fixed rupees off, with optional minimum order, usage limit and expiry date.
- **Settings**: phone numbers, delivery charges, the announcement strip (great for sales), banner and policies.
- **Orders → CSV** downloads orders into Excel for accounts and backups. Do this monthly.

---

## Costs & limits (free tier)

| Service | Free allowance | Roughly enough for |
|---|---|---|
| Firestore | 50,000 reads + 20,000 writes per day, 1 GB | a few hundred visitors per day |
| Firebase Hosting | 10 GB storage, 360 MB/day transfer | well over 1,000 visitors per day (photos come from Cloudinary) |
| EmailJS | 200 emails / month | 200 orders per month |
| Cloudinary | 25 monthly credits (~25 GB) | thousands of product photos |

If the shop outgrows these, Firebase's pay-as-you-go **Blaze** plan charges only for usage above the free amounts. You can set a budget alert in Google Cloud.

## Troubleshooting

| Problem | Fix |
|---|---|
| Site says **"Setup required"** | `.env.local` is missing or incomplete. Fix it, then restart `npm run dev` or re-run `npm run deploy`. |
| Admin says **"Not an admin account"** | The `admins` document ID must be exactly the user's UID (Step 5). |
| **"Permission denied"** when saving in admin | Rules not deployed (`npm run deploy:rules`), or you are not signed in as admin. |
| **No order emails** | Check the three `VITE_EMAILJS_*` values, and the EmailJS dashboard → *History* for errors. Re-deploy after changing `.env.local`. |
| **Upload photos** button is greyed out | Cloudinary values are missing from `.env.local` (Step 7). You can paste image links meanwhile. |
| The site shows an old version after a deploy | It's an installable app, so it updates on the next visit. Refresh twice, or close and reopen the tab. |

## Security notes

- Never share the owner's password. Each staff member should get their own account (Step 5).
- The EmailJS and Cloudinary keys in the website are public by design. The email recipient is fixed in the EmailJS template, so the key can't be used to spam others. At worst someone could upload images to your Cloudinary account.
- Order totals are calculated in the customer's browser. The admin panel warns when an order's item prices don't match current catalogue prices, so always check the total when confirming an order on the phone.
