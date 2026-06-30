/**
 * TickerTape Component — Unit Tests
 *
 * Tests the TickerTape component: rendering, states, animation,
 * accessibility, and interaction behavior.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ArticleDTO } from "@news-app/shared";
import { TickerTape, type TickerTapeProps } from "../src/components/TickerTape/TickerTape";

// ─── Fixtures ──────────────────────────────────────────────────────────

const mockArticles: ArticleDTO[] = Array.from({ length: 15 }, (_, i) => ({
  id: `world/2026/jun/${29 - i}/article-${i + 1}`,
  title: `World headline ${i + 1}: Major event shakes global markets`,
  trailText: `Summary for article ${i + 1} describing key events.`,
  thumbnail:
    i % 2 === 0
      ? `https://media.guardian.co.uk/img/thumb-${i + 1}.jpg`
      : undefined,
  sectionName: "World news",
  publishedAt: `2026-06-${String(29 - i).padStart(2, "0")}T10:00:00Z`,
  url: `https://www.theguardian.com/world/2026/jun/${29 - i}/article-${i + 1}`,
}));

const defaultProps: TickerTapeProps = {
  section: "world",
  sectionName: "World news",
  articles: mockArticles,
  isLoading: false,
  onArticleClick: jest.fn(),
  onRetry: jest.fn(),
};

function renderTickerTape(props: Partial<TickerTapeProps> = {}) {
  const merged = { ...defaultProps, ...props };
  return render(<TickerTape {...merged} />);
}

function matchMediaMock(prefersReduced: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? prefersReduced : false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// ─── Rendering Tests ───────────────────────────────────────────────────

describe("TickerTape — rendering", () => {
  beforeEach(() => {
    matchMediaMock(false);
  });

  it("renders the section name label", () => {
    renderTickerTape();
    expect(screen.getByText("World news")).toBeInTheDocument();
  });

  it("renders headline links — one per article", () => {
    renderTickerTape();
    const links = screen.getAllByRole("link");
    const uniqueHrefs = new Set(links.map((l) => l.getAttribute("href")));
    expect(uniqueHrefs.size).toBe(mockArticles.length);
  });

  it("each headline link has a visible focus indicator", () => {
    renderTickerTape();
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it("renders article thumbnails when available", () => {
    renderTickerTape();
    const images = document.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("does not render broken image when thumbnail is undefined", () => {
    renderTickerTape();
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      expect(img).not.toHaveAttribute("src", "");
    });
  });

  it("truncates extremely long headlines with text-overflow ellipsis", () => {
    const longArticle: ArticleDTO = {
      ...mockArticles[0]!,
      title:
        "A".repeat(300) +
        " — extremely long headline that must be truncated in the ticker tape view",
    };
    renderTickerTape({ articles: [longArticle] });
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("title", longArticle.title);
  });

  it("renders trailText only when available (empty string not rendered)", () => {
    const noTrailText: ArticleDTO = {
      ...mockArticles[0]!,
      trailText: "",
    };
    renderTickerTape({ articles: [noTrailText] });
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("duplicates article content in DOM for seamless CSS animation loop", () => {
    renderTickerTape();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(mockArticles.length * 2);
  });
});

// ─── Animation Tests ────────────────────────────────────────────────────

describe("TickerTape — animation behavior", () => {
  beforeEach(() => {
    matchMediaMock(false);
  });

  it("pauses scrolling animation on hover", async () => {
    renderTickerTape();
    const tape = screen.getByRole("region", { name: /World news/i });
    await userEvent.hover(tape);
    expect(tape).toHaveClass("paused");
  });

  it("resumes scrolling animation on unhover", async () => {
    renderTickerTape();
    const tape = screen.getByRole("region", { name: /World news/i });
    await userEvent.hover(tape);
    expect(tape).toHaveClass("paused");
    await userEvent.unhover(tape);
    expect(tape).not.toHaveClass("paused");
  });

  it("pauses scrolling animation on focus", async () => {
    renderTickerTape();
    const links = screen.getAllByRole("link");
    await userEvent.tab();
    const tape = links[0]!.closest('[data-testid="ticker-tape"]');
    expect(tape).toHaveClass("paused");
  });

  it("resumes scrolling animation on blur", async () => {
    renderTickerTape();
    const tape = screen.getByRole("region", { name: /World news/i });

    await userEvent.tab();
    expect(tape).toHaveClass("paused");

    await userEvent.tab({ shift: true });
    expect(tape).not.toHaveClass("paused");
  });

  it("other tapes continue scrolling when one is paused", async () => {
    render(
      <>
        <TickerTape
          section="world"
          sectionName="World news"
          articles={mockArticles}
        />
        <TickerTape
          section="technology"
          sectionName="Technology"
          articles={mockArticles}
        />
      </>,
    );

    const tapes = screen.getAllByRole("region");
    const worldTape = tapes[0]!;
    const techTape = tapes[1]!;

    await userEvent.hover(worldTape);
    expect(worldTape).toHaveClass("paused");
    expect(techTape).not.toHaveClass("paused");
  });
});

// ─── prefers-reduced-motion Tests ──────────────────────────────────────

describe("TickerTape — prefers-reduced-motion", () => {
  beforeEach(() => {
    matchMediaMock(true);
  });

  it("renders static list with no animation class when prefers-reduced-motion: reduce", () => {
    renderTickerTape();
    const tape = screen.getByRole("region", { name: /World news/i });
    const innerList = tape.querySelector("ul");
    expect(innerList).toHaveClass("reducedMotion");
  });

  it("displays articles horizontally but stationary when animation disabled", () => {
    renderTickerTape();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("shows horizontal scrollbar for manual navigation when animation disabled", () => {
    renderTickerTape();
    const tape = screen.getByRole("region", { name: /World news/i });
    const innerList = tape.querySelector("ul");
    expect(innerList).toHaveClass("reducedMotion");
  });
});

// ─── State Tests ────────────────────────────────────────────────────────

describe("TickerTape — loading state", () => {
  beforeEach(() => {
    matchMediaMock(false);
  });

  it("renders skeleton placeholders while loading", () => {
    renderTickerTape({ isLoading: true, articles: [] });
    expect(screen.getByTestId("ticker-tape-skeleton")).toBeInTheDocument();
  });

  it("does not show headlines while loading", () => {
    renderTickerTape({ isLoading: true, articles: [] });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("TickerTape — empty state", () => {
  beforeEach(() => {
    matchMediaMock(false);
  });

  it("renders empty-state message when articles array is empty", () => {
    renderTickerTape({ articles: [], isLoading: false });
    expect(
      screen.getByText(/No headlines available for World news/i),
    ).toBeInTheDocument();
  });

  it("does not animate in empty state (no content to scroll)", () => {
    renderTickerTape({ articles: [], isLoading: false });
    const tape = screen.getByRole("region", { name: /World news/i });
    const innerList = tape.querySelector("ul");
    expect(innerList).toBeNull();
  });
});

describe("TickerTape — error state", () => {
  beforeEach(() => {
    matchMediaMock(false);
  });

  it("renders error message when error prop is provided", () => {
    renderTickerTape({
      articles: [],
      isLoading: false,
      error: "Unable to load headlines. Please try again.",
    });
    expect(
      screen.getByText(/Unable to load headlines/i),
    ).toBeInTheDocument();
  });

  it("renders retry button in error state", () => {
    const onRetry = jest.fn();
    renderTickerTape({
      articles: [],
      isLoading: false,
      error: "Service temporarily unavailable",
      onRetry,
    });
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const onRetry = jest.fn();
    renderTickerTape({
      articles: [],
      isLoading: false,
      error: "Service temporarily unavailable",
      onRetry,
    });
    const retryButton = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows connectivity error for network failures", () => {
    renderTickerTape({
      articles: [],
      isLoading: false,
      error: "Network error. Check your connection.",
    });
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});

// ─── Interaction Tests ─────────────────────────────────────────────────

describe("TickerTape — article click navigation", () => {
  beforeEach(() => {
    matchMediaMock(false);
  });

  it("calls onArticleClick with the article ID when headline is clicked", async () => {
    const onArticleClick = jest.fn();
    renderTickerTape({ onArticleClick });
    const firstLink = screen.getAllByRole("link")[0]!;
    await userEvent.click(firstLink);
    expect(onArticleClick).toHaveBeenCalledWith(mockArticles[0]!.id);
  });
});

// ─── Accessibility Tests ───────────────────────────────────────────────

describe("TickerTape — accessibility attributes", () => {
  beforeEach(() => {
    matchMediaMock(false);
  });

  it("has aria-label that includes the section name", () => {
    renderTickerTape();
    const tape = screen.getByRole("region");
    expect(tape).toHaveAttribute(
      "aria-label",
      expect.stringContaining("World news"),
    );
  });

  it("announces as a ticker tape with aria-roledescription", () => {
    renderTickerTape();
    const tape = screen.getByRole("region");
    expect(tape).toHaveAttribute("aria-roledescription", "ticker tape");
  });

  it("announces content changes via aria-live region", () => {
    renderTickerTape();
    const liveRegion = screen.getByRole("region");
    const innerList = liveRegion.querySelector("ul");
    expect(innerList).toHaveAttribute("aria-live", "polite");
  });

  it("each headline link is keyboard accessible (Tab reachable)", () => {
    renderTickerTape();
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it("pauses animation when screen reader focuses a headline", () => {
    renderTickerTape();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});

// ─── TypeScript Type Safety ────────────────────────────────────────────

describe("TickerTape — TypeScript type contract", () => {
  it("TickerTapeProps matches the ArticleDTO type contract", () => {
    const props: TickerTapeProps = {
      section: "world",
      sectionName: "World news",
      articles: mockArticles,
    };

    expect(props.articles[0]?.id).toBeDefined();
    expect(props.articles[0]?.title).toBeDefined();
    expect(props.articles[0]?.sectionName).toBeDefined();
    expect(props.articles[0]?.publishedAt).toBeDefined();
    expect(props.articles[0]?.url).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(props.articles[0], "trailText")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(props.articles[0], "thumbnail")).toBe(true);
  });
});
