import { z } from "zod";

const envSchema = z.object({
  GUARDIAN_API_KEY: z.string().min(1, "GUARDIAN_API_KEY is required"),
  GUARDIAN_BASE_URL: z.string().url().default("https://content.guardianapis.com"),
  GUARDIAN_TIMEOUT_MS: z.coerce.number().positive().default(10000),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  CACHE_TTL_ARTICLES: z.coerce.number().positive().default(300),
  PORT: z.coerce.number().positive().default(3001),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(overrides?: Partial<Env>): Env {
  return envSchema.parse({ ...process.env, ...overrides });
}

export const env = loadEnv();
