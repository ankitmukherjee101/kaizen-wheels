/**
 * Hourly rate filter bounds for the search UI and `API.searchVehicles`.
 * Increase MAX when the fleet includes vehicles priced above this ceiling,
 * so users can still include those rates without hacking form values.
 */
export const PRICE_FILTER_MIN_DOLLARS = 10;
export const PRICE_FILTER_MAX_DOLLARS = 300;
export const PRICE_FILTER_STEP_DOLLARS = 10;
