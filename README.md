# NORTH & CO. — production e-commerce

A real guest-checkout store: browse, search, cart, server-priced checkout, **Rapid Gateway Pakistan** ([rapidgateway.pk](https://rapidgateway.pk)) **or** cash on delivery, order tracking without accounts, inventory, and an open desk at `/admin`.

There is **no customer or staff login/signup**. The desk has no password.

## Quick start

```bash
cp .env.example .env
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Store: [http://localhost:3000](http://localhost:3000)  
Desk: [http://localhost:3000/admin](http://localhost:3000/admin) (no login)

**Seed wipes orders.** On a live shop that already has orders, do **not** re-run seed. Use:

```bash
npx tsx prisma/upsert-content.ts
```

That updates CMS, FAQs, nav, store email, and adds missing products without deleting orders.

## Payments — Rapid Gateway Pakistan

Online pay is a **hosted redirect** (PCI stays with Rapid). One session unlocks **cards, JazzCash, easypaisa, and Raast**.

Set in `.env` (never in the browser):

```
RAPID_MERCHANT_ID=your_merchant_id
RAPID_SECRET_KEY=your_secret_key
RAPID_WEBHOOK_SECRET=your_webhook_secret
RAPID_API_BASE=https://api.rapidgateway.pk
APP_URL=https://your-domain.com
```

Flow:

1. Server `POST /v1/payments` with Bearer secret + merchant id.
2. **Amount is PKR rupees (major units), not paisa.** Shop totals are integer paisa; we send `Math.round(cents / 100)`. Example: `425000` paisa → Rapid `amount: 4250`, `currency: "PKR"`.
3. Customer is redirected to `checkout_url`.
4. Return URL is UX only. Webhook `POST /api/webhooks/rapid` must carry `X-RG-Signature` (HMAC-SHA256 of the raw body with `RAPID_WEBHOOK_SECRET`).
5. We **always re-query** `GET /v1/payments/:id` and mark paid only if Rapid status is succeeded **and** the amount matches the order.

If Merchant ID or Secret Key is empty, card/wallet checkout is refused. COD still works. The UI never invents a successful payment.

Sandbox test phones (from Rapid’s public guide): `+923000000001` auto-succeeds, `+923000000002` auto-fails.

Refunds: Admin order page. Rapid refunds call `POST /v1/payments/{id}/refunds`; COD refunds are recorded and emailed.

Webhook: `POST /api/webhooks/rapid`

## Email

Empty SMTP → emails are queued as `logged` in Admin → Messages.

Contact and newsletter notices go to `CONTACT_INBOX` or **spideyspider112786@gmail.com**.

## Production (Vercel + Neon)

This drop is already set to **PostgreSQL**. On Vercel:

1. Import the folder (or unzip `dist.zip`).
2. Set `DATABASE_URL` from Neon. Empty custom prefix. Production + Preview + Development.
3. `npx prisma db push` then **either** `npx tsx prisma/seed.ts` (first time) **or** `npx tsx prisma/upsert-content.ts` (later, keeps orders).
4. Set Rapid keys and `APP_URL`. SMTP if you want mail actually sent.

Do not commit live Rapid keys or database passwords.
