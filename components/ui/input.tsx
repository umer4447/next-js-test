import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        suppressHydrationWarning
        className={`w-full px-3 py-2 rounded-md border border-black/[.08] dark:border-white/[.145] bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";


