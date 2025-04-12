"use client";

import React, { useState } from 'react';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  helperText?: string;
  error?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = true,
  autoComplete = "current-password",
  helperText,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={`appearance-none block w-full px-3 py-2 border ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
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

export default PasswordField; 