import { DateTime } from "luxon";
import {
  DURATION_DISCOUNT_CENTS_PER_HOUR,
  DURATION_DISCOUNT_THRESHOLD_MS,
  HOLIDAY_DISCOUNT_DENOMINATOR,
  HOLIDAY_DISCOUNT_LABEL,
  HOLIDAY_DISCOUNT_NUMERATOR,
  HOLIDAY_MONTH_DAYS,
  LONG_TERM_RENTAL_DISCOUNT_LABEL,
} from "@/config/constants";

const isConfiguredHoliday = (day: DateTime): boolean =>
  HOLIDAY_MONTH_DAYS.some(
    (h) => h.month === day.month && h.day === day.day,
  );

/**
 * True if some calendar day strictly between pick-up and drop-off is a configured
 * holiday (excludes the pick-up calendar day and drop-off calendar day).
 */
const hasHolidayStrictlyBetween = (
  start: DateTime,
  end: DateTime,
): boolean => {
  let cursor = start.startOf("day").plus({ days: 1 });
  const endDay = end.startOf("day");
  while (cursor < endDay) {
    if (isConfiguredHoliday(cursor)) {
      return true;
    }
    cursor = cursor.plus({ days: 1 });
  }
  return false;
};

export type QuoteDiscount = "none" | "holiday" | "duration";

export type QuoteResult = {
  totalPriceCents: number;
  /** Total before any discount (floor cents). */
  baseTotalCents: number;
  /** Which single discount was applied to reach totalPriceCents, if any. */
  appliedDiscount: QuoteDiscount;
  /** User-facing label when a discount applies; null when none. */
  appliedDiscountLabel: string | null;
  hourlyRateCents: number;
  durationInHours: number;
};

type Candidate = { total: number; kind: QuoteDiscount };

function discountLabelFor(kind: QuoteDiscount): string | null {
  if (kind === "holiday") {
    return HOLIDAY_DISCOUNT_LABEL;
  }
  if (kind === "duration") {
    return LONG_TERM_RENTAL_DISCOUNT_LABEL;
  }
  return null;
}

export function getTripQuote(
  start: DateTime,
  end: DateTime,
  hourlyRateCents: number,
): QuoteResult {
  const durationInHours = end.diff(start, "hours").hours || 0;
  const baseTotalCents = Math.floor(hourlyRateCents * durationInHours);

  const durationMs = end.toMillis() - start.toMillis();
  const qualifiesDurationDiscount =
    durationMs > DURATION_DISCOUNT_THRESHOLD_MS;
  const qualifiesHolidayDiscount = hasHolidayStrictlyBetween(start, end);

  const holidayTotalCents = Math.floor(
    (baseTotalCents * HOLIDAY_DISCOUNT_NUMERATOR) /
      HOLIDAY_DISCOUNT_DENOMINATOR,
  );
  const discountedHourlyCents = Math.max(
    0,
    hourlyRateCents - DURATION_DISCOUNT_CENTS_PER_HOUR,
  );
  const durationDiscountTotalCents = Math.floor(
    discountedHourlyCents * durationInHours,
  );

  const candidates: Candidate[] = [{ total: baseTotalCents, kind: "none" }];

  if (qualifiesHolidayDiscount) {
    candidates.push({ total: holidayTotalCents, kind: "holiday" });
  }
  if (qualifiesDurationDiscount) {
    candidates.push({
      total: durationDiscountTotalCents,
      kind: "duration",
    });
  }

  const best = candidates.reduce((a, b) => (a.total <= b.total ? a : b));

  const appliedDiscount: QuoteDiscount =
    best.total < baseTotalCents && best.kind !== "none"
      ? best.kind
      : "none";

  return {
    totalPriceCents: best.total,
    baseTotalCents,
    appliedDiscount,
    appliedDiscountLabel: discountLabelFor(appliedDiscount),
    hourlyRateCents,
    durationInHours,
  };
}
