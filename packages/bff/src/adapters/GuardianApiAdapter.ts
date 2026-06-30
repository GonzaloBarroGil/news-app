import type { ArticleDTO } from "@news-app/shared";
import type { ArticleRepository, PaginationParams, PaginatedResult } from "../ports/ArticleRepository";
import { loadEnv } from "../config/env";

interface GuardianSearchResponse {
  response: {
    status: string;
    total: number;
    pageSize: number;
    currentPage: number;
    pages: number;
    results: Array<{
      id: string;
      webTitle: string;
      sectionName: string;
      webPublicationDate: string;
      webUrl: string;
      fields?: {
        trailText?: string;
        thumbnail?: string;
      };
    }>;
  };
}

function mapToArticleDTO(item: GuardianSearchResponse["response"]["results"][number]): ArticleDTO {
  return {
    id: item.id,
    title: item.webTitle,
    trailText: item.fields?.trailText ?? "",
    thumbnail: item.fields?.thumbnail,
    sectionName: item.sectionName,
    publishedAt: item.webPublicationDate,
    url: item.webUrl,
  };
}

export class GuardianApiAdapter implements ArticleRepository {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor() {
    const env = loadEnv();
    this.baseUrl = env.GUARDIAN_BASE_URL;
    this.apiKey = env.GUARDIAN_API_KEY;
    this.timeout = env.GUARDIAN_TIMEOUT_MS;
  }

  async findBySection(section: string, pagination: PaginationParams): Promise<PaginatedResult<ArticleDTO>> {
    const url = this.buildUrl(`/search?section=${section}&show-fields=thumbnail,trailText&page-size=${pagination.limit}&page=${pagination.page}`);

    const data = await this.fetchJson<GuardianSearchResponse>(url);
    const articles = data.response.results.map(mapToArticleDTO);

    return {
      data: articles,
      page: data.response.currentPage,
      pageSize: data.response.pageSize,
      total: data.response.total,
    };
  }

  async findById(id: string): Promise<ArticleDTO | null> {
    const url = this.buildUrl(`/${encodeURIComponent(id)}?show-fields=all`);
    const data = await this.fetchJson<{ response: { content: GuardianSearchResponse["response"]["results"][number] } }>(url);

    if (!data.response.content) return null;
    return mapToArticleDTO(data.response.content);
  }

  async search(query: string, pagination: PaginationParams): Promise<PaginatedResult<ArticleDTO>> {
    const url = this.buildUrl(`/search?q=${encodeURIComponent(query)}&show-fields=thumbnail,trailText&page-size=${pagination.limit}&page=${pagination.page}`);
    const data = await this.fetchJson<GuardianSearchResponse>(url);

    return {
      data: data.response.results.map(mapToArticleDTO),
      page: data.response.currentPage,
      pageSize: data.response.pageSize,
      total: data.response.total,
    };
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}&api-key=${this.apiKey}`;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (response.status === 429) {
        throw new Error("RATE_LIMITED");
      }

      if (!response.ok) {
        throw new Error("GUARDIAN_UNAVAILABLE");
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("TIMEOUT");
        }
        if (error.message === "RATE_LIMITED" || error.message === "GUARDIAN_UNAVAILABLE" || error.message === "TIMEOUT") {
          throw error;
        }
      }
      throw new Error("GUARDIAN_UNAVAILABLE");
    } finally {
      clearTimeout(timer);
    }
  }
}
