import { z } from "zod";

/** Railway / dashboards often omit `https://` or set an empty string — both break `z.string().url()`. */
function normalizeClientUrl(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim();
  if (s === "") return undefined;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.preprocess(
    normalizeClientUrl,
    z.string().url().default("http://localhost:5173"),
  ),
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  return EnvSchema.parse(process.env);
}

