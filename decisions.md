# Decisions: hourly price filter

## Root cause

The search API treated `priceMax === 100` as a special “no upper limit” value and replaced it with `Number.MAX_SAFE_INTEGER`, so a maximum of $100/hr on the client did not cap results. The range slider was also capped at $100, so users could not set a real ceiling above that (for example $125/hr) or rely on the top of the range to mean a true $100 cap; the default `[10, 100]` therefore showed all vehicles, including very expensive ones.

## Fix

The API now uses the `priceMax` (and `priceMin`) values from the UI as real dollar/hour bounds with no sentinel. The price `RangeSlider` uses higher bounds (`PRICE_FILTER_MAX_DOLLARS` is 300) and a step of $10. **Min, max, and step are defined in** `app/config/price-filter.ts` **so they can be raised when fleet pricing increases without hunting for magic numbers in components or the server.**

---

## Discount pricing refactor and tests

Rental quote math (holidays, long-rental threshold, and “pick the cheaper discount”) lives in **`app/server/PricingService.ts`** via **`getTripQuote`**, not inline in `api.ts`. Numeric policy (**17%**, **$10/hr**, **72-hour** threshold, holiday calendar dates, and user-visible discount labels) is centralized in **`app/config/constants.ts`** so the quoting code stays readable and numbers stay in one place. **`API.getQuote`** only validates input and delegates to **`getTripQuote`**.

**Vitest** covers **`getTripQuote`** in **`app/server/PricingService.test.ts`**: baseline totals, holiday and duration rules (including edge cases like exactly 72 hours and hourly rates below $10), competing discounts, and tie-breaking when two candidates yield the same cents total.

**Future improvement (more time):** abstract dedicated pricing rules behind a **strategy** interface so each discount is a pluggable strategy (eligibility + priced total). The quoting mechanism would iterate registered strategies and choose the best outcome without editing core quote flow whenever we add or retire a rule.
