
declare module "kenat-ui" {
  import type { RefObject } from "react";

  export interface EthiopianDate {
    year: number;
    month: number;
    day: number;
  }

  export interface CalendarDay {
    ethiopian: EthiopianDate;
    holidays: unknown[];
  }

  export interface CalendarGrid {
    monthName: string;
    year: number;
  }

  export interface DatePickerState {
    selectedDate: EthiopianDate;
    formatted: string;
    open: boolean;
    grid: CalendarGrid | null;
    headers: string[];
    days: (CalendarDay | null)[];
    inputRef: RefObject<HTMLInputElement | null>;
  }

  export interface DatePickerActions {
    toggleOpen: () => void;
    close: () => void;
    selectDate: (day: CalendarDay) => void;
    nextMonth: () => void;
    prevMonth: () => void;
    nextYear: () => void;
    prevYear: () => void;
  }

  export function useDatePicker(): {
    state: DatePickerState;
    actions: DatePickerActions;
  };
}
