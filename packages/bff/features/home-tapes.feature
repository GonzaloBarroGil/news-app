# Home Module — Ticker Tapes
#
# BDD scenarios derived from SPEC.md §4 (Home Module).
# These scenarios define the user-visible behavior of the 5 horizontally-scrolling
# ticker tapes on the home page.
#
# Tags:
#   @happy-path     — Core user flows
#   @edge-case      — Boundary conditions
#   @error-state    — Failure modes
#   @loading-state  — Loading indicators
#   @empty-state    — No-content fallbacks
#   @a11y           — Accessibility (WCAG 2.1 AA)
#   @responsive     — Viewport adaptations

Feature: Home Page Ticker Tapes
  As a news reader
  I want to see 5 continuously scrolling horizontal ticker tapes on the home page
  So that I can quickly browse headlines from different Guardian sections

  Background:
    Given the BFF is running and the Guardian API is available
    And the BFF Redis cache is available

  # ─── Happy Path ───────────────────────────────────────────────────────

  @happy-path
  Scenario: Home page loads with 5 scrolling ticker tapes
    Given the Guardian API returns 20 articles for each of the 5 home sections
    When the user navigates to the home page
    Then exactly 5 horizontally scrolling ticker tapes are visible
    And each tape displays a section name label from the API response
    And each tape shows between 10 and 20 clickable headlines
    And all tapes scroll continuously from right to left

  @happy-path
  Scenario: User hovers over a tape to pause animation
    Given the home page is loaded and all 5 tapes are scrolling
    When the user hovers the pointer over the "World news" ticker tape
    Then the World news tape animation pauses
    And the other 4 tapes continue scrolling
    When the user moves the pointer away from the tape
    Then the World news tape resumes scrolling from its paused position

  @happy-path
  Scenario: User clicks a headline on a tape to view article
    Given the home page is loaded with 5 scrolling tapes
    When the user clicks a headline on the World news tape
    Then the browser navigates to the article detail page for that article ID

  @happy-path
  Scenario: Redis cache hit returns cached articles immediately
    Given a previous page load has populated the Redis cache for all 5 sections
    And the cache TTL of 300 seconds has not expired
    When the user loads or refreshes the home page
    Then all 5 tape responses are served from Redis without calling the Guardian API
    And the home page renders in under 1 second

  # ─── Edge Cases ───────────────────────────────────────────────────────

  @edge-case
  Scenario: Fewer than 10 articles available for a section
    Given the Guardian API returns only 4 articles for the "sport" section
    And returns 20 articles for the other 4 sections
    When the user loads the home page
    Then the sport tape renders with the 4 available headlines
    And the sport tape still scrolls
    And a visual indicator shows the sport tape has "Limited headlines"

  @edge-case
  Scenario: Zero articles available for a section
    Given the Guardian API returns an empty results array for the "culture" section
    And returns 20 articles for the other 4 sections
    When the user loads the home page
    Then the culture tape renders an empty-state message: "No headlines available for Culture"
    And the culture tape does not animate
    And the other 4 tapes continue to function normally

  @edge-case
  Scenario: Article headline is extremely long
    Given the Guardian API returns an article with a headline exceeding 200 characters
    When the ticker tape renders that headline
    Then the headline is truncated with an ellipsis
    And the full headline text is available via the title attribute on hover

  @edge-case
  Scenario: Article has no thumbnail image
    Given an article DTO has its thumbnail field undefined
    When the tape renders that headline
    Then no broken image placeholder is rendered
    And the headline text fills the available space normally

  @edge-case
  Scenario: Article has no trailText
    Given an article DTO has an empty string for trailText
    When the tape renders that headline
    Then only the title text is displayed for that headline

  @edge-case
  Scenario: Browser window resizes during playback
    Given the home page is loaded with 5 scrolling tapes
    When the user resizes the browser window
    Then all tapes continue to scroll without interruption
    And the visible headline count adjusts to the new viewport width

  # ─── Error States ─────────────────────────────────────────────────────

  @error-state
  Scenario: BFF is unreachable
    Given the BFF service is down or not responding
    When the user loads the home page
    Then each tape area shows an error fallback: "Unable to load headlines. Please try again."
    And a retry button is available on each tape
    And the home page does not crash or become blank

  @error-state
  Scenario: Guardian API rate-limited returns 503 for that tape
    Given the Guardian API daily request limit has been reached
    When the BFF forwards a section request for "world"
    Then the Guardian API returns HTTP 429
    And the BFF returns HTTP 503 with error code "RATE_LIMITED"
    And the World news tape shows: "Service temporarily unavailable. Please try again later."
    And other tapes with cached data continue to render from Redis

  @error-state
  Scenario: Guardian API returns 5xx error
    Given the Guardian API is experiencing an internal server error
    When the BFF forwards a section request
    Then the Guardian API returns HTTP 500
    And the BFF returns HTTP 502 with error code "SERVICE_UNAVAILABLE"
    And the affected tape shows an error fallback message
    And the error response contains no Guardian API key or internal stack traces

  @error-state
  Scenario: Redis cache miss and Guardian API timeout
    Given Redis returns a cache miss
    And the Guardian API does not respond within 10 seconds
    When the BFF processes a section request
    Then the BFF times out and returns HTTP 504 with error code "GATEWAY_TIMEOUT"
    And the affected tape shows: "Request timed out. Please try again."

  @error-state
  Scenario: Network error during article fetch
    Given the user's network connection drops after the page shell loads
    When the frontend attempts to fetch articles for any tape
    Then the fetch fails with a network error
    And the affected tape shows a connectivity error: "Network error. Check your connection."
    And the frontend automatically retries the request 3 times with exponential backoff

  @error-state
  Scenario: One tape fails while others succeed
    Given the "business" section API call fails with HTTP 500
    And the other 4 sections return valid article data
    When the user loads the home page
    Then 4 tapes render normally with scrolling headlines
    And the business tape shows its error fallback message
    And no global error overlay blocks the entire page

  # ─── Accessibility ────────────────────────────────────────────────────

  @a11y
  Scenario: Keyboard user navigates through headlines
    Given the home page is loaded with 5 scrolling tapes
    When the user presses Tab to move focus through the page
    Then each headline in each tape receives a visible focus indicator
    And the currently focused tape pauses its animation
    When focus leaves the tape entirely
    Then the tape resumes scrolling

  @a11y
  Scenario: Screen reader announces tape content
    Given the home page is loaded and a screen reader is active
    When the screen reader enters a ticker tape region
    Then the tape region is announced as a scrollable region
    And the tape has an aria-label that includes the section name
    And each headline is announced as a link with its article title
    And the tape uses aria-roledescription="ticker tape"

  @a11y
  Scenario: User has prefers-reduced-motion enabled
    Given the user's operating system has prefers-reduced-motion set to reduce
    When the user loads the home page
    Then all tapes are displayed as static lists with no scrolling animation
    And headlines are arranged horizontally but remain stationary
    And a manual horizontal scrollbar is visible on each tape for navigation

  @a11y
  Scenario: Screen reader user pauses tape to read a headline
    Given a screen reader is active on the home page
    When the user focuses a headline link on a tape
    Then the tape animation pauses
    And the screen reader reads the full article title
    When the user moves focus away from that headline
    Then the tape resumes scrolling

  @a11y
  Scenario: Focus order follows a logical sequence
    Given the home page is loaded
    When the user navigates with the Tab key
    Then focus moves sequentially from the top of page through each tape's headlines
    And focus never jumps randomly between tapes
    And focus reaches all interactive elements in a logical order

  @a11y
  Scenario: High contrast and text scaling work correctly
    Given the user has browser zoom set to 200 percent
    When the home page loads
    Then all tape headlines remain readable and properly sized
    And the scrolling behavior continues to function
    And tap targets for headline links are at least 44 by 44 pixels
