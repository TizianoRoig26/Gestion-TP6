import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 border rounded-input bg-surface text-text-primary
            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
            disabled:bg-surface-secondary disabled:text-text-tertiary
            ${
               error
                ? "border-danger-200 focus:ring-danger-400"
                : "border-border-default"
            }
            ${className}
          `.trim()}
          {...props}
        />
        {error && (
          <p className="text-sm text-danger-600">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
