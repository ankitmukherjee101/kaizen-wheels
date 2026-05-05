import {
  HOLIDAY_DISCOUNT_LABEL,
  LONG_TERM_RENTAL_DISCOUNT_LABEL,
} from "@/config/constants";

const BADGE_TITLES: Record<string, string> = {
  [HOLIDAY_DISCOUNT_LABEL]:
    "17% off — your trip includes a promotional holiday date between pick-up and drop-off (excluding those days).",
  [LONG_TERM_RENTAL_DISCOUNT_LABEL]:
    "$10/hr off the list rate — rental is longer than 72 hours.",
};

function titleForLabel(label: string) {
  return BADGE_TITLES[label] ?? label;
}

export function DiscountBadge({ label }: { label: string | null }) {
  if (!label) {
    return null;
  }
  return (
    <span
      title={titleForLabel(label)}
      className="inline-flex max-w-full items-center rounded-md border border-emerald-200/90 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-emerald-900"
    >
      {label}
    </span>
  );
}
