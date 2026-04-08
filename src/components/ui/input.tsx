import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-bryant-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-xl border px-3.5 py-2.5 text-sm text-bryant-gray-900 placeholder:text-bryant-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
            error
              ? "border-error focus:ring-error"
              : "border-bryant-gray-300 focus:border-bryant-gold focus:ring-bryant-gold"
          } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
