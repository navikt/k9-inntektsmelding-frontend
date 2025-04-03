/**
 * Checks if a date is within a range of two dates (inclusive)
 * @param date The date to check
 * @param startDate The start date of the range
 * @param endDate The end date of the range
 * @returns boolean indicating if the date is within the range
 */
export function isDateWithinRange(
  date: Date,
  startDate: Date,
  endDate: Date,
): boolean {
  return (
    (date > startDate || isSameDate(date, startDate)) &&
    (date < endDate || isSameDate(date, endDate))
  );
}

/**
 * Checks if two dates are the same (comparing year, month, and day)
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns boolean indicating if the dates are the same
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export const dagerTilPerioder = (
  dager: string[] = [],
): { fom: string; tom: string }[] => {
  if (dager.length === 0) return [];

  // Sort dates in ascending order and normalize to UTC midnight
  const sortedDager = [...dager]
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());

  const perioder: { fom: string; tom: string }[] = [];
  let currentPeriod = {
    fom: sortedDager[0].toISOString().split("T")[0],
    tom: sortedDager[0].toISOString().split("T")[0],
  };

  for (let i = 1; i < sortedDager.length; i++) {
    const currentDate = sortedDager[i];
    const previousDate = sortedDager[i - 1];

    // Check if dates are consecutive by comparing UTC dates
    const diffInDays =
      (currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000);

    if (diffInDays === 1) {
      // Extend current period
      currentPeriod.tom = currentDate.toISOString().split("T")[0];
    } else {
      // Save current period and start a new one
      perioder.push(currentPeriod);
      currentPeriod = {
        fom: currentDate.toISOString().split("T")[0],
        tom: currentDate.toISOString().split("T")[0],
      };
    }
  }

  // Add the last period
  perioder.push(currentPeriod);

  return perioder;
};

export const periodeTilDager = (periode: { fom: string; tom: string }) => {
  const fom = new Date(periode.fom);
  const tom = new Date(periode.tom);
  const dager = [];
  for (let i = 0; i < tom.getTime() - fom.getTime(); i += 24 * 60 * 60 * 1000) {
    dager.push(new Date(fom.getTime() + i));
  }
  return dager;
};
