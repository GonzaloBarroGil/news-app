import type { ArticleDTO } from "@news-app/shared";
import type { ArticleRepository, PaginationParams, PaginatedResult } from "../ports/ArticleRepository";
import type { CacheService } from "../ports/CacheService";

const VALID_SECTION_RE = /^[a-z]+(-[a-z]+)*$/;

function validateSection(section: string): void {
  const trimmed = section.trim();
  if (trimmed.length === 0) {
    throw new Error("INVALID_SECTION");
  }
  if (!VALID_SECTION_RE.test(trimmed)) {
    throw new Error("INVALID_SECTION");
  }
}

function buildCacheKey(section: string, pagination: PaginationParams): string {
  return `articles:section:${section}:page:${pagination.page}:limit:${pagination.limit}`;
}

export class GetArticlesBySection {
  constructor(
    private readonly articleRepo: ArticleRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(section: string, pagination: PaginationParams): Promise<PaginatedResult<ArticleDTO>> {
    validateSection(section);

    const cacheKey = buildCacheKey(section, pagination);

    try {
      const cached = await this.cacheService.get<PaginatedResult<ArticleDTO>>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    } catch {
      // Swallow cache read errors
    }

    try {
      const result = await this.articleRepo.findBySection(section, pagination);

      try {
        await this.cacheService.set(cacheKey, result, 300);
      } catch {
        // Swallow cache write errors
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        const message = error.message.toUpperCase();
        if (message === "RATE_LIMITED" || message === "GUARDIAN_UNAVAILABLE" || message === "TIMEOUT") {
          throw error;
        }
      }
      throw new Error("GUARDIAN_UNAVAILABLE");
    }
  }
}
