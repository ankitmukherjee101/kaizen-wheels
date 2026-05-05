# Decisions: hourly price filter

## Root cause

The search API treated `priceMax === 100` as a special “no upper limit” value and replaced it with `Number.MAX_SAFE_INTEGER`, so a maximum of $100/hr on the client did not cap results. The range slider was also capped at $100, so users could not set a real ceiling above that (for example $125/hr) or rely on the top of the range to mean a true $100 cap; the default `[10, 100]` therefore showed all vehicles, including very expensive ones.

## Fix

The API now uses the `priceMax` (and `priceMin`) values from the UI as real dollar/hour bounds with no sentinel. The price `RangeSlider` uses higher bounds (`PRICE_FILTER_MAX_DOLLARS` is 300) and a step of $10. **Min, max, and step are defined in** `app/config/price-filter.ts` **so they can be raised when fleet pricing increases without hunting for magic numbers in components or the server.**
