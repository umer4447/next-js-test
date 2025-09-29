import * as React from "react";

type Variant = "default" | "secondary" | "ghost" | "destructive" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  default:
    "bg-foreground text-background hover:opacity-90 disabled:opacity-60",
  secondary:
    "bg-black/[.06] dark:bg-white/[.08] text-foreground hover:bg-black/[.08] dark:hover:bg-white/[.1] disabled:opacity-60",
  ghost:
    "bg-transparent hover:bg-black/[.06] dark:hover:bg-white/[.06] disabled:opacity-60",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 disabled:opacity-60",
  outline:
    "border border-black/[.12] dark:border-white/[.16] bg-transparent text-foreground hover:bg-black/[.04] dark:hover:bg-white/[.06]",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded",
  md: "h-10 px-4 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium transition-colors ${variantClass[variant]} ${sizeClass[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";


