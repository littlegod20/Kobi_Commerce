import { z } from "zod";

export const MoneySchema = z.object({
  currency: z.string().min(3).max(3).toUpperCase(),
  amountCents: z.number().int().nonnegative(),
});
export type Money = z.infer<typeof MoneySchema>;

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  images: z.array(z.string().url()).default([]),
  category: z.string().min(1),
  inventory: z.number().int().nonnegative(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CreateCheckoutSessionRequestSchema = z.object({
  items: z.array(CartItemSchema).min(1),
});
export type CreateCheckoutSessionRequest = z.infer<
  typeof CreateCheckoutSessionRequestSchema
>;

export const CreateCheckoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().url(),
  sessionId: z.string().min(1),
});
export type CreateCheckoutSessionResponse = z.infer<
  typeof CreateCheckoutSessionResponseSchema
>;

export const OrderStatusSchema = z.enum(["pending", "paid", "failed"]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotalCents: z.number().int().nonnegative(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().min(1),
  status: OrderStatusSchema,
  totalCents: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  stripeSessionId: z.string().min(1),
  stripePaymentIntentId: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  items: z.array(OrderItemSchema),
});
export type Order = z.infer<typeof OrderSchema>;

