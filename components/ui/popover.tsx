"use client";
import * as React from "react";

export function Popover({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

export function PopoverTrigger({ children }: { children: React.ReactNode }) {
  return <div className="inline-block">{children}</div>;
}

export function PopoverContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`absolute z-50 mt-2 min-w-[200px] rounded-md border border-black/[.08] dark:border-white/[.145] bg-background p-3 shadow-lg ${className}`}>
      {children}
    </div>
  );
}


