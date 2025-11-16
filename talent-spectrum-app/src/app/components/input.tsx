import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, value, ...props }: React.ComponentProps<"input">) {
  // Extract value from props to handle controlled/uncontrolled component warning
  // If value prop is provided (even if undefined), ensure it's always a string to make it controlled
  // For file inputs, don't set value prop as they are always uncontrolled
  const inputProps: React.ComponentProps<"input"> = { ...props };
  
  if (type !== "file" && type !== "checkbox" && type !== "radio" && type !== "button" && type !== "submit" && type !== "reset" && type !== "image") {
    // If value is explicitly passed (including undefined), make it controlled
    if (value !== undefined) {
      inputProps.value = value ?? "";
    }
  }
  
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...inputProps}
    />
  );
}

export { Input };
