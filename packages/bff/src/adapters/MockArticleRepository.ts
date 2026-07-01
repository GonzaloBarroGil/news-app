import type { ArticleDTO } from "@news-app/shared";
import type { ArticleRepository, PaginationParams, PaginatedResult } from "../ports/ArticleRepository";

const SECTION_NAMES: Record<string, string> = {
  world: "World news",
  technology: "Technology",
  sport: "Sport",
  culture: "Culture",
  business: "Business",
};

function generateArticle(section: string, index: number): ArticleDTO {
  const name = SECTION_NAMES[section] ?? section;
  return {
    id: `${section}/2026/jul/${String(index + 1).padStart(2, "0")}/mock-article-${index + 1}`,
    title: `${name} headline ${index + 1}: Lorem ipsum dolor sit amet consectetur`,
    trailText: `Mock summary for article ${index + 1} in the ${name} section.`,
    thumbnail: index % 3 !== 0 ? `https://picsum.photos/seed/${section}${index}/200/150` : undefined,
    sectionName: name,
    publishedAt: `2026-07-01T${String(10 - (index % 10)).padStart(2, "0")}:00:00Z`,
    url: `https://www.theguardian.com/${section}/2026/jul/${String(index + 1).padStart(2, "0")}/mock-article-${index + 1}`,
  };
}

export class MockArticleRepository implements ArticleRepository {
  async findBySection(section: string, pagination: PaginationParams): Promise<PaginatedResult<ArticleDTO>> {
    const total = 20;
    const start = (pagination.page - 1) * pagination.limit;
    const data = Array.from({ length: Math.min(pagination.limit, total - start) }, (_, i) =>
      generateArticle(section, start + i),
    );

    return { data, page: pagination.page, pageSize: data.length, total };
  }

  async findById(id: string): Promise<ArticleDTO | null> {
    const section = id.split("/")[0] ?? "world";
    return generateArticle(section, 0);
  }

  async search(query: string, pagination: PaginationParams): Promise<PaginatedResult<ArticleDTO>> {
    const data = Array.from({ length: Math.min(pagination.limit, 10) }, (_, i) =>
      generateArticle("world", i),
    );

    return { data, page: pagination.page, pageSize: data.length, total: data.length };
  }
}
