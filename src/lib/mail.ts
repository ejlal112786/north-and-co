import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import { formatMoney } from "./money";

function transport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export type OrderEmail = {
  orderNumber: string;
  accessToken: string;
  customerName: string;
  email: string;
  items: { name: string; variant: string; qty: number; price: number }[];
  totalCents: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shipping: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  estimatedDelivery?: string | null;
};

function wrap(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4efe6;color:#161411;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:32px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#f7f4ee;border:1px solid #ddd4c5;padding:32px;">
        <tr><td style="letter-spacing:.22em;font-size:12px;font-family:system-ui,sans-serif;">NORTH &amp; CO.</td></tr>
        <tr><td style="padding-top:18px;font-size:28px;">${title}</td></tr>
        <tr><td style="padding-top:16px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#3f3a34;">${inner}</td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function itemsTable(order: OrderEmail) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #ddd4c5;">${i.name}<br/><span style="color:#6f675c;font-size:12px;">${i.variant} × ${i.qty}</span></td><td align="right" style="border-bottom:1px solid #ddd4c5;">${formatMoney(i.price, order.currency)}</td></tr>`
    )
    .join("");
  return `<table width="100%">${rows}<tr><td style="padding-top:12px;"><strong>Total</strong></td><td align="right" style="padding-top:12px;"><strong>${formatMoney(order.totalCents, order.currency)}</strong></td></tr></table>`;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  type: string;
  html: string;
  orderId?: string;
}) {
  const log = await prisma.emailLog.create({
    data: {
      to: opts.to,
      subject: opts.subject,
      type: opts.type,
      body: opts.html,
      status: "queued",
      orderId: opts.orderId,
    },
  });
  const t = transport();
  if (!t) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "logged" },
    });
    return { logged: true };
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || "NORTH & CO. <samuel.w@example.com>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    await prisma.emailLog.update({ where: { id: log.id }, data: { status: "sent" } });
    return { sent: true };
  } catch (e) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "failed", error: e instanceof Error ? e.message : "send failed" },
    });
    return { failed: true };
  }
}

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export async function mailOrderConfirmation(order: OrderEmail) {
  const track = `${appUrl()}/track/${order.accessToken}`;
  const html = wrap(
    "Order confirmed",
    `<p>Hello ${order.customerName},</p>
     <p>We have your order <strong>${order.orderNumber}</strong>.</p>
     ${itemsTable(order)}
     <p>Payment: ${order.paymentMethod === "COD" ? "Cash on delivery" : "Card"} — ${order.paymentStatus}.</p>
     <p>Ship to:<br/>${order.shipping}</p>
     ${order.estimatedDelivery ? `<p>Estimated delivery: ${order.estimatedDelivery}</p>` : ""}
     <p><a href="${track}">Track this order</a> — keep this link. You do not need an account.</p>`
  );
  return sendMail({
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed`,
    type: "order_confirmation",
    html,
  });
}

export async function mailPayment(order: OrderEmail, kind: "success" | "failure") {
  const html = wrap(
    kind === "success" ? "Payment received" : "Payment failed",
    `<p>Order <strong>${order.orderNumber}</strong>: ${kind === "success" ? "your payment was verified." : "we could not complete the payment. Your cart was not charged, and stock was released."}</p>
     ${kind === "success" ? itemsTable(order) : `<p><a href="${appUrl()}/checkout">Return to checkout</a></p>`}`
  );
  return sendMail({
    to: order.email,
    subject: kind === "success" ? `Payment received — ${order.orderNumber}` : `Payment failed — ${order.orderNumber}`,
    type: kind === "success" ? "payment_confirmation" : "payment_failure",
    html,
  });
}

export async function mailStatus(order: OrderEmail, heading: string, type: string, extra = "") {
  const track = `${appUrl()}/track/${order.accessToken}`;
  const html = wrap(
    heading,
    `<p>Order <strong>${order.orderNumber}</strong> is now <strong>${order.status.replaceAll("_", " ").toLowerCase()}</strong>.</p>
     ${order.carrier && order.trackingNumber ? `<p>Carrier: ${order.carrier}<br/>Tracking: ${order.trackingNumber}</p>` : ""}
     ${extra}
     <p><a href="${track}">View tracking</a></p>`
  );
  return sendMail({
    to: order.email,
    subject: `${heading} — ${order.orderNumber}`,
    type,
    html,
  });
}

export async function mailRefund(order: OrderEmail, amountCents: number) {
  const html = wrap(
    "Refund processed",
    `<p>A refund of ${formatMoney(amountCents, order.currency)} has been recorded for order ${order.orderNumber}.</p>`
  );
  return sendMail({
    to: order.email,
    subject: `Refund — ${order.orderNumber}`,
    type: "refund",
    html,
  });
}

export async function mailReturnUpdate(order: OrderEmail, status: string, note = "") {
  const html = wrap(
    "Return update",
    `<p>Your return for order ${order.orderNumber} is now <strong>${status}</strong>.</p><p>${note}</p>`
  );
  return sendMail({
    to: order.email,
    subject: `Return ${status} — ${order.orderNumber}`,
    type: "return_update",
    html,
  });
}

export function deskInbox() {
  return process.env.CONTACT_INBOX || "spideyspider112786@gmail.com";
}

export async function mailDeskNotice(subject: string, htmlInner: string, type: string) {
  return sendMail({
    to: deskInbox(),
    subject,
    type,
    html: wrap(subject, htmlInner),
  });
}

export function orderToEmail(order: {
  orderNumber: string;
  accessToken: string;
  customerName: string;
  email: string;
  totalCents: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  estimatedDelivery?: string | null;
  items: { productName: string; variantTitle: string; quantity: number; totalCents: number }[];
}): OrderEmail {
  const ship = JSON.parse(order.shippingAddress) as {
    address?: string;
    city?: string;
    state?: string;
    postal?: string;
    country?: string;
  };
  return {
    orderNumber: order.orderNumber,
    accessToken: order.accessToken,
    customerName: order.customerName,
    email: order.email,
    items: order.items.map((i) => ({
      name: i.productName,
      variant: i.variantTitle,
      qty: i.quantity,
      price: i.totalCents,
    })),
    totalCents: order.totalCents,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    shipping: [ship.address, ship.city, ship.state, ship.postal, ship.country].filter(Boolean).join(", "),
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    estimatedDelivery: order.estimatedDelivery,
  };
}
