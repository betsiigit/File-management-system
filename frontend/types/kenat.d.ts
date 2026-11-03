
declare module "kenat" {
  export interface EthiopianDate {
    year: number;
    month: number;
    day: number;
  }

  export function toEC(
    year: number,
    month: number,
    day: number
  ): EthiopianDate;

  export function toGC(
    year: number,
    month: number,
    day: number
  ): EthiopianDate;

  export const monthNames: string[];

  export function toGeez(value: number): string;
  export function toArabic(value: number): string;
}
