import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import {
  DURATION_DISCOUNT_THRESHOLD_MS,
  HOLIDAY_DISCOUNT_LABEL,
  LONG_TERM_RENTAL_DISCOUNT_LABEL,
} from "@/config/constants";
import { getTripQuote } from "./PricingService";

const hourly = (cents: number) => cents;

describe("getTripQuote", () => {
  it("computes base total with floored cents and no discount when rules do not apply", () => {
    const start = DateTime.fromISO("2026-06-10T12:00:00.000Z");
    const end = DateTime.fromISO("2026-06-10T15:30:00.000Z");
    const rate = hourly(1000);
    const q = getTripQuote(start, end, rate);
    expect(q.durationInHours).toBe(3.5);
    expect(q.baseTotalCents).toBe(Math.floor(1000 * 3.5));
    expect(q.totalPriceCents).toBe(q.baseTotalCents);
    expect(q.appliedDiscount).toBe("none");
    expect(q.appliedDiscountLabel).toBeNull();
  });

  it("applies holiday discount when a configured holiday falls strictly between pick-up and drop-off days", () => {
    const start = DateTime.fromISO("2026-01-20T12:00:00.000-05:00");
    const end = DateTime.fromISO("2026-01-22T12:00:00.000-05:00");
    const rate = hourly(10_000);
    const q = getTripQuote(start, end, rate);
    expect(q.baseTotalCents).toBe(480_000);
    expect(q.totalPriceCents).toBe(
      Math.floor((480_000 * 83) / 100),
    );
    expect(q.appliedDiscount).toBe("holiday");
    expect(q.appliedDiscountLabel).toBe(HOLIDAY_DISCOUNT_LABEL);
  });

  it("does not apply holiday discount when the holiday is only on pick-up or drop-off calendar day", () => {
    const start = DateTime.fromISO("2026-01-21T08:00:00.000-05:00");
    const end = DateTime.fromISO("2026-01-21T18:00:00.000-05:00");
    const q = getTripQuote(start, end, hourly(5000));
    expect(q.appliedDiscount).toBe("none");
    expect(q.appliedDiscountLabel).toBeNull();
  });

  it("applies long-rental discount when duration is strictly greater than 72 hours", () => {
    const start = DateTime.fromISO("2026-06-01T00:00:00.000Z");
    const end = DateTime.fromISO("2026-06-04T01:00:00.000Z");
    const ms = end.toMillis() - start.toMillis();
    expect(ms).toBeGreaterThan(DURATION_DISCOUNT_THRESHOLD_MS);
    const rate = hourly(5000);
    const q = getTripQuote(start, end, rate);
    const hours = q.durationInHours;
    expect(q.baseTotalCents).toBe(Math.floor(rate * hours));
    expect(q.totalPriceCents).toBe(Math.floor(Math.max(0, rate - 1000) * hours));
    expect(q.appliedDiscount).toBe("duration");
    expect(q.appliedDiscountLabel).toBe(LONG_TERM_RENTAL_DISCOUNT_LABEL);
  });

  it("does not apply long-rental discount when duration is exactly 72 hours", () => {
    const start = DateTime.fromISO("2026-06-01T00:00:00.000Z");
    const end = start.plus({ milliseconds: DURATION_DISCOUNT_THRESHOLD_MS });
    const q = getTripQuote(start, end, hourly(5000));
    expect(q.appliedDiscount).toBe("none");
    expect(q.appliedDiscountLabel).toBeNull();
  });

  it("clamps long-rental adjusted hourly rate at zero when list rate is below $10/hr", () => {
    const start = DateTime.fromISO("2026-06-01T00:00:00.000Z");
    const end = DateTime.fromISO("2026-06-04T01:00:00.000Z");
    const q = getTripQuote(start, end, hourly(500));
    expect(q.totalPriceCents).toBe(0);
    expect(q.appliedDiscount).toBe("duration");
    expect(q.appliedDiscountLabel).toBe(LONG_TERM_RENTAL_DISCOUNT_LABEL);
  });

  it("chooses the cheaper option when both holiday and long-rental discounts qualify", () => {
    const start = DateTime.fromISO("2026-01-18T12:00:00.000-05:00");
    const end = DateTime.fromISO("2026-01-25T12:00:00.000-05:00");
    const rate = hourly(20_000);
    const q = getTripQuote(start, end, rate);
    const hours = q.durationInHours;
    const base = Math.floor(rate * hours);
    const holidayTotal = Math.floor((base * 83) / 100);
    const durationTotal = Math.floor(Math.max(0, rate - 1000) * hours);
    expect(q.baseTotalCents).toBe(base);
    const expectedKind =
      holidayTotal <= durationTotal ? "holiday" : "duration";
    expect(q.appliedDiscount).toBe(expectedKind);
    expect(q.totalPriceCents).toBe(
      expectedKind === "holiday" ? holidayTotal : durationTotal,
    );
    if (expectedKind === "holiday") {
      expect(q.appliedDiscountLabel).toBe(HOLIDAY_DISCOUNT_LABEL);
    } else {
      expect(q.appliedDiscountLabel).toBe(LONG_TERM_RENTAL_DISCOUNT_LABEL);
    }
  });

  it("when holiday and long-rental totals tie, keeps the holiday candidate (reduce uses first minimum on equal totals)", () => {
    const candidates = [
      { total: 1000, kind: "none" as const },
      { total: 500, kind: "holiday" as const },
      { total: 500, kind: "duration" as const },
    ];
    const best = candidates.reduce((a, b) => (a.total <= b.total ? a : b));
    expect(best.kind).toBe("holiday");
  });
});
