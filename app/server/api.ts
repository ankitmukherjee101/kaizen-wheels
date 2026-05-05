import { DateTime } from "luxon";
import {
  filterVehiclesByCriteria,
  getAvailableVehicles,
  getReservationById,
  getVehicleById,
  getVehicles,
} from "./data_helpers";

/** Month (1–12) and day per calendar year; discount does not apply on pick-up or drop-off day. */
const HOLIDAY_MONTH_DAYS: readonly { month: number; day: number }[] = [
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

const MS_PER_HOUR = 60 * 60 * 1000;
const DURATION_DISCOUNT_THRESHOLD_MS = 72 * MS_PER_HOUR;
/** $10/hr in cents */
const DURATION_DISCOUNT_CENTS_PER_HOUR = 1000;
/** 17% off → multiply base by 83/100 */
const HOLIDAY_DISCOUNT_NUMERATOR = 83;
const HOLIDAY_DISCOUNT_DENOMINATOR = 100;

const isConfiguredHoliday = (day: DateTime): boolean =>
  HOLIDAY_MONTH_DAYS.some(
    (h) => h.month === day.month && h.day === day.day,
  );

/**
 * True if some calendar day in the rental is a configured holiday, excluding
 * the pick-up day and drop-off day (only days strictly between).
 */
const hasHolidayStrictlyBetween = (start: DateTime, end: DateTime): boolean => {
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
  hourlyRateCents: number;
  durationInHours: number;
};

const parseAndValidateTimeRange = (startTime: string, endTime: string) => {
  const start = DateTime.fromISO(startTime);
  const end = DateTime.fromISO(endTime);

  if (
    start.toString() === "Invalid Date" ||
    end.toString() === "Invalid Date"
  ) {
    throw new Error(
      "BAD REQUEST: Invalid date format. Please use ISO 8601 format.",
    );
  }

  if (end <= start) {
    throw new Error("BAD REQUEST: end_time must be after start_time");
  }
  return { start, end };
};

const calculateTotalPrice = (
  start: DateTime,
  end: DateTime,
  hourlyRateCents: number,
): QuoteResult => {
  const durationInHours = end.diff(start, "hours").hours || 0;
  const baseTotalCents = Math.floor(hourlyRateCents * durationInHours);

  const durationMs = end.toMillis() - start.toMillis();
  const qualifiesDurationDiscount =
    durationMs > DURATION_DISCOUNT_THRESHOLD_MS;
  const qualifiesHolidayDiscount = hasHolidayStrictlyBetween(start, end);

  const holidayTotalCents =
    Math.floor(
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

  type Candidate = { total: number; kind: QuoteDiscount };

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
    hourlyRateCents,
    durationInHours,
  };
};

const validateReservationAndGetVehicle = (input: {
  vehicleId: string;
  startTime: string;
  endTime: string;
}) => {
  const { vehicleId, startTime, endTime } = input;
  const { start, end } = parseAndValidateTimeRange(startTime, endTime);

  const vehicle = getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error("NOT_FOUND: Vehicle not found");
  }

  return { vehicle, start, end };
};

function searchVehicles(input: {
  startTime: string;
  endTime: string;
  passengerCount: number;
  classifications: string[];
  makes: string[];
  priceMin: number;
  priceMax: number;
}) {
  const {
    startTime,
    endTime,
    passengerCount,
    classifications,
    makes,
    priceMin,
    priceMax,
  } = input;

  try {
    const { start, end } = parseAndValidateTimeRange(startTime, endTime);

    const availableVehicles = getAvailableVehicles({
      startTime: start,
      endTime: end,
      passengerCount,
      classifications,
      makes,
      priceMinDollars: priceMin,
      priceMaxDollars: priceMax,
    });

    return {
      vehicles: availableVehicles,
    };
  } catch (error) {
    console.error(error);
    return {
      vehicles: [],
    }
  }
}

export interface FilterOptions {
  makes: string[];
  classifications: string[];
  passengerCounts: number[];
}

function getFilterOptions(): FilterOptions {
  const allVehicles = getVehicles();

  const uniqueMakes = [...new Set(allVehicles.map((v) => v.make))].sort();
  const uniqueClassifications = [
    ...new Set(allVehicles.map((v) => v.classification)),
  ].sort();
  const uniquePassengerCounts = [
    ...new Set(allVehicles.map((v) => v.max_passengers)),
  ].sort((a, b) => a - b);

  return {
    makes: uniqueMakes,
    classifications: uniqueClassifications,
    passengerCounts: uniquePassengerCounts,
  };
}

function getVehicle(id: string) {
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    throw new Error("NOT_FOUND: Vehicle not found");
  }

  return vehicle;
}

function getReservation(id: string) {
  const reservation = getReservationById(id);
  if (!reservation) {
    throw new Error("NOT_FOUND: Reservation not found");
  }
  return reservation;
}

function getQuote(input: {
  vehicleId: string;
  startTime: string;
  endTime: string;
}) {
  const { vehicle, start, end } = validateReservationAndGetVehicle(input);
  return calculateTotalPrice(start, end, vehicle.hourly_rate_cents);
}

function browseVehicles(input: {
  passengerCount: number;
  classifications: string[];
  makes: string[];
  priceMin: number;
  priceMax: number;
}) {
  return filterVehiclesByCriteria({
    passengerCount: input.passengerCount,
    classifications: input.classifications,
    makes: input.makes,
    priceMinDollars: input.priceMin,
    priceMaxDollars: input.priceMax,
  });
}

export const API = {
  searchVehicles,
  browseVehicles,
  getFilterOptions,
  getVehicle,
  getReservation,
  getQuote,
};
