import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-semibold text-slate-400">{label}</label>}
      <select 
        className={`w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
