import type { ArticleDTO } from "@news-app/shared";

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
