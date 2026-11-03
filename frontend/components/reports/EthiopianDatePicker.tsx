
"use client";

import { useDatePicker } from "kenat-ui";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function EthiopianDatePicker({
  label,
  value,
  onChange,
}: Props) {
  const { state, actions } = useDatePicker();

  return (
    <div className="relative text-sm">
      <label className="mb-2 block font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        readOnly
        ref={state.inputRef}
        value={value || ""}
        onClick={actions.toggleOpen}
        placeholder="Select Ethiopian date"
        className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-2.5 outline-none focus:border-[#00AB4E] focus:ring-2 focus:ring-[#00AB4E]/20"
      />

      {state.open && state.grid && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">

          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={actions.prevMonth}
              className="rounded-lg px-3 py-1 hover:bg-slate-100"
            >
              ←
            </button>

            <span className="font-semibold text-[#092c45]">
              {state.grid.monthName} {state.grid.year}
            </span>

            <button
              type="button"
              onClick={actions.nextMonth}
              className="rounded-lg px-3 py-1 hover:bg-slate-100"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {state.headers.map((header, index) => (
              <div
                key={`${header}-${index}`}
                className="py-2 text-xs font-semibold text-slate-500"
              >
                {header.slice(0, 2)}
              </div>
            ))}

            {state.days.map((day, index) => {
              if (!day) {
                return <div key={index} />;
              }

              const selectedDate =
                `${day.ethiopian.year}/${String(day.ethiopian.month).padStart(2, "0")}/${String(day.ethiopian.day).padStart(2, "0")}`;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(selectedDate);
                    actions.selectDate(day);
                  }}
                  className={`rounded-lg py-2 transition hover:bg-[#E6F7ED] hover:text-[#009644] ${
                    value === selectedDate
                      ? "bg-[#00AB4E] text-white"
                      : "text-slate-700"
                  }`}
                >
                  {day.ethiopian.day}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={actions.close}
            className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
