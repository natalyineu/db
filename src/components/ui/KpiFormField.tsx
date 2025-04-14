import React from 'react';

interface KpiFormFieldProps {
  title: string;
  planName: string;
  planValue: number;
  factName: string;
  factValue: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const KpiFormField = ({
  title,
  planName,
  planValue,
  factName,
  factValue,
  onChange
}: KpiFormFieldProps) => {
  return (
    <div>
      <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={planName} className="block text-xs text-gray-500">
            Plan
          </label>
          <input
            type="number"
            id={planName}
            name={planName}
            value={planValue}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor={factName} className="block text-xs text-gray-500">
            Fact
          </label>
          <input
            type="number"
            id={factName}
            name={factName}
            value={factValue}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default KpiFormField; 