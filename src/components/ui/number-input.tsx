import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
  label?: string;
  min?: number;
  max?: number;
}

/**
 * NumberInput Component
 *
 * A reusable number input field with label and error state
 * Supports keyboard navigation (Arrow Up/Down to increment/decrement)
 *
 * @example
 * <NumberInput label="Score" min={1} max={4} />
 * <NumberInput label="Age" min={18} max={100} error="Age is required" />
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, error, label, id, min, max, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          type="number"
          id={inputId}
          min={min}
          max={max}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
