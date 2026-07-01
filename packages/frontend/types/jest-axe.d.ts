/**
 * Type declaration for jest-axe module.
 *
 * jest-axe does not ship its own TypeScript types.
 * This declaration enables type-safe usage in tests.
 */

declare module "jest-axe" {
  import type { AxeResults } from "axe-core";

  export interface JestAxeConfigureOptions {
    globalOptions?: Record<string, unknown>;
    impactLevels?: Array<"minor" | "moderate" | "serious" | "critical">;
  }

  export function axe(
    html: Element | string,
    options?: JestAxeConfigureOptions,
  ): Promise<AxeResults>;

  export const toHaveNoViolations: {
    toHaveNoViolations: () => {
      pass: boolean;
      message: () => string;
    };
  };

  export function configureAxe(
    options?: JestAxeConfigureOptions,
  ): (html: Element) => Promise<AxeResults>;
}
