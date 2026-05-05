"use client";

import { AdditionalFilters } from "@/components/search/AdditionalFilters.tsx";
import { FormValues } from "@/components/search/form.tsx";
import { TimeRangeFilters } from "@/components/search/TimeRangeFilters.tsx";
import { VehicleList } from "@/components/search/VehicleList.tsx";
import { ErrorFallback } from "@/components/shared/ErrorFallback";
import { Button } from "@/components/shared/ui/button";
import { Form } from "@/components/shared/ui/form";
import { Sheet, SheetContent, SheetTrigger } from "@/components/shared/ui/sheet";
import { roundToNearest30Minutes } from "@/lib/times.ts";
import { API } from "@/server/api";
import { addDays, addHours, format } from "date-fns";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";

export function SearchPage() {
  const [initialStartDateAndTime] = useState(() =>
    roundToNearest30Minutes(addHours(new Date(), 1)),
  );

  const [initialEndDateAndTime] = useState(() =>
    addDays(initialStartDateAndTime, 1),
  );

  const filterOptions = API.getFilterOptions();

  // Initialize form with default values
  const form = useForm<FormValues>({
    defaultValues: {
      startDate: initialStartDateAndTime,
      startTime: format(initialStartDateAndTime, "HH:mm"),
      endDate: initialEndDateAndTime,
      endTime: format(initialEndDateAndTime, "HH:mm"),
      minPassengers: 1,
      classification: filterOptions.classifications,
      make: filterOptions.makes,
      price: [10, 100],
    },
  });

  const filters = (
    <ErrorBoundary
      fallback={<ErrorFallback message="Failed to load filters" />}
    >
      <AdditionalFilters filterOptions={filterOptions} />
    </ErrorBoundary>
  );

  return (
    <Form {...form}>
      <div className="container mx-auto flex flex-col">
        <div className="grid grid-cols-12 grid-flow-row">
          <div className="pt-12 pb-4 border-b grid grid-cols-subgrid col-span-12 md:sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <div className="px-4 flex items-end col-span-12 md:col-span-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                Kaizen Wheels
              </h1>
            </div>
            <div className="px-4 col-span-12 md:col-span-9 mt-4 md:mt-0">
              <TimeRangeFilters />
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 px-4 md:py-8">
            <div className="md:hidden mt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Filters</Button>
                </SheetTrigger>
                <SheetContent>{filters}</SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:block">{filters}</div>
          </div>

          <div className="col-span-12 md:col-span-9 px-4 py-8">
            <ErrorBoundary
              fallback={<ErrorFallback message="Failed to load vehicles" />}
            >
              <VehicleList />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Form>
  );
}
