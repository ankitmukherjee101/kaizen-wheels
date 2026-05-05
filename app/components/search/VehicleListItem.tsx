import { DiscountBadge } from "@/components/shared/DiscountBadge";
import { formatCents } from "@/lib/formatters";
import { API } from "@/server/api";
import { Vehicle } from "@/server/data";
import { useBase64Image } from "@/util/useBase64Image";
import Link from "next/link";
import { Button } from "@/components/shared/ui/button";
import { Card, CardTitle } from "@/components/shared/ui/card";

export function VehicleListItem({
  vehicle,
  startDateTime,
  endDateTime,
  showTripEstimate,
}: {
  vehicle: Vehicle;
  startDateTime: Date;
  endDateTime: Date;
  showTripEstimate: boolean;
}) {
  const quote = showTripEstimate
    ? API.getQuote({
        vehicleId: vehicle.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      })
    : null;

  const reviewHref =
    showTripEstimate &&
    Number.isFinite(startDateTime.getTime()) &&
    Number.isFinite(endDateTime.getTime())
      ? `/review?${new URLSearchParams({
          id: vehicle.id,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
        }).toString()}`
      : null;

  const imgData = useBase64Image(vehicle.thumbnail_url);

  return (
    <Card
      key={vehicle.id}
      className="flex flex-col md:flex-row gap-6 md:gap-8 px-4 md:px-6 py-6"
    >
      <div className="max-w-[8rem] flex items-center mx-auto md:mx-0">
        <img src={imgData} alt={vehicle.make} className="w-full" />
      </div>
      <div className="w-full flex flex-col justify-center gap-2 lg:gap-4">
        <CardTitle className="text-lg font-semibold text-center md:text-left">
          {vehicle.make} {vehicle.model}
        </CardTitle>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-center md:text-left">
          <div className="flex flex-col">
            <dt className="text-sm text-gray-600">Year</dt>
            <dd className="text-sm font-medium">{vehicle.year}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-gray-600">Class</dt>
            <dd className="text-sm font-medium">{vehicle.classification}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-gray-600">Passengers</dt>
            <dd className="text-sm font-medium">{vehicle.max_passengers}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-gray-600">Doors</dt>
            <dd className="text-sm font-medium">{vehicle.doors}</dd>
          </div>
        </dl>
      </div>
      <div className="md:ml-auto text-center md:text-right flex flex-col justify-center mt-4 md:mt-0 min-w-[11rem]">
        {quote ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Est. trip total</p>
            <div className="text-xl font-bold tracking-tight">
              {quote.appliedDiscount !== "none" ? (
                <span className="flex flex-col items-end gap-1.5 sm:items-end">
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="text-base text-gray-500 line-through font-normal">
                      {formatCents(quote.baseTotalCents)}
                    </span>
                    <span>{formatCents(quote.totalPriceCents)}</span>
                  </span>
                  <DiscountBadge discount={quote.appliedDiscount} />
                </span>
              ) : (
                formatCents(quote.totalPriceCents)
              )}
            </div>
          </div>
        ) : (
          <p className="text-xl font-bold">
            {formatCents(vehicle.hourly_rate_cents)}
            <span className="text-sm text-gray-700 font-normal ml-0.5">/hr</span>
          </p>
        )}
        {reviewHref ? (
          <Button asChild className="mt-2 w-full sm:w-auto">
            <Link href={reviewHref}>Book now</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full sm:w-auto cursor-not-allowed"
            disabled
            title="Select valid pick-up and drop-off times to book"
          >
            Book now
          </Button>
        )}
      </div>
    </Card>
  );
}
