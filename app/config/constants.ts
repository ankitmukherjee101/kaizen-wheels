/** Milliseconds in one hour — used for long-rental threshold math. */
export const MS_PER_HOUR = 60 * 60 * 1000;

/** Long-rental discount applies when rental duration exceeds this (72 hours). */
export const DURATION_DISCOUNT_THRESHOLD_MS = 72 * MS_PER_HOUR;

/** Amount subtracted from hourly rate for long rentals, in cents ($10/hr). */
export const DURATION_DISCOUNT_CENTS_PER_HOUR = 1000;

/**
 * Holiday discount: 17% off total → multiply base total by 83/100 (integer floor).
 */
export const HOLIDAY_DISCOUNT_NUMERATOR = 83;
export const HOLIDAY_DISCOUNT_DENOMINATOR = 100;

/**
 * Promotional calendar dates (month/day, every year). Holiday discount applies when
 * a full calendar day strictly between pick-up and drop-off falls on one of these.
 */
export const HOLIDAY_MONTH_DAYS: readonly { month: number; day: number }[] = [
  { month: 1, day: 21 },
  { month: 2, day: 12 },
  { month: 3, day: 4 },
  { month: 5, day: 2 },
  { month: 6, day: 16 },
  { month: 7, day: 26 },
  { month: 8, day: 3 },
  { month: 9, day: 1 },
  { month: 11, day: 5 },
  { month: 12, day: 18 },
];

/** Shown next to the discounted price when the holiday rule wins. */
export const HOLIDAY_DISCOUNT_LABEL = "Holiday Discount (17% off)";

/** Shown next to the discounted price when the long-rental rule wins. */
export const LONG_TERM_RENTAL_DISCOUNT_LABEL =
  "Long-term Rental ($10/hr off)";
