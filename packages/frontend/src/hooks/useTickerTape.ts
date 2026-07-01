import { useQuery } from "@tanstack/react-query";
import { type ArticleDTO } from "@news-app/shared";
import { fetchBff } from "../lib/api";

interface ArticleListResponse {
  readonly data: ArticleDTO[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

export function useTickerTape(sectionId: string, limit: number) {
  return useQuery({
    queryKey: ["articles", sectionId, limit] as const,
    queryFn: async () => {
      const response = await fetchBff<ArticleListResponse>("/articles", {
        section: sectionId,
        limit: String(limit),
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}
