import { combineDateTime, FormValues } from "@/components/search/form.tsx";
import { API } from "@/server/api";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { VehicleListItem } from "./VehicleListItem";

export function VehicleList() {
  const form = useFormContext<FormValues>();
  const startDate = form.watch("startDate");
  const startTime = form.watch("startTime");
  const endDate = form.watch("endDate");
  const endTime = form.watch("endTime");
  const minPassengers = form.watch("minPassengers");
  const classifications = form.watch("classification");
  const makes = form.watch("make");
  const price = form.watch("price");

  const startDateTime = useMemo(
    () => combineDateTime(startDate, startTime),
    [startDate, startTime],
  );
  const endDateTime = useMemo(
    () => combineDateTime(endDate, endTime),
    [endDate, endTime],
  );

  const searchResponse = API.searchVehicles({
    startTime: startDateTime.toISOString(),
    endTime: endDateTime.toISOString(),
    passengerCount: Number(minPassengers),
    classifications,
    makes,
    priceMin: price[0],
    priceMax: price[1],
  });

  if (searchResponse.vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-muted-foreground">
          No vehicles found. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-4">
        {searchResponse.vehicles.map((vehicle) => (
          <VehicleListItem
            key={vehicle.id}
            vehicle={vehicle}
            startDateTime={startDateTime}
            endDateTime={endDateTime}
          />
        ))}
      </ul>
    </div>
  );
}
