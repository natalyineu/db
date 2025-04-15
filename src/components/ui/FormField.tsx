"use client";

import React, { useState } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  helperText?: string;
  error?: string;
  showTogglePassword?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  helperText,
  error,
  showTogglePassword = type === 'password'
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the actual input type
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Handle onChange properly for both function signatures
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange === 'function') {
      if (onChange.length === 1) {
        // If it accepts a string directly (like from FormInput)
        (onChange as (value: string) => void)(e.target.value);
      } else {
        // If it accepts the event (original behavior)
        onChange(e);
      }
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={id}
          type={inputType}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={handleChange}
          className={`appearance-none block w-full px-3 py-2 border ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
          placeholder={placeholder}
        />
        {type === 'password' && showTogglePassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField; 