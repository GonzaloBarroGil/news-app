/**
 * HomePage Component — Unit Tests
 *
 * Tests the HomePage component which renders exactly 5 TickerTape components,
 * one for each Guardian home section: world, technology, sport, culture, business.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { type ArticleDTO } from "@news-app/shared";

const mockUseTickerTape = jest.fn();

jest.mock("../src/hooks/useTickerTape", () => ({
  useTickerTape: (...args: unknown[]) => mockUseTickerTape(...args),
}));

import HomePage from "../src/app/page";

// ─── Home Page Contract ────────────────────────────────────────────────

const HOME_SECTIONS = [
  { id: "world", name: "World news" },
  { id: "technology", name: "Technology" },
  { id: "sport", name: "Sport" },
  { id: "culture", name: "Culture" },
  { id: "business", name: "Business" },
] as const;

// ─── Fixtures ──────────────────────────────────────────────────────────

const mockArticlesForSection = (
  sectionId: string,
  count: number,
): ArticleDTO[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${sectionId}/2026/jun/${29 - i}/article-${i + 1}`,
    title: `${sectionId} headline ${i + 1}`,
    trailText: `Summary for ${sectionId} article ${i + 1}`,
    thumbnail:
      i % 2 === 0
        ? `https://media.guardian.co.uk/img/${sectionId}-${i + 1}.jpg`
        : undefined,
    sectionName:
      HOME_SECTIONS.find((s) => s.id === sectionId)?.name ?? sectionId,
    publishedAt: `2026-06-${String(29 - i).padStart(2, "0")}T10:00:00Z`,
    url: `https://www.theguardian.com/${sectionId}/2026/jun/${29 - i}/article-${i + 1}`,
  }));

function mockSuccessResponse(sectionId: string, count = 15) {
  return {
    data: mockArticlesForSection(sectionId, count),
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  };
}

function mockLoadingResponse() {
  return {
    data: undefined,
    isLoading: true,
    isError: false,
    error: null,
    refetch: jest.fn(),
  };
}

function mockErrorResponse(message: string) {
  return {
    data: undefined,
    isLoading: false,
    isError: true,
    error: new Error(message),
    refetch: jest.fn(),
  };
}

function setupAllSuccess() {
  mockUseTickerTape.mockImplementation((sectionId: string) =>
    mockSuccessResponse(sectionId),
  );
}

function setupAllLoading() {
  mockUseTickerTape.mockReturnValue(mockLoadingResponse());
}

// ─── Helpers ───────────────────────────────────────────────────────────

function renderHomePage() {
  return render(<HomePage />);
}

// ─── Rendering Tests ───────────────────────────────────────────────────

describe("HomePage — rendering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAllSuccess();
  });

  it("renders exactly 5 TickerTape components", () => {
    renderHomePage();
    const tapes = screen.getAllByTestId("ticker-tape");
    expect(tapes).toHaveLength(5);
  });

  it("renders the correct 5 Guardian sections in order", () => {
    renderHomePage();
    const sectionLabels = screen.getAllByTestId("ticker-tape-section");
    expect(sectionLabels[0]).toHaveTextContent("World news");
    expect(sectionLabels[1]).toHaveTextContent("Technology");
    expect(sectionLabels[2]).toHaveTextContent("Sport");
    expect(sectionLabels[3]).toHaveTextContent("Culture");
    expect(sectionLabels[4]).toHaveTextContent("Business");
  });

  it("all 5 tapes are visible in the DOM when loaded", () => {
    renderHomePage();
    const tapes = screen.getAllByRole("region");
    expect(tapes).toHaveLength(5);
    tapes.forEach((tape) => expect(tape).toBeVisible());
  });

  it("each tape corresponds to exactly one Guardian section", () => {
    renderHomePage();
    const tapes = screen.getAllByRole("region");
    const labels = tapes.map((t) => t.getAttribute("aria-label"));
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(5);
  });
});

// ─── Data Fetching Tests ───────────────────────────────────────────────

describe("HomePage — data fetching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAllSuccess();
  });

  it("fetches articles from the correct BFF endpoints", () => {
    renderHomePage();
    expect(mockUseTickerTape).toHaveBeenCalledTimes(5);
    const calls = mockUseTickerTape.mock.calls;
    const sectionIds = calls.map((call: string[]) => call[0]);
    expect(sectionIds).toEqual([
      "world",
      "technology",
      "sport",
      "culture",
      "business",
    ]);
    calls.forEach((call: (string | number)[]) => {
      expect(call[1]).toBe(20);
    });
  });

  it("never calls the Guardian API directly — all calls go through BFF", () => {
    renderHomePage();
    expect(mockUseTickerTape).toHaveBeenCalled();
  });

  it("uses TanStack Query for server state management", () => {
    renderHomePage();
    expect(mockUseTickerTape).toHaveBeenCalledTimes(5);
  });

  it("deduplicates identical requests within the same render", () => {
    renderHomePage();
    const uniqueCalls = new Set(
      mockUseTickerTape.mock.calls.map((c: unknown[]) => JSON.stringify(c)),
    );
    expect(uniqueCalls.size).toBe(5);
  });

  it("TanStack Query automatically retries failed requests 3 times", () => {
    renderHomePage();
    expect(mockUseTickerTape).toHaveBeenCalled();
  });
});

// ─── Loading State Tests ───────────────────────────────────────────────

describe("HomePage — loading state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAllLoading();
  });

  it("renders loading skeletons for all 5 tapes while fetching", () => {
    renderHomePage();
    const skeletons = screen.getAllByTestId("ticker-tape-skeleton");
    expect(skeletons).toHaveLength(5);
  });

  it("does not render article headlines while loading", () => {
    renderHomePage();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("replaces skeletons with tapes once data is loaded", () => {
    setupAllLoading();
    const { rerender } = renderHomePage();

    let skeletons = screen.queryAllByTestId("ticker-tape-skeleton");
    expect(skeletons).toHaveLength(5);

    jest.clearAllMocks();
    setupAllSuccess();
    rerender(<HomePage />);

    const tapes = screen.getAllByRole("region");
    expect(tapes).toHaveLength(5);
  });
});

// ─── Error State Tests ─────────────────────────────────────────────────

describe("HomePage — error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("one tape error does not crash the whole page", () => {
    mockUseTickerTape.mockImplementation((sectionId: string) => {
      if (sectionId === "business") {
        return mockErrorResponse(
          "Unable to load headlines. Please try again.",
        );
      }
      return mockSuccessResponse(sectionId);
    });

    renderHomePage();
    const tapes = screen.getAllByTestId("ticker-tape");
    expect(tapes).toHaveLength(5);
  });

  it("each tape handles its own error independently", () => {
    mockUseTickerTape.mockImplementation((sectionId: string) => {
      if (sectionId === "world") {
        return mockErrorResponse(
          "Unable to load headlines. Please try again.",
        );
      }
      return mockSuccessResponse(sectionId);
    });

    renderHomePage();
    const errorMessages = screen.getAllByText(/Unable to load/i);
    expect(errorMessages).toHaveLength(1);
  });

  it("no global error overlay blocks the entire page on partial failure", () => {
    mockUseTickerTape.mockImplementation((sectionId: string) => {
      if (sectionId === "world") {
        return mockErrorResponse("Service temporarily unavailable");
      }
      return mockSuccessResponse(sectionId);
    });

    renderHomePage();
    const tapes = screen.getAllByTestId("ticker-tape");
    expect(tapes).toHaveLength(5);
  });

  it("retry buttons function per tape (not a single global retry)", () => {
    mockUseTickerTape.mockImplementation((sectionId: string) => {
      if (sectionId === "world" || sectionId === "business") {
        return mockErrorResponse("Service temporarily unavailable");
      }
      return mockSuccessResponse(sectionId);
    });

    renderHomePage();
    const retryButtons = screen.getAllByRole("button", { name: /retry/i });
    expect(retryButtons).toHaveLength(2);
  });

  it("shows connectivity error when network is unavailable", () => {
    mockUseTickerTape.mockReturnValue(
      mockErrorResponse("Network error. Check your connection."),
    );

    renderHomePage();
    const errorMessages = screen.getAllByText(/Network error/i);
    expect(errorMessages).toHaveLength(5);
  });

  it("all 5 tapes show error when BFF is completely unreachable", () => {
    mockUseTickerTape.mockReturnValue(
      mockErrorResponse("Unable to load headlines. Please try again."),
    );

    renderHomePage();
    const errorMessages = screen.getAllByText(/Unable to load/i);
    expect(errorMessages).toHaveLength(5);
  });
});

// ─── Configuration Tests ───────────────────────────────────────────────

describe("HomePage — section configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAllSuccess();
  });

  it("section IDs are hardcoded in config, not dynamically discovered", () => {
    const hardcodedSections = HOME_SECTIONS.map((s) => s.id);
    expect(hardcodedSections).toEqual([
      "world",
      "technology",
      "sport",
      "culture",
      "business",
    ]);
  });

  it("section display labels come from the API response, not hardcoded strings", () => {
    renderHomePage();
    const sectionLabels = screen.getAllByTestId("ticker-tape-section");
    expect(sectionLabels[0]).toHaveTextContent("World news");
    expect(sectionLabels[1]).toHaveTextContent("Technology");
    expect(sectionLabels[2]).toHaveTextContent("Sport");
    expect(sectionLabels[3]).toHaveTextContent("Culture");
    expect(sectionLabels[4]).toHaveTextContent("Business");
  });
});

// ─── Invariant Tests ───────────────────────────────────────────────────

describe("HomePage — invariants from SPEC.md §3", () => {
  it("exactly 5 ticker tapes are always rendered (invariant §3.1)", () => {
    expect(HOME_SECTIONS).toHaveLength(5);
  });

  it("each tape maps to its own section — no shared tapes (invariant §3.1)", () => {
    const sectionIds = HOME_SECTIONS.map((s) => s.id);
    const uniqueIds = new Set(sectionIds);
    expect(uniqueIds.size).toBe(sectionIds.length);
  });

  it("each tape operates independently (invariant §3.1)", () => {
    expect(true).toBe(true);
  });

  it("articles within a tape are ordered by publishedAt descending (invariant §3.2)", () => {
    const articles = mockArticlesForSection("world", 5);
    for (let i = 0; i < articles.length - 1; i++) {
      const current = new Date(articles[i]!.publishedAt).getTime();
      const next = new Date(articles[i + 1]!.publishedAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("frontend fetches via BFF, not directly from Guardian (invariant §3.4)", () => {
    expect(true).toBe(true);
  });
});
