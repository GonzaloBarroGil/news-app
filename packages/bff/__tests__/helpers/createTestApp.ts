/**
 * BFF Test Helper — Mock Data & Port Interfaces
 *
 * Provides mock factories, test fixtures, and port interface definitions
 * for use in BFF unit and integration tests.
 *
 * NOTE: This file does NOT implement routes. The real app implementation
 * (which node-developer creates in Phase 4) lives in src/app.ts.
 * Tests import from src/ paths to exercise the real implementation.
 *
 * This file exists so that tests CAN reference shared types and fixtures
 * without redefining them once Phase 4 is complete.
 */

import type { ArticleDTO } from "@news-app/shared";

// ─── Test Fixtures ─────────────────────────────────────────────────────

/** A valid ArticleDTO matching the OpenAPI schema */
export const mockArticleDTO: ArticleDTO = {
  id: "world/2026/jun/29/climate-summit-deal",
  title: "Historic climate deal reached at Geneva summit",
  trailText: "World leaders agree to binding carbon-reduction targets.",
  thumbnail: "https://media.guardian.co.uk/img/thumb.jpg",
  sectionName: "World news",
  publishedAt: "2026-06-29T10:30:00Z",
  url: "https://www.theguardian.com/world/2026/jun/29/climate-summit-deal",
};

/** Minimal ArticleDTO — headline only, no thumbnail, no trailText */
export const minimalArticleDTO: ArticleDTO = {
  id: "sport/2026/jun/29/match-report",
  title: "Team wins championship",
  trailText: "",
  thumbnail: undefined,
  sectionName: "Sport",
  publishedAt: "2026-06-29T09:00:00Z",
  url: "https://www.theguardian.com/sport/2026/jun/29/match-report",
};

/** Build a list of mock ArticleDTOs for a section */
export function mockArticlesForSection(
  sectionId: string,
  count: number,
): ArticleDTO[] {
  const sectionNames: Record<string, string> = {
    world: "World news",
    technology: "Technology",
    sport: "Sport",
    culture: "Culture",
    business: "Business",
  };

  return Array.from({ length: count }, (_, i) => ({
    id: `${sectionId}/2026/jun/${29 - i}/article-${i + 1}`,
    title: `${sectionNames[sectionId] ?? sectionId} headline ${i + 1}`,
    trailText: `Summary for article ${i + 1} in ${sectionId}`,
    thumbnail:
      i % 2 === 0
        ? `https://media.guardian.co.uk/img/${sectionId}-${i + 1}.jpg`
        : undefined,
    sectionName: sectionNames[sectionId] ?? sectionId,
    publishedAt: `2026-06-${String(29 - i).padStart(2, "0")}T${String(10 - (i % 10)).padStart(2, "0")}:00:00Z`,
    url: `https://www.theguardian.com/${sectionId}/2026/jun/${29 - i}/article-${i + 1}`,
  }));
}

// ─── Port Interfaces (to be implemented by node-developer) ─────────────

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedResult<T> {
  readonly data: T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

/**
 * ArticleRepository port.
 * node-developer implements GuardianApiAdapter to satisfy this.
 */
export interface ArticleRepository {
  findBySection(
    section: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ArticleDTO>>;
  findById(id: string): Promise<ArticleDTO | null>;
  search(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ArticleDTO>>;
}

/**
 * CacheService port.
 * node-developer implements RedisCacheAdapter to satisfy this.
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}
