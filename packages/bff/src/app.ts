import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { ArticleDTO } from "@news-app/shared";
import type { ArticleRepository, PaginatedResult } from "./ports/ArticleRepository";
import type { CacheService } from "./ports/CacheService";
import { GetArticlesBySection } from "./domain/GetArticlesBySection";
import { loadEnv } from "./config/env";

function errorCodeFromMessage(message: string): string {
  const map: Record<string, string> = {
    RATE_LIMITED: "RATE_LIMITED",
    GUARDIAN_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    TIMEOUT: "GATEWAY_TIMEOUT",
    INVALID_SECTION: "BAD_REQUEST",
  };
  return map[message] ?? "INTERNAL_ERROR";
}

function statusFromCode(code: string): number {
  const map: Record<string, number> = {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    RATE_LIMITED: 503,
    SERVICE_UNAVAILABLE: 502,
    GATEWAY_TIMEOUT: 504,
    INTERNAL_ERROR: 500,
  };
  return map[code] ?? 500;
}

function validateSectionParam(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("INVALID_SECTION");
  }
  const section = value.trim();
  if (!/^[a-z]+(-[a-z]+)*$/.test(section)) {
    throw new Error("INVALID_SECTION");
  }
  return section;
}

function parsePagination(query: Request["query"]): { page: number; limit: number } {
  const rawPage = query.page;
  const rawLimit = query.limit;

  const page = rawPage !== undefined ? Number(rawPage) : 1;
  const limit = rawLimit !== undefined ? Number(rawLimit) : 20;

  if (!Number.isFinite(page) || page < 1) {
    throw new Error("INVALID_PAGINATION: page must be >= 1");
  }
  if (!Number.isFinite(limit) || limit < 1 || limit > 50) {
    throw new Error("INVALID_PAGINATION: limit must be between 1 and 50");
  }

  return { page, limit };
}

export function createApp(
  articleRepo?: ArticleRepository,
  cacheService?: CacheService,
): Express {
  const app = express();
  const env = loadEnv();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 429, message: "Too many requests", code: "RATE_LIMITED" },
    }),
  );

  app.get("/api/v1/articles", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = validateSectionParam(req.query.section);
      const { page, limit } = parsePagination(req.query);

      const getArticles = new GetArticlesBySection(
        articleRepo ?? ({} as ArticleRepository),
        cacheService ?? ({} as CacheService),
      );

      const result = await getArticles.execute(section, { page, limit });

      res.set("Cache-Control", "public, max-age=300");
      res.set("X-RateLimit-Remaining", "unknown");
      res.status(200).json(result satisfies PaginatedResult<ArticleDTO>);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/v1/articles/:id", (_req: Request, res: Response) => {
    res.status(501).json({
      status: 501,
      message: "Not Implemented",
      code: "NOT_IMPLEMENTED",
    });
  });

  app.get("/api/v1/sections", (_req: Request, res: Response) => {
    res.status(501).json({
      status: 501,
      message: "Not Implemented",
      code: "NOT_IMPLEMENTED",
    });
  });

  app.get("/api/v1/tags", (_req: Request, res: Response) => {
    res.status(501).json({
      status: 501,
      message: "Not Implemented",
      code: "NOT_IMPLEMENTED",
    });
  });

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    const message = error.message.split(":")[0].trim();
    const code = errorCodeFromMessage(message);
    const status = statusFromCode(code);

    const responseMessage = code === "INTERNAL_ERROR"
      ? "Internal server error"
      : message.replace(/_/g, " ").toLowerCase();

    res.status(status).json({
      status,
      message: responseMessage,
      code,
    });
  });

  return app;
}
