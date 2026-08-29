export const CMS_PAGES: { slug: string; title: string; seoTitle?: string; content: string }[] = [
  {
    slug: "about",
    title: "About the shop",
    seoTitle: "About — NORTH & CO.",
    content: `NORTH & CO. is a small shop that sells fewer things, finishes them properly, and lets you buy them without opening an account. There is no customer login, no password, no profile, and no dashboard. You are not a “member.” You are a person who wanted a sweater, or a lamp, or a set of plates, and we would rather take your order than take your identity.

This page is the honest version of who we are and how the till works. If a sentence here disagrees with a banner, this page wins.

## Guest checkout, on purpose

You browse. You add to a cart that lives in a cookie on this browser. You check out as a guest: name, email, phone, address. We email a receipt and a private tracking link. Keep the order number. That number plus the email you typed is how you see the order, start a return, or write the desk.

We do not offer “save my details for next time” as a customer account. If you come back on another phone, the cart and wishlist will not follow you. That is the cost of not building a login. We think it is the right cost.

Staff do not log in either. The desk at /admin is an open back office for packing, not a customer portal. Do not put card numbers there.

## What we make and what we buy

The house line is cut in small runs: shirts, trousers, knits we put our name on. Holm knits merino and cashmere in Italy. Field Theory waxes cloth and cuts leather in England. Atelier M fires stoneware. Kettle & Kiln makes soap, oil, and a candle that does not smell like a department store.

We would rather be out of a size than pretend we have it. Stock is checked on the server when you add to cart and again when you pay.

## How you pay

Prices are in Pakistani rupees. The number on a product card is a preview. The number at checkout is calculated on our server: line items, one coupon if you have one, shipping for the country you typed, tax if the desk has set a rate (it is zero unless we say otherwise).

Online pay goes through Rapid Gateway Pakistan. One session can offer cards, JazzCash, easypaisa, and Raast. Amount and currency sent to Rapid are PKR. We mark an order paid only after Rapid confirms the payment and the amount matches. The return URL is for your convenience. It is not proof of payment.

Cash on delivery is available where the checkout shows it. A COD order is not paid until the desk records the cash. We will not print a fake “success” screen.

If Rapid merchant keys are empty, online checkout is refused and COD still works. That is fail-closed, not a bug.

## The footer has no street address

We do not print a shop street address in the footer. If we open a counter you can visit, we will say so here and on Contact. Until then, write the desk. Do not visit a Mercer Street that does not exist.

## What we will not do

We will not invent a successful payment, fake stock, fake reviews, fake urgency, or hidden fees. If a button is shown, it does something, and the data comes from the database or the payment provider.`,
  },
  {
    slug: "shipping",
    title: "Shipping",
    seoTitle: "Shipping — NORTH & CO.",
    content: `Shipping is quoted on the server at checkout from the country you enter. The browser may show a preview. The invoice uses the server number. If those two ever disagree, the server is the price.

We do not promise a courier until the desk adds a carrier and a tracking number. Until then, the dates you see are estimates from the method you picked — not GPS.

## How a quote is built

You enter a country (and city/postcode where asked). The desk has zones: Pakistan, United States, Canada, and rest of world. Each zone has methods with a rate in PKR (stored as integer paisa on the server). Some methods have a free-above threshold, also in PKR. Coupons such as FREESHIP can zero the shipping line when the order meets their rules. One coupon per order.

Karachi local delivery is a Pakistan method. It is not the same as “tracked international.” If you live in Karachi and you want the local rate, choose Pakistan as the country and pick Karachi local at checkout when it is listed.

## Pakistan

When the country is PK, checkout can list tracked international and Karachi local delivery (if the desk has left them on). Times are ranges in days, not hours. Weekends and public holidays sit inside those ranges.

Cash on delivery, where shown, uses the same shipping methods. COD does not make the parcel faster. It only changes when we mark the order paid.

## United States, Canada, and elsewhere

Those zones exist in the desk. Pickup, when listed, is a method with a zero rate — it is not a street you should walk to unless Contact says we have a counter. Duties and taxes on inbound parcels outside Pakistan are yours unless the invoice says we prepaid them. We usually do not.

## Free shipping

Free shipping is either a threshold on a method (calculated in PKR on the server) or a coupon. A homepage strip is not a contract. If FREESHIP is active, it still has to pass its minimum and the one-coupon rule.

## After it leaves

Use Track order with the order number and the checkout email, or the private link in the confirmation mail. You will see order status, payment status, and a tracking number if the desk typed one. We do not invent a map.

If a parcel is stuck, write Contact and include the order number. We can only tell you what the carrier told us.`,
  },
  {
    slug: "returns",
    title: "Returns",
    seoTitle: "Returns — NORTH & CO.",
    content: `You have 30 days from delivery to request a return. Delivery means the day the desk marked the order delivered, or the day the carrier marked it delivered if we have that, whichever we recorded. If we have not marked it delivered, write the desk before you assume the window started.

This page is the policy. The form on /returns is how you start. We do not auto-refund because a form was submitted.

## What we take back

Unused, unwashed, unworn beyond a try-on, tags still on, in the original packing as far as you still have it. Underwear and opened beauty are not returned unless the item is faulty as received. Sale pieces marked final sale on the product or on the invoice cannot be returned except where Pakistani consumer law requires us to take a faulty item.

If we sent the wrong size or a damaged piece, say so in the reason. Photograph the fault if you can. That is not a fashion change-of-mind; we treat it faster.

## How to start

Open Returns. Enter the order number and the email used at checkout. Write why, in a real sentence (the form asks for at least a short reason). We approve, refuse, or write back within two business days. “Business days” means days the desk reads mail, not a chatbot.

You do not need an account. You need the order number. If you lost it, look in the confirmation email or write Contact from the same address.

## What happens after we approve

We tell you where to send the parcel, or whether Karachi local can collect. You pay return postage unless we sent the wrong thing or a fault. When we receive the goods and check them, we refund.

## Refunds

Rapid / card / wallet refunds go back through Rapid to the original payment when Rapid accepts the refund. That can take several days on Rapid’s side. We cannot “cash out” a card payment to a different account.

COD refunds are not automatic. The desk will arrange a bank transfer or store credit after we have the goods. We need a title, account number, and bank name from you. We will not send cash with a rider unless we explicitly say so.

## Exchanges

Ask in the return note. An exchange is a new line of stock, not a promise. If the size is gone, we refund instead.`,
  },
  {
    slug: "privacy",
    title: "Privacy",
    seoTitle: "Privacy — NORTH & CO.",
    content: `We do not create customer accounts. There is no password database for shoppers, no “my orders” login, and no profile we can sell. That is the point of the shop.

This page says what we still have to keep in order to pack a box and answer a question.

## What we store

From checkout: name, email, phone, shipping and billing address, delivery notes, the items, prices calculated on the server, payment method, and later the payment and shipment status. That lives in the order record so we can fulfil, track, refund, and show you the order when you prove you have the number and email.

From the contact form: name, email, phone if you typed one, and the message. Stored in the desk message list.

From the newsletter form: the email, if you opted in. You can write us to be removed.

We do not sell this. We do not rent it. We do not use it to build a shadow profile of your “style.”

## Payments

Cards, JazzCash, easypaisa, and Raast are processed by Rapid Gateway Pakistan. We never see full card numbers. We store Rapid’s payment id and the status Rapid reports, so we can mark paid only when they confirm amount and success. Webhooks are checked with a signature. The thank-you page is not a source of truth.

## Cookies and this browser

A cart cookie (so the basket survives a refresh). A wishlist in this browser only. A size-guide preference if you use the cookie sizer. A session cookie for analytics events such as product views and checkouts. There is no customer login cookie.

If you clear cookies, the cart and wishlist are gone. That is expected.

## Contact mail

Messages are emailed to spideyspider112786@gmail.com when SMTP is configured on the server, and they are stored for the desk either way. If SMTP is empty, the desk still has the message in Admin → Messages; the Gmail copy will not send until mail is set up.

## How long

We keep order records as long as we need them for tax, disputes, and returns. Contact messages stay until the desk deletes them. You can ask us to correct an address on an open order; we cannot unsend a parcel.

## Who to write

Use the contact form, or email the desk at spideyspider112786@gmail.com, from the address on the order if the question is about an order.`,
  },
  {
    slug: "terms",
    title: "Terms",
    seoTitle: "Terms — NORTH & CO.",
    content: `By placing an order you agree that these terms, the shipping page, the returns page, and the prices calculated on our server at checkout are the contract. Marketing copy yields to those pages.

If you are not able to agree, do not check out.

## Prices

Product cards are a preview in PKR. Checkout totals — subtotal, discount, shipping, tax, grand total — are computed on the server from the cart in the database, not from numbers the browser invented. We may refuse an order if the client total does not match.

## Stock

Stock is reserved when you begin a Rapid payment and deducted when Rapid confirms. COD deducts on confirmation. If two people buy the last unit, we may cancel the one we cannot fulfil and restore stock to the other. We email if we cancel.

## Payment

Rapid orders are unpaid until Rapid says the payment succeeded and the amount matches. Redirecting back to the shop is not payment. COD is unpaid until cash is received and the desk marks it. We do not show fake transaction ids.

If Rapid keys are missing, online pay is unavailable. That is refusal, not a discount.

## Cancellation

You may ask us to cancel before the parcel is packed. After it ships, use Returns. We may cancel for failed payment, suspected fraud, or no stock.

## Title and risk

Title and risk pass when the carrier has the parcel, or on pickup if that method exists and you collect. If a method called pickup is listed, it still does not create a public shop floor unless Contact says so.

## Law

These terms are governed by the laws of Pakistan. Courts in Karachi, Sindh, have jurisdiction, without prejudice to any mandatory consumer right you have where you live.

## Contact

Questions about these terms: the contact form or spideyspider112786@gmail.com.`,
  },
  {
    slug: "contact",
    title: "Contact",
    seoTitle: "Contact — NORTH & CO.",
    content: `Write us on the form at /contact. Every submission is stored for the desk. When SMTP is configured, a copy is emailed to spideyspider112786@gmail.com. That is the inbox. There is no second secret address.

We do not publish a phone number or a street address. If that changes, it will change here first. Do not come to a New York street we do not occupy.

## Orders

Include the order number. To see status, payment, and tracking, use Track order with the number and the checkout email. We will not ask you for a password. We cannot see an order from a different email without the number.

## Returns

Start on the Returns page, not only in a free-form message. The form creates a return record the desk can approve.

## Hours

The desk reads mail on business days, Pakistan time. We do not run live chat, bots, or “an agent is typing.” If you write on Friday night, expect Monday.

## Newsletter

The footer box is opt-in only. It is stored as an email list. It is not an account.`,
  },
];

export const FAQ_SEED: { sortOrder: number; question: string; answer: string }[] = [
  {
    sortOrder: 1,
    question: "Do I need an account?",
    answer:
      "No. There is no customer signup, login, or password. Checkout is guest-only. Keep the order number and the email you typed. That pair is how you track, return, and write us. The wishlist and cart live in this browser’s cookies, not in a profile.",
  },
  {
    sortOrder: 2,
    question: "How do I track a parcel?",
    answer:
      "Open Track order. Enter the order number (for example NC-1041) and the email used at checkout. Or use the private link in the confirmation email. You will see order status, payment status, and a tracking number only if the desk has added a carrier. We do not invent GPS or a fake map.",
  },
  {
    sortOrder: 3,
    question: "Do you offer cash on delivery?",
    answer:
      "Yes, where checkout shows it. COD stays payment-pending until the parcel is collected and the desk marks the cash received. We will not show the order as paid before that. COD is not faster shipping; it is only a different way to settle.",
  },
  {
    sortOrder: 4,
    question: "What online methods do you take?",
    answer:
      "Rapid Gateway Pakistan: credit and debit cards, JazzCash, easypaisa, and Raast, in PKR. We send Rapid the amount in rupees. An order is paid only after Rapid confirms success and the amount matches. If merchant keys are empty, online pay is refused and COD can still work. The page you return to after Rapid is not proof of payment.",
  },
  {
    sortOrder: 5,
    question: "When is stock deducted?",
    answer:
      "Rapid orders reserve stock at checkout and deduct it when payment is verified. COD deducts on confirmation. If we cancel, stock is restored. The site will not sell a size the server knows is gone; if two checkouts race, we cancel the one we cannot fulfil and email you.",
  },
  {
    sortOrder: 6,
    question: "Can I use more than one code?",
    answer:
      "One coupon per order. WELCOME10 is first order only. FREESHIP, when active, has a minimum in PKR. The discount is calculated on the server. If a code fails, the message is the real reason — we do not silently skip a rule.",
  },
  {
    sortOrder: 7,
    question: "How do returns work?",
    answer:
      "30 days from delivery, unused, tags on, original packing. Sale pieces marked final sale are not returned except for faults. Start at Returns with order number, checkout email, and a reason. We approve or write back within two business days. We do not auto-refund because a form was sent. Rapid refunds go to the original payment; COD refunds are arranged by the desk (transfer or credit) after we have the goods.",
  },
  {
    sortOrder: 8,
    question: "Is the wishlist saved to an account?",
    answer:
      "No. There is no account to save it to. It lives in this browser only. Clear cookies and it is gone. Same for the cart cookie and the size-guide helper.",
  },
  {
    sortOrder: 9,
    question: "Where is the store?",
    answer:
      "There is no street address in the footer. We sell online. Write the desk; do not visit an address we have not published on Contact.",
  },
  {
    sortOrder: 10,
    question: "What law applies?",
    answer:
      "The contract is governed by the laws of Pakistan. Courts in Karachi, Sindh, have jurisdiction, without taking away mandatory consumer rights you may have where you live.",
  },
  {
    sortOrder: 11,
    question: "How do I email you?",
    answer:
      "Use the contact form (stored for the desk and emailed to spideyspider112786@gmail.com when SMTP is set) or write that address directly. Include the order number for anything about a parcel. No live chat.",
  },
];
