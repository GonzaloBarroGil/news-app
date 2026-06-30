"use client";

import { useState, useCallback, useEffect } from "react";
import { type ArticleDTO } from "@news-app/shared";
import styles from "./TickerTape.module.css";

export interface TickerTapeProps {
  readonly section: string;
  readonly sectionName: string;
  readonly articles: readonly ArticleDTO[];
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly onRetry?: () => void;
  readonly onArticleClick?: (articleId: string) => void;
}

export function TickerTape({
  section,
  sectionName,
  articles,
  isLoading = false,
  error,
  onRetry,
  onArticleClick,
}: TickerTapeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  if (isLoading) {
    return (
      <section
        className={styles.container}
        aria-label={`Loading headlines for ${sectionName}`}
        data-testid="ticker-tape"
      >
        <h2 className={styles.sectionTitle} data-testid="ticker-tape-section">
          {sectionName}
        </h2>
        <div
          role="status"
          aria-label={`Loading headlines for ${sectionName}`}
          className={styles.skeletonTrack}
          data-testid="ticker-tape-skeleton"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={styles.container}
        aria-label={`${sectionName} headlines`}
        data-testid="ticker-tape"
      >
        <h2 className={styles.sectionTitle} data-testid="ticker-tape-section">
          {sectionName}
        </h2>
        <div role="alert" className={styles.errorState}>
          <p>{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={styles.retryButton}
              aria-label={`Retry loading ${sectionName} headlines`}
            >
              Retry
            </button>
          )}
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section
        className={styles.container}
        aria-label={`${sectionName} headlines`}
        data-testid="ticker-tape"
      >
        <h2 className={styles.sectionTitle} data-testid="ticker-tape-section">
          {sectionName}
        </h2>
        <p className={styles.emptyState}>
          No headlines available for {sectionName}
        </p>
      </section>
    );
  }

  const duplicatedArticles = [...articles, ...articles];

  const handleArticleClick =
    (articleId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onArticleClick) {
        e.preventDefault();
        onArticleClick(articleId);
      }
    };

  const containerClass = [
    styles.container,
    isPaused ? styles.paused : "",
  ]
    .filter(Boolean)
    .join(" ");

  const innerClass = [
    styles.tapeInner,
    prefersReducedMotion ? styles.reducedMotion : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={containerClass}
      aria-label={`${sectionName} headlines`}
      aria-roledescription="ticker tape"
      role="region"
      data-testid="ticker-tape"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <h2 className={styles.sectionTitle} data-testid="ticker-tape-section">
        {sectionName}
      </h2>
      <div className={styles.tape}>
        <ul className={innerClass} aria-live="polite">
          {duplicatedArticles.map((article, index) => (
            <li key={`${section}-${article.id}-${index}`} className={styles.tapeItem}>
              {article.thumbnail ? (
                <img
                  src={article.thumbnail}
                  alt=""
                  className={styles.thumbnail}
                />
              ) : null}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.headline}
                onClick={handleArticleClick(article.id)}
                title={article.title}
                tabIndex={0}
              >
                {article.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
