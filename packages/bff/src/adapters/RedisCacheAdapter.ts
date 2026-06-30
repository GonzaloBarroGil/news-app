import { Redis } from "ioredis";
import type { CacheService } from "../ports/CacheService";
import { loadEnv } from "../config/env";

export class RedisCacheAdapter implements CacheService {
  private readonly redis: Redis;
  private readonly ttl: number;
  private connected: boolean;

  constructor() {
    const env = loadEnv();
    this.ttl = env.CACHE_TTL_ARTICLES;
    this.connected = true;

    this.redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy() {
        return null;
      },
      lazyConnect: true,
    });

    this.redis.on("error", () => {
      this.connected = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;

    try {
      const raw = await this.redis.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.connected) return;

    try {
      const effectiveTtl = ttlSeconds ?? this.ttl;
      await this.redis.set(key, JSON.stringify(value), "EX", effectiveTtl);
    } catch {
      return;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.connected) return;

    try {
      await this.redis.del(key);
    } catch {
      return;
    }
  }
}
