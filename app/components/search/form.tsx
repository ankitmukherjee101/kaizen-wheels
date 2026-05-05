export interface FormValues {
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  price: [number, number];
  minPassengers: number;
  make: string[];
  classification: string[];
}

export const combineDateTime = (date: Date | undefined, time: string | undefined) => {
  if (!date || time == null || time === "") {
    return new Date(NaN);
  }
  const [hoursStr, minutesStr] = time.split(":");
  const hours = parseInt(hoursStr ?? "", 10);
  const minutes = parseInt(minutesStr ?? "", 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return new Date(NaN);
  }
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);
  return combinedDate;
};
