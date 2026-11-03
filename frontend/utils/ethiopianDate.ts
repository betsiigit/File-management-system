
import { toEC, toGC } from "kenat";

export type EthiopianDate = {
  year: number;
  month: number;
  day: number;
};

const ETHIOPIAN_MONTHS = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

/**
 * Converts an Ethiopian date (YYYY/MM/DD)
 * into a Gregorian date (YYYY-MM-DD).
 */
export function ethiopianToGregorian(date: string): string {
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(date);

  if (!match) {
    throw new Error("Invalid Ethiopian date format. Use YYYY/MM/DD.");
  }

  const [, yearText, monthText, dayText] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    year <= 0 ||
    month < 1 ||
    month > 13 ||
    day < 1 ||
    day > 30
  ) {
    throw new Error("Invalid Ethiopian date.");
  }

  const gregorian = toGC(year, month, day);

  // Verify that the conversion represents a real Ethiopian date.
  const check = toEC(
    gregorian.year,
    gregorian.month,
    gregorian.day
  );

  if (
    check.year !== year ||
    check.month !== month ||
    check.day !== day
  ) {
    throw new Error("Invalid Ethiopian date.");
  }

  return [
    gregorian.year,
    String(gregorian.month).padStart(2, "0"),
    String(gregorian.day).padStart(2, "0"),
  ].join("-");
}

/**
 * Converts a Gregorian date into an Ethiopian date.
 * Accepts YYYY-MM-DD or an ISO datetime string.
 */
export function gregorianToEthiopian(date: string): EthiopianDate {
  const datePart = date.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) {
    throw new Error("Invalid Gregorian date.");
  }

  const [, yearText, monthText, dayText] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("Invalid Gregorian date.");
  }

  const result = toEC(year, month, day);

  return {
    year: result.year,
    month: result.month,
    day: result.day,
  };
}

/**
 * Formats an Ethiopian date as YYYY/MM/DD.
 */
export function formatEthiopianNumeric(date: EthiopianDate): string {
  return [
    date.year,
    String(date.month).padStart(2, "0"),
    String(date.day).padStart(2, "0"),
  ].join("/");
}

/**
 * Formats an Ethiopian date as Meskerem 1, 2017.
 */
export function formatEthiopianDate(date: EthiopianDate): string {
  const monthName = ETHIOPIAN_MONTHS[date.month - 1];

  if (!monthName) {
    throw new Error("Invalid Ethiopian month.");
  }

  return `${monthName} ${date.day}, ${date.year}`;
}

/**
 * Converts a Gregorian date into a readable Ethiopian date.
 */
export function formatGregorianAsEthiopian(date: string): string {
  return formatEthiopianDate(gregorianToEthiopian(date));
}
