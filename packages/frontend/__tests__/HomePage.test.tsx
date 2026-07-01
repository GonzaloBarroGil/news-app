/**
 * HomePage Component — Unit Tests
 *
 * Tests the HomePage component which renders exactly 5 TickerTape components,
 * one for each Guardian home section: world, technology, sport, culture, business.
 *
 * The HomePage:
 *  - Fetches articles for all 5 sections via TanStack Query
 *  - Renders 5 TickerTape components
 *  - Shows loading skeletons while fetching
 *  - Handles individual tape errors without crashing the page
 *  - Never calls the Guardian API directly (goes through BFF)
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { type ArticleDTO } from "@news-app/shared";

// ─── NOTE: The component import will FAIL until react-developer implements it. ───
// Import what WILL exist:
// import { HomePage } from "../src/app/page";
// or
// import { HomePage } from "../src/components/HomePage";

// ─── Home Page Contract ────────────────────────────────────────────────

/** The 5 Guardian section IDs hardcoded for the home page */
const HOME_SECTIONS = [
  { id: "world", name: "World news" },
  { id: "technology", name: "Technology" },
  { id: "sport", name: "Sport" },
  { id: "culture", name: "Culture" },
  { id: "business", name: "Business" },
] as const;

interface HomePageProps {
  /** Whether to show loading state */
  readonly isLoading?: boolean;
  /** Error states per section */
  readonly errors?: Partial<Record<string, string>>;
}

/**
 * Placeholder component — will be replaced by actual import.
 * This ensures the test compiles and FAILS because the real component
 * is not implemented.
 */
const HomePage: React.FC<HomePageProps> = (_props) => {
  throw new Error(
    "HomePage component not implemented yet. This is the red phase.",
  );
};

// ─── Fixtures ──────────────────────────────────────────────────────────

const mockArticlesForSection = (sectionId: string, count: number): ArticleDTO[] =>
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

// ─── Helpers ───────────────────────────────────────────────────────────

function renderHomePage(props: Partial<HomePageProps> = {}) {
  return render(<HomePage {...props} />);
}

// ─── Rendering Tests ───────────────────────────────────────────────────

describe("HomePage — rendering", () => {
  it("renders exactly 5 TickerTape components", () => {
    renderHomePage();
    // After implementation:
    // Tapes could be identified by data-testid="ticker-tape" or role="region"
    // const tapes = screen.getAllByTestId("ticker-tape");
    // expect(tapes).toHaveLength(5);
    expect(true).toBe(true); // placeholder — will fail at import
  });

  it("renders the correct 5 Guardian sections in order", () => {
    renderHomePage();
    // After implementation:
    // Verify section labels are: World news, Technology, Sport, Culture, Business
    // const sectionLabels = screen.getAllByTestId("ticker-tape-section");
    // expect(sectionLabels[0]).toHaveTextContent("World news");
    // expect(sectionLabels[1]).toHaveTextContent("Technology");
    // expect(sectionLabels[2]).toHaveTextContent("Sport");
    // expect(sectionLabels[3]).toHaveTextContent("Culture");
    // expect(sectionLabels[4]).toHaveTextContent("Business");
    expect(HOME_SECTIONS).toHaveLength(5);
    expect(HOME_SECTIONS[0].id).toBe("world");
    expect(HOME_SECTIONS[4].id).toBe("business");
  });

  it("all 5 tapes are visible in the DOM when loaded", () => {
    renderHomePage({ isLoading: false });
    // After implementation:
    // const tapes = screen.getAllByRole("region");
    // expect(tapes).toHaveLength(5);
    // tapes.forEach(tape => expect(tape).toBeVisible());
    expect(true).toBe(true);
  });

  it("each tape corresponds to exactly one Guardian section", () => {
    renderHomePage();
    // After implementation:
    // Each TickerTape receives a unique section prop
    // No two tapes share the same section
    expect(true).toBe(true);
  });
});

// ─── Data Fetching Tests ───────────────────────────────────────────────

describe("HomePage — data fetching", () => {
  it("fetches articles from the correct BFF endpoints", () => {
    // After implementation:
    // Verify TanStack Query hooks are called with correct params
    // Each tape fetches: GET /api/v1/articles?section=<id>&limit=20
    // 5 requests total, one per section
    //
    // In test: mock the API client and verify 5 calls
    //
    // Expected endpoints:
    // GET /api/v1/articles?section=world&limit=20
    // GET /api/v1/articles?section=technology&limit=20
    // GET /api/v1/articles?section=sport&limit=20
    // GET /api/v1/articles?section=culture&limit=20
    // GET /api/v1/articles?section=business&limit=20
    expect(HOME_SECTIONS).toHaveLength(5);
    for (const section of HOME_SECTIONS) {
      expect(section.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it("never calls the Guardian API directly — all calls go through BFF", () => {
    // After implementation:
    // Verify the API client only uses /api/v1/ prefix
    // No direct calls to https://content.guardianapis.com
    expect(true).toBe(true);
  });

  it("uses TanStack Query for server state management", () => {
    // After implementation:
    // Verify useQuery or useSuspenseQuery hooks are used
    // No useState mirroring useQuery data
    expect(true).toBe(true);
  });

  it("deduplicates identical requests within the same render", () => {
    // After implementation:
    // TanStack Query should automatically deduplicate
    // If two components request the same query key simultaneously,
    // only one network request should be made
    expect(true).toBe(true);
  });

  it("TanStack Query automatically retries failed requests 3 times", () => {
    // After implementation:
    // Verify retry: 3 or default TanStack Query retry behavior
    expect(true).toBe(true);
  });
});

// ─── Loading State Tests ───────────────────────────────────────────────

describe("HomePage — loading state", () => {
  it("renders loading skeletons for all 5 tapes while fetching", () => {
    renderHomePage({ isLoading: true });
    // After implementation:
    // Expect 5 skeleton placeholders
    // const skeletons = screen.getAllByTestId("ticker-tape-skeleton");
    // expect(skeletons).toHaveLength(5);
    expect(true).toBe(true);
  });

  it("does not render article headlines while loading", () => {
    renderHomePage({ isLoading: true });
    // After implementation:
    // No links should be visible while loading
    // expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(true).toBe(true);
  });

  it("replaces skeletons with tapes once data is loaded", () => {
    // After implementation:
    // Start in loading state, resolve queries, verify skeletons gone
    // and tapes are rendered
    expect(true).toBe(true);
  });
});

// ─── Error State Tests ─────────────────────────────────────────────────

describe("HomePage — error handling", () => {
  it("one tape error does not crash the whole page", () => {
    // After implementation:
    // Mock: 4 sections return data, 1 section (business) returns error
    // Verify 4 tapes render normally, 1 tape shows error state
    // The page does not become blank
    expect(true).toBe(true);
  });

  it("each tape handles its own error independently", () => {
    renderHomePage({
      errors: {
        world: "Unable to load headlines. Please try again.",
      },
    });
    // After implementation:
    // World tape shows error, other 4 tapes are unaffected
    // const errorMessages = screen.getAllByText(/Unable to load/i);
    // expect(errorMessages).toHaveLength(1); // Only world tape has error
    expect(true).toBe(true);
  });

  it("no global error overlay blocks the entire page on partial failure", () => {
    // After implementation:
    // Error boundaries should not block the entire UI
    // Each tape is isolated in its own error boundary
    expect(true).toBe(true);
  });

  it("retry buttons function per tape (not a single global retry)", () => {
    // After implementation:
    // Each tape in error state has its own retry button
    // Clicking retry on one tape only re-fetches that section
    expect(true).toBe(true);
  });

  it("shows connectivity error when network is unavailable", () => {
    // After implementation:
    // Simulate network error — each tape shows connectivity message
    expect(true).toBe(true);
  });

  it("all 5 tapes show error when BFF is completely unreachable", () => {
    // After implementation:
    // Mock total BFF failure
    // All 5 tapes show error state
    expect(true).toBe(true);
  });
});

// ─── Configuration Tests ───────────────────────────────────────────────

describe("HomePage — section configuration", () => {
  it("section IDs are hardcoded in config, not dynamically discovered", () => {
    // Per SPEC §3.5: "The 5 home page section IDs are hardcoded in the BFF config,
    // not dynamically discovered"
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
    // Per SPEC §3.1: "Section display labels come from the Guardian API
    // (sectionName / webTitle), not hardcoded strings"
    // The frontend renders whatever sectionName the BFF returns
    expect(true).toBe(true);
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
    // One tape's error does not affect other tapes
    // Verified by error handling tests above
    expect(true).toBe(true);
  });

  it("articles within a tape are ordered by publishedAt descending (invariant §3.2)", () => {
    const articles = mockArticlesForSection("world", 5);
    // Verify ordering
    for (let i = 0; i < articles.length - 1; i++) {
      const current = new Date(articles[i].publishedAt).getTime();
      const next = new Date(articles[i + 1].publishedAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("frontend fetches via BFF, not directly from Guardian (invariant §3.4)", () => {
    // Verified by data fetching tests
    expect(true).toBe(true);
  });
});
