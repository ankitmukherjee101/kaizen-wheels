import type { QuoteDiscount } from "@/server/api";

const COPY: Record<Exclude<QuoteDiscount, "none">, { short: string; title: string }> =
  {
    holiday: {
      short: "Holiday",
      title: "17% off — your trip includes a promotional holiday date between pick-up and drop-off",
    },
    duration: {
      short: "Long rental",
      title: "$10/hr off the list rate — rental is longer than 72 hours",
    },
  };

export function DiscountBadge({ discount }: { discount: QuoteDiscount }) {
  if (discount === "none") {
    return null;
  }
  const { short, title } = COPY[discount];
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-md border border-emerald-200/90 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-emerald-900"
    >
      {short}
    </span>
  );
}
