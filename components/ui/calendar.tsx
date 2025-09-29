"use client";
import * as React from "react";

export interface CalendarProps {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
}

export function Calendar({ selected, onSelect }: CalendarProps) {
  // Minimal calendar: use native date input under the hood for demo purposes
  const [value, setValue] = React.useState<string>(selected ? new Date(selected).toISOString().slice(0, 10) : "");
  React.useEffect(() => {
    setValue(selected ? new Date(selected).toISOString().slice(0, 10) : "");
  }, [selected]);

  return (
    <input
      type="date"
      className="px-3 py-2 rounded-md border border-black/[.08] dark:border-white/[.145] bg-transparent"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onSelect?.(e.target.value ? new Date(e.target.value) : undefined);
      }}
    />
  );
}


