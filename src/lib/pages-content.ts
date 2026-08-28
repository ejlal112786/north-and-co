export const CMS_PAGES: { slug: string; title: string; seoTitle?: string; content: string }[] = [
  {
    slug: "about",
    title: "About the shop",
    seoTitle: "About — NORTH & CO.",
    content: `NORTH & CO. is a guest-checkout shop. We sell fewer things, finish them properly, and do not ask you to open an account.

## How we sell
You browse, you add to a cart stored in a cookie, you check out as a guest. We email a receipt and a private tracking link. Keep the order number. There is no customer login, password, or profile.

## What we make and buy
The house line is cut in small runs. Holm knits merino and cashmere in Italy. Field Theory waxes cloth in England. Atelier M fires stoneware. Kettle & Kiln makes soap and oil without department-store perfume.

## How you pay
Online pay goes through Rapid Gateway Pakistan: cards, JazzCash, easypaisa, and Raast, in PKR. We mark an order paid only after Rapid confirms the amount. Cash on delivery stays unpaid until the desk records the cash.

## What we will not do
We will not invent a successful payment, fake stock, or fake reviews. If Rapid keys are empty, card checkout is refused and COD still works.`,
  },
  {
    slug: "shipping",
    title: "Shipping",
    seoTitle: "Shipping — NORTH & CO.",
    content: `Shipping is quoted on the server at checkout from the country you enter. Browser prices are a preview.

## Pakistan
Tracked international and Karachi local delivery are listed when your country is PK. Times are estimates until the desk adds a carrier and tracking number.

## Elsewhere
United States, Canada, and rest-of-world methods are in the desk. Free shipping, when offered, is a coupon or a threshold calculated in PKR — not a banner that lies.

## Duties
Duties and taxes on inbound parcels are yours unless the invoice says otherwise.

## After it ships
Use Track order with your order number and checkout email. We show the status we have. We do not invent GPS.`,
  },
  {
    slug: "returns",
    title: "Returns",
    seoTitle: "Returns — NORTH & CO.",
    content: `You have 30 days from delivery to request a return.

## What we take back
Unused, unwashed, tags on, original packing. Sale pieces marked final sale cannot be returned.

## How to start
Open Returns, enter the order number and the email from checkout, and tell us why. We approve or write back within two business days. We do not auto-refund outside this policy.

## Refunds
Card / Rapid refunds go to the original payment when Rapid accepts them. COD refunds are arranged by the desk (transfer or store credit).

## Exchanges
Ask in the return note. Stock is not promised until we confirm.`,
  },
  {
    slug: "privacy",
    title: "Privacy",
    seoTitle: "Privacy — NORTH & CO.",
    content: `We do not create customer accounts.

## What we store
Name, email, phone, and address from checkout, so we can ship and support that order. Contact-form messages. Newsletter emails if you opt in. We do not sell this.

## Payments
Cards and wallets are processed by Rapid Gateway. We never see full card numbers.

## Cookies
A cart cookie, a wishlist in this browser, a size-helper preference, and a few analytics events (views, checkouts). No login cookie for customers.

## Contact
Messages go to the desk inbox and are stored in the admin messages list.`,
  },
  {
    slug: "terms",
    title: "Terms",
    seoTitle: "Terms — NORTH & CO.",
    content: `By placing an order you agree that prices are as shown at checkout, calculated on our server.

## Stock and payment
We may cancel if stock was sold concurrently or if payment cannot be verified. Rapid payments are paid only after Rapid confirms amount and status. COD is not paid until cash is received.

## Title
Title passes on delivery.

## Law
These terms are the contract for this shop. If you need a specific jurisdiction named, write the desk.`,
  },
  {
    slug: "contact",
    title: "Contact",
    seoTitle: "Contact — NORTH & CO.",
    content: `Use the form on this page. Messages are stored for the desk and emailed to spideyspider112786@gmail.com when SMTP is configured.

## Orders
Include your order number. To see status, use Track order — we will not ask you for a password.

## Hours
The desk reads mail on business days. We do not run live chat.`,
  },
];

export const FAQ_SEED: { sortOrder: number; question: string; answer: string }[] = [
  { sortOrder: 1, question: "Do I need an account?", answer: "No. Checkout is guest-only. Keep your order number and the email you used." },
  { sortOrder: 2, question: "How do I track a parcel?", answer: "Open Track order, enter your order number and email, or use the private link in your confirmation." },
  { sortOrder: 3, question: "Do you offer cash on delivery?", answer: "Yes, where enabled. COD stays payment-pending until the parcel is collected and marked paid by the desk." },
  { sortOrder: 4, question: "What online methods do you take?", answer: "Rapid Gateway Pakistan: cards, JazzCash, easypaisa, and Raast, in PKR. Paid only after Rapid confirms. If keys are empty, online pay is refused." },
  { sortOrder: 5, question: "When is stock deducted?", answer: "Rapid orders reserve stock at checkout and deduct when payment is verified. COD deducts on confirmation. Cancellations restore stock." },
  { sortOrder: 6, question: "Can I use more than one code?", answer: "One coupon per order. WELCOME10 is first order only." },
  { sortOrder: 7, question: "How do returns work?", answer: "30 days from delivery, unused, tags on. Start from Returns with your order number. We do not auto-refund outside policy." },
  { sortOrder: 8, question: "Is the wishlist saved to an account?", answer: "No. It lives in this browser only." },
];
