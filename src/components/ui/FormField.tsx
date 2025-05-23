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
    // Support both direct value and event callbacks
    onChange(e.target.value);
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
          style={{ backgroundColor: 'white' }}
          className={`appearance-none block w-full px-3 py-2 border ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm
          bg-white text-gray-900`}
          placeholder={placeholder}
        />
        {type === 'password' && showTogglePassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-600 hover:text-gray-800"
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