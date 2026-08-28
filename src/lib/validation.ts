import { z } from "zod";

export const addressSchema = z.object({
  country: z.string().min(2).max(2),
  state: z.string().min(1).max(80),
  city: z.string().min(1).max(80),
  address: z.string().min(3).max(200),
  postal: z.string().min(2).max(20),
  instructions: z.string().max(300).optional().default(""),
});

export const checkoutSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().min(6).max(30),
  shipping: addressSchema,
  billingSame: z.boolean().default(true),
  billing: addressSchema.optional(),
  shippingMethodId: z.string().min(1),
  paymentMethod: z.enum(["RAPID", "COD"]),
  couponCode: z.string().max(40).optional(),
});

export const reviewSchema = z.object({
  productSlug: z.string().min(1),
  authorName: z.string().min(2).max(80),
  authorEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().default(""),
  body: z.string().min(10).max(2000),
  orderNumber: z.string().max(40).optional(),
});

export const trackSchema = z.object({
  orderNumber: z.string().min(4),
  email: z.string().email(),
});

export const returnSchema = z.object({
  orderNumber: z.string().min(4),
  email: z.string().email(),
  reason: z.string().min(8).max(500),
  items: z
    .array(
      z.object({
        orderItemId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

