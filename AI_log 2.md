# Rental discount feature implementation
_Exported on 5/4/2026 at 21:54:17 EDT from Cursor (3.2.21)_

---

**User**

Okay we have to implement a feature: 

Here's the context of the feature: 

There's two types of discounts: 

- holiday discount: 17% off the total price. This applies ONLY if a holiday falls between the start and end dates of the rental
- holiday dates to use: 
- Jan 21
- Feb 12
- Mar 04
- May 02
- Jun 16
- Jul 26
- Aug 03
- Sep 01
- Nov 05
- Dec 18

- duration discount: 10$/hr off the hourly rate if the rental is >3 days. 

- if both discounts apply, we use the one that results in the lowest final price for the user

Can you come up with an implementation plan for this feature?


---

**Cursor**

Exploring the codebase to see how rental pricing is calculated so we can draft a concrete implementation plan.



Here is an implementation plan aligned with your repo: pricing lives in `app/server/api.ts` (`calculateTotalPrice` → `getQuote`), and the review UI shows `quote.totalPriceCents` and the vehicle’s list hourly rate.

## Goals

1. **Holiday discount**: 17% off **total** rental cost when **at least one** configured holiday **calendar day** falls inside the rental interval (inclusive of pick-up/drop-off dates as appropriate).
2. **Duration discount**: **$10/hr** off the **hourly rate** when rental duration is **> 3 days**.
3. **Combining**: If both rules qualify, charge **the lower of the two final totals** (not stacking).

---

## Product decisions to lock in first

These avoid ambiguous math and support tickets later:

| Topic | What to decide |
|--------|----------------|
| **“> 3 days”** | **Calendar days** (e.g. Luxon `diff` in whole days) vs **72 hours** vs **≥ 72h beyond 3 calendar midnights**. Pick one and document it in code. |
| **Holiday “between”** | Treat as **date overlap**: rental interval **[start, end]** overlaps **any** holiday **local calendar date** (see timezone below). Clarify edge cases: rental starts 23:59 on a holiday still counts; rental ends 00:01 on holiday still counts. |
| **Year** | Holidays are **month/day only**—they repeat every year. For a rental spanning Dec 31 → Jan 2, evaluate holidays in **both** calendar years touched by the interval. |
| **Timezone** | `DateTime.fromISO` uses offset from the string; user-facing dates use `date-fns` on `Date`. Pick **one** zone for “which calendar day” (e.g. **America/New_York** or **local** consistently) and use it in server-side holiday checks. |
| **Rounding** | Use **integer cents** end-to-end: e.g. holiday `floor(total * 83 / 100)` or **banker’s rounding**—choose one rule for 17%. |

---

## Code shape

### 1. Centralize rules (new small module)

Add something like `app/server/pricing.ts` (or `discounts.ts`) with:

- **Constants**: list of holidays as `{ month, day }` (or `MM-DD` strings), `$10/hr` as `1000` cents, `17%` as rational math in cents.
- **`baseTotalCents(start, end, hourlyRateCents)`** — same as today’s `hourlyRateCents * durationInHours` (keep current behavior for the undiscounted baseline).
- **`holidayApplies(start, end, zone)`** — true if any holiday date intersects the rental’s calendar-day range in that zone.
- **`holidayTotalCents(baseTotalCents)`** — 17% off total.
- **`durationDiscountApplies(start, end)`** — per your “> 3 days” definition.
- **`durationAdjustedTotalCents(start, end, hourlyRateCents)`** — effective hourly `max(0, hourly - 1000)` × hours (define behavior if rate &lt; $10/hr).
- **`quoteWithDiscounts(...)`** — computes:
  - `baseTotalCents`
  - optional `holidayTotalCents` if holiday applies
  - optional `durationTotalCents` if duration applies
  - `totalPriceCents = min(applicable finals)` (if only one rule applies, that one; if neither, base)
  - metadata: which **single** strategy won (`"holiday" | "duration" | "none"`), and optionally the “other” price for transparency (“You save more with …”).

This keeps `api.ts` thin: `getQuote` calls `quoteWithDiscounts` instead of only `calculateTotalPrice`.

### 2. Update `getQuote` return type

Extend the object returned from `getQuote` so the UI (and future APIs) can show:

- Final `totalPriceCents`
- `baseTotalCents` (pre-discount)
- `appliedDiscountKind` and maybe `savingsCents` vs base

Types can live next to the function or in a small `types` section in `api.ts`.

### 3. Review UI (`ReviewPage.tsx`)

- Continue using **server** `API.getQuote` for the number users pay.
- Show **list hourly rate** vs **effective rate** only when a duration-style discount wins (or always show “total after best discount”).
- Add a short line when a discount applies: e.g. “Holiday pricing applied” or “Long rental rate applied” so the total is explainable.

Optional later: search cards (`VehicleListItem`) could show “Est. from …” using the same quote helper with search `start`/`end`—not required for correctness if quotes are only needed at review.

### 4. Tests

Add unit tests (Vitest/Jest or whatever the project uses—check `package.json`) for:

- Holiday **inside** / **outside** / **on boundary** of interval.
- Year boundary (late Dec → early Jan).
- Duration **just below** vs **just above** 3 days per your definition.
- Both discounts eligible → **min** is chosen.
- Integer cents: no floating drift.

---

## Order of work

1. Confirm the four **product decisions** (duration definition, timezone, rounding, rate floor).
2. Implement **pure functions** + constants in `pricing` module with tests.
3. Wire **`getQuote`** to use them; keep **search** unchanged unless you want estimated totals on listings.
4. Update **Review** summary to display discount metadata and consistent totals.

---

## Risk notes

- **Don’t** duplicate discount logic on the client; `ReviewPage` already calls `API.getQuote`—keep a single source of truth on the server.
- **Search price filter** (`getAvailableVehicles`) filters by **vehicle list hourly rate**, not trip-specific discounts—that may still be correct; only revisit if product wants “filter by discounted hourly equivalent.”

If you want, the next step is implementing this in the repo once you’ve chosen “> 3 days” (hours vs calendar days) and timezone for holiday matching.

---

**User**

- Correction: The holiday must fall strictly between the start and end dates. If the rental starts or ends on a holiday, the discount does not apply

- for the duration definition, use strictly greater than 72 hours as the threshold for the 3 day discount. 

- let's implement it in api.ts for now. We can refactor later. 

- the UI must show original price crossed out and the new discounted price. 

and lets use math.floor calculcations to keep everything in cents. 

---

**Cursor**

Implementing discount logic in `api.ts` and updating the review UI to show the original price struck through and the discounted total. Checking for tests and the exact `getQuote` usage.



Implementing discount logic and updating the review UI.



Fixing `appliedDiscount`: the previous ternary was incorrect when the winning candidate wasn't `"none"`. Simplifying the logic:



Here is what was implemented.

### `app/server/api.ts`

- **Holiday list** — Fixed month/day entries as specified.
- **Holiday discount (17%)** — `Math.floor(baseTotalCents * 83 / 100)`. It applies only when at least one **calendar day** falls **strictly between** pick-up and drop-off: iterate `start.startOf("day") + 1 day` while `< end.startOf("day")`, so the pick-up day and drop-off day are excluded (including when either is a holiday).
- **Duration discount** — Rental length must be **strictly greater than 72 hours** (`end.toMillis() - start.toMillis() > 72 * 60 * 60 * 1000`). Hourly rate is reduced by **$10** (`1000` cents), floored at `0`, then total is `Math.floor(discountedHourlyCents * durationInHours)`.
- **Base total** — `Math.floor(hourlyRateCents * durationInHours)`.
- **Best price** — Among base, holiday total (if a qualifying holiday falls in the open interval), and duration total (if `> 72h`), the implementation keeps the **minimum** total.
- **`getQuote` return shape** — Now returns `QuoteResult`: `totalPriceCents`, `baseTotalCents`, `appliedDiscount` (`"none" | "holiday" | "duration"`), plus existing `hourlyRateCents` and `durationInHours`.

### `app/components/review/ReviewPage.tsx`

- When `appliedDiscount !== "none"`, **Total cost** shows **`baseTotalCents` struck through** and the **discounted `totalPriceCents`** beside/below it; otherwise a single total as before.

`npm run ts` completes successfully.

**Note:** Holiday “days between” use Luxon’s notion of **calendar days in the same zone as the parsed ISO times** (typically UTC for `toISOString()`). If you later want “local business timezone” instead, you’d normalize with `DateTime.fromISO(..., { zone: "America/..." })` before the day loop.

---

**User**

I'm seeing a bad request error on the search page. 


## Error Message
BAD REQUEST: end_time must be after start_time


this is likely because you're calculating the quote using default or uninitialized dates. can you suggest a fix? 


---

**Cursor**

Tracing the search flow to find where invalid start/end times are produced.



Identifying the issue: `searchVehicles` calls `parseAndValidateTimeRange`, which throws when `end <= start`; the catch block logs with `console.error`, which triggers Next.js's dev error overlay. Checking `combineDateTime` and date-picker interactions for cases where end can be before start.



Identifying the issue: `searchVehicles` throws when `end <= start`, and `console.error` in the catch triggers Next.js's dev error overlay. Causes include drop-off date before pick-up, same-day rentals with drop-off time before pick-up, and uncontrolled `Select` components (`defaultValue` only) getting out of sync with form state. Fixing by: guarding the search API call, normalizing invalid ranges in the form, hardening `combineDateTime`, using controlled Selects, and restricting the drop-off calendar.



Refactoring VehicleList to an early return for invalid ranges to simplify types.



Here is what was going wrong and what we changed.

### Cause

1. **`API.searchVehicles`** calls `parseAndValidateTimeRange`, which **throws** when `end <= start`. The `catch` block did **`console.error(error)`**, which in Next.js dev surfaces as the **red error overlay** (“BAD REQUEST…”).

2. **Invalid ranges** happen when users pick a **drop-off date before pick-up**, or **same day with drop-off time before pick-up**. The calendars did not enforce `end date ≥ pick-up date`.

3. **`Select` used `defaultValue` only**, so it was **uncontrolled** and could drift from react-hook-form when values updated.

4. **`combineDateTime`** did not handle missing/invalid `time`, which could produce **Invalid Date** and odd ordering.

### Fixes (implemented)

| Change | Purpose |
|--------|--------|
| **`VehicleList`** | Only calls `searchVehicles` when both datetimes are finite and **`end > start`**. Otherwise shows a short message and **never hits the API**, so nothing throws or logs. |
| **`TimeRangeFilters`** | **`useEffect`** detects `end <= start` (or invalid NaNs) and sets drop-off to **`pick-up + 1 hour`** via `setValue`. |
| **Drop-off calendar** | Disables dates **before today** and **before the pick-up date** (`isBefore` + `startOfDay`). |
| **`Select`** | Uses **`value={field.value}`** so times stay tied to form state. |
| **`combineDateTime`** | Guards **missing date/time** and **NaN** hour/minute components. |

Together, the UI should stay in a valid range and the search API should not run with bad timestamps, so the dev overlay from this path should stop. If anything else still logs `BAD REQUEST`, say where it appears (search vs review) and we can trace that path too.

---

**User**

okay the discount has been implemented correctly and i can see it on the checkout page but not on the search page. 

- the vehicle cards should be updated
- the estimated trip total should be displayed. if a discount applies, we should show the original amount crossed out and the discounted total as on the review page. 
- if the dates are invalid or haven't been selected yet, just the base rate is fine as the fallback. 

---

**Cursor**

Updating vehicle cards to show trip estimates with discount styling. Checking API exports and current components.



Adding a filter-only vehicle query for invalid dates, then updating `VehicleList` and `VehicleListItem` to show trip estimates and match the review page pricing display.



Fixing a bug: when `showTripEstimate` is false, invalid dates can make `toISOString()` throw. Building book URL params only when the trip is bookable.



Here is what was implemented.

### 1. `app/server/data_helpers.ts`
- Added **`filterVehiclesByCriteria`**: same filters as search (passengers, class, make, price) but **no** reservation / availability check.

### 2. `app/server/api.ts`
- Added **`browseVehicles`**, which returns that filtered list for when trip dates are not usable.

### 3. `app/components/search/VehicleList.tsx`
- If the range is **valid** → still uses **`searchVehicles`** (availability + trip pricing).
- If the range is **invalid** → uses **`browseVehicles`** so you still get results and can show **list hourly** only.
- Passes **`showTripEstimate={hasValidTimeRange}`** into each card.

### 4. `app/components/search/VehicleListItem.tsx`
- When **`showTripEstimate`** is true: calls **`API.getQuote`**, shows **“Est. trip total”** with the same **strikethrough + discounted** pattern as the review page when `appliedDiscount !== "none"`, otherwise a single total.
- When **`showTripEstimate`** is false: only **`formatCents(vehicle.hourly_rate_cents) /hr`** (no quote).
- **Book now** is only active when the range is valid; otherwise a **disabled** button (avoids `toISOString()` on bad dates and matches “set dates first”).

So: with valid pick-up/drop-off you get an estimated trip total (and discount styling when it applies); with missing/invalid times you get the base **/hr** line and a disabled book action; browse mode does not run availability, so results can include cars that are not free for the default/invalid range—only the **search with a valid range** enforces that. If you want availability to apply only after dates are valid and to hide the list until then, that would be a small product change on top of this.

---

**User**

let's make a small UX improvement. 

- when a discount is applied, add a small text label or badge next to the price showing which discount was applied to help the user understand why the price was reduced

---

**Cursor**

Adding a small reusable badge component and placing it beside discounted prices on the review and search cards.



Here is what was added.

### `app/components/shared/DiscountBadge.tsx`
- Renders only when `discount` is not `"none"`.
- **Holiday** → label **“Holiday”**, tooltip describing the 17% holiday rule.
- **Duration** → label **“Long rental”**, tooltip describing the &gt;72h / $10/hr rule.
- Small emerald pill (`border`, `bg-emerald-50`, compact text) so it reads as a badge without adding a new UI primitive.

### `ReviewPage.tsx`
- When a discount applies, the badge sits beside the struck-through + final totals (wraps on narrow widths).

### `VehicleListItem.tsx`
- Same badge under/alongside the estimated trip total when a discount applies (aligned with the card’s right column).

Tooltips explain *why* the price dropped on hover; short labels keep the layout tight.

