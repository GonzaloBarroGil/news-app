"use client";

import { TickerTape } from "../components/TickerTape/TickerTape";
import { useTickerTape } from "../hooks/useTickerTape";
import styles from "./page.module.css";

const HOME_SECTIONS = [
  { id: "world", name: "World news" },
  { id: "technology", name: "Technology" },
  { id: "sport", name: "Sport" },
  { id: "culture", name: "Culture" },
  { id: "business", name: "Business" },
] as const;

const TAPE_LIMIT = 20;

function TickerTapeSection({
  id,
  name,
}: {
  readonly id: string;
  readonly name: string;
}) {
  const { data, isLoading, isError, error, refetch } = useTickerTape(
    id,
    TAPE_LIMIT,
  );

  return (
    <TickerTape
      section={id}
      sectionName={name}
      articles={data ?? []}
      isLoading={isLoading}
      error={
        isError
          ? (error as Error)?.message ??
            "Unable to load headlines. Please try again."
          : undefined
      }
      onRetry={() => {
        void refetch();
      }}
    />
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>News App</h1>
      {HOME_SECTIONS.map((section) => (
        <TickerTapeSection
          key={section.id}
          id={section.id}
          name={section.name}
        />
      ))}
    </div>
  );
}
