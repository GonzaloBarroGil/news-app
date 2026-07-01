import { z } from "zod";

const envSchema = z.object({
  GUARDIAN_API_KEY: z.string().default("test-key"),
  GUARDIAN_BASE_URL: z.string().url().default("https://content.guardianapis.com"),
  GUARDIAN_TIMEOUT_MS: z.coerce.number().positive().default(10000),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CACHE_TTL_ARTICLES: z.coerce.number().positive().default(300),
  PORT: z.coerce.number().positive().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  MOCK_GUARDIAN_API: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(overrides?: Partial<Env>): Env {
  return envSchema.parse({ ...process.env, ...overrides });
}
