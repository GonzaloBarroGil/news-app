import { useQuery } from "@tanstack/react-query";
import { type ArticleDTO } from "@news-app/shared";
import { fetchBff } from "../lib/api";

export function useTickerTape(sectionId: string, limit: number) {
  return useQuery({
    queryKey: ["articles", sectionId, limit] as const,
    queryFn: () =>
      fetchBff<ArticleDTO[]>("/articles", {
        section: sectionId,
        limit: String(limit),
      }),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}
