import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
  label?: string;
  description?: string;
}

/**
 * Checkbox Component
 *
 * A reusable checkbox with label, description and error state
 * Fully keyboard accessible (Space to toggle, Tab to navigate)
 *
 * @example
 * <Checkbox label="Accept terms" />
 * <Checkbox
 *   label="Top"
 *   description="Cette pratique m'intéresse en tant que top"
 * />
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, label, description, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              type="checkbox"
              id={checkboxId}
              className={cn(
                "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-red-500 focus:ring-red-500",
                className
              )}
              ref={ref}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${checkboxId}-error`
                  : description
                    ? `${checkboxId}-description`
                    : undefined
              }
              {...props}
            />
          </div>
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className="text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={`${checkboxId}-description`}
                  className="text-sm text-gray-500"
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${checkboxId}-error`}
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
Checkbox.displayName = "Checkbox";

export { Checkbox };
