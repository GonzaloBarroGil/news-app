import { Redis } from "ioredis";
import type { CacheService } from "../ports/CacheService";
import { loadEnv } from "../config/env";

export class RedisCacheAdapter implements CacheService {
  private readonly redis: Redis | null;
  private readonly ttl: number;
  private connected: boolean;

  constructor() {
    const env = loadEnv();
    this.ttl = env.CACHE_TTL_ARTICLES;
    this.connected = false;

    const redisUrl = env.REDIS_URL;
    const isDefaultUrl = redisUrl === "redis://localhost:6379";
    const isUpstash = redisUrl.startsWith("rediss://");
    const isValidUrl = isUpstash || (!isDefaultUrl && redisUrl.length > 0);

    if (!isValidUrl) {
      this.redis = null;
      return;
    }

    this.redis = new Redis(redisUrl, {
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      retryStrategy() {
        return null;
      },
    });

    this.redis.on("error", () => {
      this.connected = false;
    });

    this.redis.on("connect", () => {
      this.connected = true;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.connected) return null;

    try {
      const raw = await this.redis.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.redis || !this.connected) return;

    try {
      const effectiveTtl = ttlSeconds ?? this.ttl;
      await this.redis.set(key, JSON.stringify(value), "EX", effectiveTtl);
    } catch {
      return;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(key);
    } catch {
      return;
    }
  }
}
