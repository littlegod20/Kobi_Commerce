import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:4000"),
});

export type WebEnv = z.infer<typeof EnvSchema>;

export function getEnv(): WebEnv {
  return EnvSchema.parse(import.meta.env);
}

