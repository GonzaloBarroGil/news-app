/**
 * Jest setup for frontend tests.
 * Extends Jest with DOM-specific matchers and a11y assertions.
 */
import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
