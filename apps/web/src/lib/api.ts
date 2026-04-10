import {
  CreateCheckoutSessionRequestSchema,
  CreateCheckoutSessionResponseSchema,
  type CreateCheckoutSessionRequest,
  type CreateCheckoutSessionResponse,
  OrderSchema,
  ProductSchema,
  type Product,
} from "@kobi/shared";

import { getEnv } from "./env";

const env = getEnv();

export type { Product };

async function apiFetch(path: string, init?: RequestInit) {
  const url = `${env.VITE_API_URL}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res;
}

export async function listProducts(params?: {
  q?: string;
  category?: string;
}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.category) qs.set("category", params.category);
  const res = await apiFetch(`/products${qs.size ? `?${qs.toString()}` : ""}`);
  const data = await res.json();
  return ProductSchema.array().parse(data);
}

export async function getProduct(id: string): Promise<Product> {
  const res = await apiFetch(`/products/${encodeURIComponent(id)}`);
  const data = await res.json();
  return ProductSchema.parse(data);
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionRequest,
): Promise<CreateCheckoutSessionResponse> {
  const body = CreateCheckoutSessionRequestSchema.parse(input);
  const res = await apiFetch("/checkout/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return CreateCheckoutSessionResponseSchema.parse(data);
}

export async function getOrderBySessionId(sessionId: string) {
  const res = await apiFetch(
    `/orders/by-session/${encodeURIComponent(sessionId)}`,
  );
  const data = await res.json();
  return OrderSchema.parse(data);
}

