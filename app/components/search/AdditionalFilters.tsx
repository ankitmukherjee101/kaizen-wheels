import { FormValues } from "@/components/search/form.tsx";
import { Button } from "@/components/shared/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shared/ui/form";
import { RangeSlider, Slider } from "@/components/shared/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/shared/ui/toggle-group";
import { formatDollars } from "@/lib/formatters.tsx";
import { FilterOptions } from "@/server/api";
import { useFormContext } from "react-hook-form";

export function AdditionalFilters({ filterOptions }: { filterOptions: FilterOptions }) {
  const form = useFormContext<FormValues>();

  const price = form.watch("price");
  const minPrice = price[0];
  const maxPrice = price[1];

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-semibold">Filters</h3>
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <div className="flex w-full items-baseline justify-between mb-4">
              <FormLabel>Price</FormLabel>
              <div className="text-sm">
                {formatDollars(minPrice)} to{" "}
                {maxPrice === 100 ? "$100+" : formatDollars(maxPrice)}
              </div>
            </div>
            <FormControl>
              <RangeSlider
                min={10}
                max={100}
                step={10}
                value={field.value}
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="minPassengers"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <div className="flex w-full items-baseline justify-between mb-4">
              <FormLabel>Passengers</FormLabel>
              <div className="text-sm">{field.value}</div>
            </div>
            <FormControl>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="classification"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Class</FormLabel>
            <FormControl>
              <ToggleGroup
                type="multiple"
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-wrap justify-start"
              >
                {filterOptions.classifications.map((classification) => (
                  <FormItem key={classification}>
                    <FormControl>
                      <ToggleGroupItem variant="outline" value={classification}>
                        {classification}
                      </ToggleGroupItem>
                    </FormControl>
                  </FormItem>
                ))}
              </ToggleGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="make"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Make</FormLabel>
            <FormControl>
              <ToggleGroup
                type="multiple"
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-wrap justify-start"
              >
                { filterOptions.makes.map((make) => (
                  <FormItem key={make}>
                    <FormControl>
                      <ToggleGroupItem variant="outline" value={make}>
                        {make}
                      </ToggleGroupItem>
                    </FormControl>
                  </FormItem>
                ))}
              </ToggleGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          form.reset();
        }}
        className="mt-4"
        disabled={
          form.getValues().minPassengers === 1 &&
          form.getValues().make === undefined &&
          form.getValues().price[0] === 10 &&
          form.getValues().price[1] === 100
        }
      >
        Reset all
      </Button>
    </div>
  );
}
