import { DateTime } from "luxon";

export type Classification =
  | "Compact"
  | "SUV"
  | "Sports"
  | "Subcompact"
  | "Minivan"
  | "Luxury";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  doors: number;
  max_passengers: number;
  classification: Classification;
  thumbnail_url: string;
  hourly_rate_cents: number;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  start_time: DateTime;
  end_time: DateTime;
  total_price_cents: number;
}

export const VEHICLES: Vehicle[] = [
  {
    id: "1",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    doors: 4,
    max_passengers: 5,
    classification: "Compact",
    thumbnail_url: "/cars/corolla",
    hourly_rate_cents: 4500,
  },
  {
    id: "2",
    make: "Honda",
    model: "Civic",
    year: 2021,
    doors: 4,
    max_passengers: 5,
    classification: "Compact",
    thumbnail_url: "/cars/civic",
    hourly_rate_cents: 4200,
  },
  {
    id: "3",
    make: "Ford",
    model: "Mustang",
    year: 2022,
    doors: 2,
    max_passengers: 4,
    classification: "Sports",
    thumbnail_url: "/cars/mustang",
    hourly_rate_cents: 16000,
  },
  {
    id: "4",
    make: "Chevrolet",
    model: "Spark",
    year: 2020,
    doors: 4,
    max_passengers: 4,
    classification: "Subcompact",
    thumbnail_url: "/cars/spark",
    hourly_rate_cents: 3200,
  },
  {
    id: "5",
    make: "Nissan",
    model: "Rogue",
    year: 2021,
    doors: 5,
    max_passengers: 5,
    classification: "SUV",
    thumbnail_url: "/cars/rogue",
    hourly_rate_cents: 5800,
  },
  {
    id: "6",
    make: "Hyundai",
    model: "Santa Fe",
    year: 2022,
    doors: 5,
    max_passengers: 7,
    classification: "SUV",
    thumbnail_url: "/cars/santafe",
    hourly_rate_cents: 7200,
  },
  {
    id: "7",
    make: "Volkswagen",
    model: "Golf",
    year: 2023,
    doors: 5,
    max_passengers: 5,
    classification: "Compact",
    thumbnail_url: "/cars/golf",
    hourly_rate_cents: 5600,
  },
  {
    id: "8",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2024,
    doors: 4,
    max_passengers: 5,
    classification: "Luxury",
    thumbnail_url: "/cars/cclass",
    hourly_rate_cents: 22000,
  },
  {
    id: "9",
    make: "BMW",
    model: "X5",
    year: 2024,
    doors: 4,
    max_passengers: 5,
    classification: "SUV",
    thumbnail_url: "/cars/x5",
    hourly_rate_cents: 17000,
  },
  {
    id: "10",
    make: "Mazda",
    model: "CX-9",
    year: 2024,
    doors: 5,
    max_passengers: 7,
    classification: "SUV",
    thumbnail_url: "/cars/cx9",
    hourly_rate_cents: 7000,
  },
  {
    id: "11",
    make: "Chrysler",
    model: "Pacifica",
    year: 2024,
    doors: 5,
    max_passengers: 8,
    classification: "Minivan",
    thumbnail_url: "/cars/pacifica",
    hourly_rate_cents: 8000,
  },
  {
    id: "12",
    make: "Jeep",
    model: "Wrangler",
    year: 2021,
    doors: 4,
    max_passengers: 5,
    classification: "SUV",
    thumbnail_url: "/cars/wrangler",
    hourly_rate_cents: 8500,
  },
];

const TODAY = DateTime.now().startOf("day");

export const RESERVATIONS: Reservation[] = [
  {
    id: "1",
    vehicle_id: "1",
    start_time: TODAY,
    end_time: TODAY.plus({ days: 2 }),
    total_price_cents: 1000,
  },
  {
    id: "2",
    vehicle_id: "2",
    start_time: TODAY.plus({ days: 1 }),
    end_time: TODAY.plus({ days: 4 }),
    total_price_cents: 1500,
  },
  {
    id: "3",
    vehicle_id: "3",
    start_time: TODAY.plus({ days: 2 }),
    end_time: TODAY.plus({ days: 5 }),
    total_price_cents: 2000,
  },
  {
    id: "4",
    vehicle_id: "4",
    start_time: TODAY.minus({ days: 3 }),
    end_time: TODAY.plus({ days: 2 }),
    total_price_cents: 1200,
  },
  {
    id: "5",
    vehicle_id: "6",
    start_time: TODAY.plus({ days: 7 }),
    end_time: TODAY.plus({ days: 9 }),
    total_price_cents: 1800,
  },
  {
    id: "6",
    vehicle_id: "4",
    start_time: TODAY.plus({ days: 10 }),
    end_time: TODAY.plus({ days: 12 }),
    total_price_cents: 2200,
  },
  {
    id: "7",
    vehicle_id: "3",
    start_time: TODAY.plus({ days: 13 }),
    end_time: TODAY.plus({ days: 15 }),
    total_price_cents: 2600,
  },
  {
    id: "8",
    vehicle_id: "9",
    start_time: TODAY,
    end_time: TODAY.plus({ days: 2 }),
    total_price_cents: 3000,
  },
  {
    id: "9",
    vehicle_id: "7",
    start_time: TODAY.plus({ days: 10 }),
    end_time: TODAY.plus({ days: 12 }),
    total_price_cents: 3000,
  },
];

export const RESERVATIONS_BY_VEHICLE_ID = RESERVATIONS.reduce(
  (acc, reservation) => {
    const vehicleId = reservation.vehicle_id;

    if (!acc[vehicleId]) {
      acc[vehicleId] = [];
    }

    acc[vehicleId].push(reservation);

    return acc;
  },
  {} as Record<string, Reservation[]>,
);
