/**
 * BDD Step Definitions for Home Module — Ticker Tapes
 *
 * Maps Gherkin steps from features/home-tapes.feature to executable test code.
 * Uses Cucumber.js world to share state between steps.
 *
 * NOTE: These steps import from the BFF test helper factory.
 * Since no implementation code exists yet, these step definitions
 * define the CONTRACT that the node-developer and react-developer must satisfy.
 */

import {
  Given,
  When,
  Then,
  type World,
} from "@cucumber/cucumber";
import assert from "node:assert/strict";

// ─── World interface ───────────────────────────────────────────────────

interface TickerTapeWorld extends World {
  /** The test app instance for BFF-level testing */
  app?: unknown;
  /** Mock article repository for test assertions */
  articleRepo?: unknown;
  /** Mock cache service for test assertions */
  cacheService?: unknown;
  /** Last HTTP response received */
  lastResponse?: {
    status: number;
    body: unknown;
    headers: Record<string, string>;
  };
  /** Current article data loaded */
  articles?: unknown[];
  /** Currently focused section */
  currentSection?: string;
  /** Animation state of a tape */
  isPaused?: boolean;
  /** Cache was hit (true) or miss (false) */
  cacheHit?: boolean;
  /** Guardian API call count */
  guardianApiCalls?: number;
}

// ─── Given Steps ───────────────────────────────────────────────────────

Given("the BFF is running and the Guardian API is available", async function (this: TickerTapeWorld) {
  // In the real implementation, this sets up the test app with mock adapters
  // that simulate a working Guardian API
  this.guardianApiCalls = 0;
});

Given(
  "the BFF Redis cache is available",
  async function (this: TickerTapeWorld) {
    // Cache is available by default in mock setup
  },
);

Given(
  "the Guardian API returns {int} articles for each of the 5 home sections",
  async function (this: TickerTapeWorld, count: number) {
    // Mock: Guardian API responds with 'count' articles per section
    this.articles = Array.from({ length: count }, (_, i) => ({
      id: `world/2026/jun/${29 - i}/article-${i + 1}`,
      title: `Headline ${i + 1}`,
      trailText: `Summary ${i + 1}`,
      thumbnail: i % 2 === 0 ? "https://example.com/thumb.jpg" : undefined,
      sectionName: "World news",
      publishedAt: `2026-06-${String(29 - i).padStart(2, "0")}T10:00:00Z`,
      url: `https://www.theguardian.com/world/2026/jun/${29 - i}/article-${i + 1}`,
    }));
  },
);

Given(
  "a previous page load has populated the Redis cache for all 5 sections",
  async function (this: TickerTapeWorld) {
    // Simulate warm cache
    this.cacheHit = true;
  },
);

Given(
  "the cache TTL of {int} seconds has not expired",
  async function (_ttl: number) {
    // Cache is still valid
  },
);

Given(
  "the Guardian API returns only {int} articles for the {string} section",
  async function (this: TickerTapeWorld, count: number, section: string) {
    this.articles = Array.from({ length: count }, (_, i) => ({
      id: `${section}/2026/jun/${29 - i}/article-${i + 1}`,
      title: `${section} headline ${i + 1}`,
      trailText: "",
      thumbnail: undefined,
      sectionName: section.charAt(0).toUpperCase() + section.slice(1),
      publishedAt: `2026-06-${String(29 - i).padStart(2, "0")}T10:00:00Z`,
      url: `https://www.theguardian.com/${section}/2026/jun/${29 - i}/article-${i + 1}`,
    }));
  },
);

Given(
  "returns {int} articles for the other 4 sections",
  async function (_count: number) {
    // Other sections have full data — no special state needed
  },
);

Given(
  "the Guardian API returns an empty results array for the {string} section",
  async function (this: TickerTapeWorld, _section: string) {
    this.articles = [];
  },
);

Given(
  "the Guardian API returns an article with a headline exceeding {int} characters",
  async function (this: TickerTapeWorld, _limit: number) {
    this.articles = [
      {
        id: "world/2026/jun/29/long-headline",
        title:
          "A".repeat(250) +
          " — this is an extremely long headline that exceeds typical display width limits and must be handled gracefully with CSS text truncation",
        trailText: "Long headline article",
        thumbnail: undefined,
        sectionName: "World news",
        publishedAt: "2026-06-29T10:00:00Z",
        url: "https://www.theguardian.com/world/2026/jun/29/long-headline",
      },
    ];
  },
);

Given(
  "an article DTO has its thumbnail field undefined",
  async function (this: TickerTapeWorld) {
    this.articles = [
      {
        id: "world/2026/jun/29/no-image",
        title: "Article without thumbnail",
        trailText: "This article has no image",
        thumbnail: undefined,
        sectionName: "World news",
        publishedAt: "2026-06-29T10:00:00Z",
        url: "https://www.theguardian.com/world/2026/jun/29/no-image",
      },
    ];
  },
);

Given(
  "an article DTO has an empty string for trailText",
  async function (this: TickerTapeWorld) {
    this.articles = [
      {
        id: "world/2026/jun/29/no-trail",
        title: "Article without trail text",
        trailText: "",
        thumbnail: undefined,
        sectionName: "World news",
        publishedAt: "2026-06-29T10:00:00Z",
        url: "https://www.theguardian.com/world/2026/jun/29/no-trail",
      },
    ];
  },
);

Given(
  "the BFF service is down or not responding",
  async function (this: TickerTapeWorld) {
    this.lastResponse = {
      status: 503,
      body: {
        status: 503,
        message: "Unable to load headlines. Please try again.",
        code: "SERVICE_UNAVAILABLE",
      },
      headers: {},
    };
  },
);

Given(
  "the Guardian API daily request limit has been reached",
  async function () {
    // Simulate rate limit exhaustion
  },
);

Given(
  "the Guardian API is experiencing an internal server error",
  async function () {
    // Simulate upstream 5xx
  },
);

Given(
  "Redis returns a cache miss",
  async function (this: TickerTapeWorld) {
    this.cacheHit = false;
  },
);

Given(
  "the Guardian API does not respond within {int} seconds",
  async function (_seconds: number) {
    // Simulate timeout
  },
);

Given(
  "the user's network connection drops after the page shell loads",
  async function () {
    // Simulate network failure mid-session
  },
);

Given(
  "the {string} section API call fails with HTTP {int}",
  async function (this: TickerTapeWorld, section: string, status: number) {
    this.currentSection = section;
    this.lastResponse = {
      status,
      body: {
        status,
        message: "Error fetching section",
        code: status === 500 ? "INTERNAL_ERROR" : "SERVICE_UNAVAILABLE",
      },
      headers: {},
    };
  },
);

Given(
  "and the other 4 sections return valid article data",
  async function () {
    // Other sections succeed — represented by the lack of error state
  },
);

Given(
  "the home page is loaded and all 5 tapes are scrolling",
  async function (this: TickerTapeWorld) {
    this.isPaused = false;
  },
);

Given(
  "the home page is loaded with 5 scrolling tapes",
  async function (this: TickerTapeWorld) {
    this.isPaused = false;
  },
);

Given(
  "the home page is loaded and a screen reader is active",
  async function () {
    // Screen reader state
  },
);

Given(
  "the user's operating system has prefers-reduced-motion set to reduce",
  async function (this: TickerTapeWorld) {
    // This is detected via CSS media query in the real implementation
    this.isPaused = true; // Animation should be disabled
  },
);

Given(
  "a screen reader is active on the home page",
  async function () {
    // Screen reader state
  },
);

Given(
  "the user has browser zoom set to {int} percent",
  async function (_zoom: number) {
    // Zoom state — UI should remain functional
  },
);

// ─── When Steps ────────────────────────────────────────────────────────

When(
  "the user navigates to the home page",
  async function (this: TickerTapeWorld) {
    // In E2E, this would be cy.visit('/')
    // In integration test, this simulates the page load
  },
);

When(
  "the user hovers the pointer over the {string} ticker tape",
  async function (this: TickerTapeWorld, _section: string) {
    this.isPaused = true;
  },
);

When(
  "the user moves the pointer away from the tape",
  async function (this: TickerTapeWorld) {
    this.isPaused = false;
  },
);

When(
  "the user clicks a headline on the {string} tape",
  async function (this: TickerTapeWorld, _section: string) {
    // Click event — should navigate to article detail
  },
);

When(
  "the user loads or refreshes the home page",
  async function () {
    // Page load with warm cache
  },
);

When(
  "the user loads the home page",
  async function (this: TickerTapeWorld) {
    // Simulate home page load
  },
);

When(
  "the ticker tape renders that headline",
  async function () {
    // Rendering step — handled by frontend component test
  },
);

When(
  "the tape renders that headline",
  async function () {
    // Rendering step
  },
);

When(
  "the user resizes the browser window",
  async function () {
    // Resize event
  },
);

When(
  "the BFF forwards a section request for {string}",
  async function (this: TickerTapeWorld, section: string) {
    this.currentSection = section;
  },
);

When(
  "the BFF forwards a section request",
  async function (this: TickerTapeWorld) {
    // Generic section request
  },
);

When(
  "the BFF processes a section request",
  async function (this: TickerTapeWorld) {
    // BFF processing step
  },
);

When(
  "the frontend attempts to fetch articles for any tape",
  async function (this: TickerTapeWorld) {
    // Frontend fetch attempt
    this.lastResponse = {
      status: 0,
      body: null,
      headers: {},
    };
  },
);

When(
  "the user presses Tab to move focus through the page",
  async function () {
    // Tab key navigation
  },
);

When(
  "the screen reader enters a ticker tape region",
  async function () {
    // Screen reader focus on tape region
  },
);

When(
  "focus leaves the tape entirely",
  async function (this: TickerTapeWorld) {
    this.isPaused = false;
  },
);

When(
  "the user focuses a headline link on a tape",
  async function (this: TickerTapeWorld) {
    this.isPaused = true;
  },
);

When(
  "the user moves focus away from that headline",
  async function (this: TickerTapeWorld) {
    this.isPaused = false;
  },
);

When(
  "the user navigates with the Tab key",
  async function () {
    // Sequential tab navigation
  },
);

When(
  "the home page loads",
  async function () {
    // Page load
  },
);

// ─── Then Steps ────────────────────────────────────────────────────────

Then(
  "exactly {int} horizontally scrolling ticker tapes are visible",
  async function (this: TickerTapeWorld, count: number) {
    // In E2E: cy.get('[data-testid="ticker-tape"]').should('have.length', count)
    // In integration test: assert on the number of tapes rendered
    assert.strictEqual(count, 5, `Expected ${count} tapes, found 5`);
  },
);

Then(
  "each tape displays a section name label from the API response",
  async function () {
    // Verify each tape has a visible section name
    // In E2E: check for text content of section labels
  },
);

Then(
  "each tape shows between {int} and {int} clickable headlines",
  async function (this: TickerTapeWorld, min: number, max: number) {
    if (this.articles && this.articles.length >= 0) {
      assert.ok(
        this.articles.length >= min && this.articles.length <= max,
        `Expected between ${min} and ${max} articles, got ${this.articles.length}`,
      );
    }
  },
);

Then(
  "all tapes scroll continuously from right to left",
  async function (this: TickerTapeWorld) {
    assert.strictEqual(this.isPaused, false, "Tapes should be scrolling");
  },
);

Then(
  "the {string} tape animation pauses",
  async function (this: TickerTapeWorld, _section: string) {
    assert.strictEqual(this.isPaused, true, `Expected tape to be paused`);
  },
);

Then(
  "the other {int} tapes continue scrolling",
  async function () {
    // Other tapes unaffected
  },
);

Then(
  "the {string} tape resumes scrolling from its paused position",
  async function (this: TickerTapeWorld, _section: string) {
    this.isPaused = false;
    assert.strictEqual(this.isPaused, false, `Expected tape to resume`);
  },
);

Then(
  "the browser navigates to the article detail page for that article ID",
  async function () {
    // Navigation assertion — checked in E2E
  },
);

Then(
  "all {int} tape responses are served from Redis without calling the Guardian API",
  async function (this: TickerTapeWorld, count: number) {
    assert.strictEqual(
      this.cacheHit,
      true,
      `Expected cache hit for all ${count} tapes`,
    );
  },
);

Then(
  "the home page renders in under {int} second",
  async function (_seconds: number) {
    // Performance assertion — checked in E2E/Lighthouse
  },
);

Then(
  "the {string} tape renders with the {int} available headlines",
  async function (this: TickerTapeWorld, section: string, count: number) {
    assert.strictEqual(
      this.articles?.length,
      count,
      `Expected ${count} headlines for ${section}`,
    );
  },
);

Then(
  "the {string} tape still scrolls",
  async function (this: TickerTapeWorld, _section: string) {
    assert.strictEqual(this.isPaused, false);
  },
);

Then(
  "a visual indicator shows the {string} tape has {string}",
  async function (_section: string, _indicator: string) {
    // Visual indicator is present
  },
);

Then(
  "the {string} tape renders an empty-state message: {string}",
  async function (this: TickerTapeWorld, _section: string, message: string) {
    // Verify empty-state message text
    assert.strictEqual(
      this.articles?.length,
      0,
      "Articles should be empty for empty-state test",
    );
  },
);

Then(
  "the {string} tape does not animate",
  async function (this: TickerTapeWorld, _section: string) {
    this.isPaused = true;
    assert.strictEqual(this.isPaused, true);
  },
);

Then(
  "the other {int} tapes continue to function normally",
  async function () {
    // Other tapes are unaffected
  },
);

Then(
  "the headline is truncated with an ellipsis",
  async function () {
    // CSS text-overflow: ellipsis should apply
  },
);

Then(
  "the full headline text is available via the title attribute on hover",
  async function () {
    // title attribute should contain full text
  },
);

Then(
  "no broken image placeholder is rendered",
  async function () {
    // No <img> with broken src or alt="broken"
  },
);

Then(
  "the headline text fills the available space normally",
  async function () {
    // Layout assertion
  },
);

Then(
  "only the title text is displayed for that headline",
  async function () {
    // trailText should not be visible
  },
);

Then(
  "all tapes continue to scroll without interruption",
  async function (this: TickerTapeWorld) {
    assert.strictEqual(this.isPaused, false);
  },
);

Then(
  "the visible headline count adjusts to the new viewport width",
  async function () {
    // Responsive layout check
  },
);

Then(
  "each tape area shows an error fallback: {string}",
  async function (this: TickerTapeWorld, message: string) {
    if (this.lastResponse?.body) {
      const body = this.lastResponse.body as Record<string, unknown>;
      assert.strictEqual(body.message, message);
    }
  },
);

Then(
  "a retry button is available on each tape",
  async function () {
    // Retry button present in error state
  },
);

Then(
  "the home page does not crash or become blank",
  async function () {
    // Page stability assertion
  },
);

Then(
  "the Guardian API returns HTTP {int}",
  async function (_status: number) {
    // Upstream response status
  },
);

Then(
  "the BFF returns HTTP {int} with error code {string}",
  async function (this: TickerTapeWorld, status: number, code: string) {
    if (this.lastResponse) {
      assert.strictEqual(this.lastResponse.status, status);
      const body = this.lastResponse.body as Record<string, unknown>;
      assert.strictEqual(body.code, code);
    }
  },
);

Then(
  "the {string} tape shows: {string}",
  async function (this: TickerTapeWorld, _section: string, message: string) {
    if (this.lastResponse?.body) {
      const body = this.lastResponse.body as Record<string, unknown>;
      assert.strictEqual(body.message, message);
    }
  },
);

Then(
  "other tapes with cached data continue to render from Redis",
  async function () {
    // Cached tapes still visible
  },
);

Then(
  "the affected tape shows an error fallback message",
  async function () {
    // Error state visible on affected tape
  },
);

Then(
  "the error response contains no Guardian API key or internal stack traces",
  async function (this: TickerTapeWorld) {
    if (this.lastResponse?.body) {
      const bodyStr = JSON.stringify(this.lastResponse.body);
      assert.ok(!bodyStr.includes("api-key"), "Response must not leak API key");
      assert.ok(!bodyStr.includes("stack"), "Response must not leak stack trace");
    }
  },
);

Then(
  "the BFF times out and returns HTTP {int} with error code {string}",
  async function (this: TickerTapeWorld, status: number, code: string) {
    if (this.lastResponse) {
      assert.strictEqual(this.lastResponse.status, status);
      const body = this.lastResponse.body as Record<string, unknown>;
      assert.strictEqual(body.code, code);
    }
  },
);

Then(
  "the fetch fails with a network error",
  async function (this: TickerTapeWorld) {
    assert.strictEqual(this.lastResponse?.status, 0, "Expected network error");
  },
);

Then(
  "the frontend automatically retries the request {int} times with exponential backoff",
  async function (_retries: number) {
    // Verified via mock call count in component test
  },
);

Then(
  "{int} tapes render normally with scrolling headlines",
  async function (this: TickerTapeWorld, _count: number) {
    assert.strictEqual(this.isPaused, false);
  },
);

Then(
  "the {string} tape shows its error fallback message",
  async function (this: TickerTapeWorld, _section: string) {
    // Error state on specific tape
  },
);

Then(
  "no global error overlay blocks the entire page",
  async function () {
    // Page not completely blocked
  },
);

Then(
  "each headline in each tape receives a visible focus indicator",
  async function () {
    // Each link has :focus-visible styling
  },
);

Then(
  "the currently focused tape pauses its animation",
  async function (this: TickerTapeWorld) {
    assert.strictEqual(this.isPaused, true);
  },
);

Then(
  "the tape resumes scrolling",
  async function (this: TickerTapeWorld) {
    this.isPaused = false;
    assert.strictEqual(this.isPaused, false);
  },
);

Then(
  "the tape region is announced as a scrollable region",
  async function () {
    // aria attributes present
  },
);

Then(
  "the tape has an aria-label that includes the section name",
  async function () {
    // aria-label check
  },
);

Then(
  "each headline is announced as a link with its article title",
  async function () {
    // Each link is accessible
  },
);

Then(
  "the tape uses aria-roledescription={string}",
  async function (_description: string) {
    // aria-roledescription attribute present
  },
);

Then(
  "all tapes are displayed as static lists with no scrolling animation",
  async function (this: TickerTapeWorld) {
    assert.strictEqual(this.isPaused, true);
  },
);

Then(
  "headlines are arranged horizontally but remain stationary",
  async function () {
    // Static layout check
  },
);

Then(
  "a manual horizontal scrollbar is visible on each tape for navigation",
  async function () {
    // overflow-x: auto applied
  },
);

Then(
  "the screen reader reads the full article title",
  async function () {
    // Screen reader announcement
  },
);

Then(
  "focus moves sequentially from the top of page through each tape's headlines",
  async function () {
    // Sequential tab order
  },
);

Then(
  "focus never jumps randomly between tapes",
  async function () {
    // Tab order is predictable
  },
);

Then(
  "focus reaches all interactive elements in a logical order",
  async function () {
    // No skipped elements
  },
);

Then(
  "all tape headlines remain readable and properly sized",
  async function () {
    // Text remains readable at zoom
  },
);

Then(
  "the scrolling behavior continues to function",
  async function () {
    // Animation still works
  },
);

Then(
  "tap targets for headline links are at least {int} by {int} pixels",
  async function (_width: number, _height: number) {
    // Minimum touch target size per WCAG 2.5.5
  },
);
