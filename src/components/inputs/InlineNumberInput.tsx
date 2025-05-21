import React from 'react';

interface InlineNumberInputProps {
  label: string;
  name: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const InlineNumberInput: React.FC<InlineNumberInputProps> = ({ label, name, value, onChange, placeholder = '' }) => {
  return (
    <div className="flex items-center space-x-3">
      <label htmlFor={name} className="text-slate-400 uppercase text-sm text-end font-medium w-1/3">
        {label}
      </label>      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "w-2/3",
          "dark:bg-gray-800",
          "bg-transparent",
          "border-b",
          "border-gray-400",
          "px-2",
          "py-1",
          "focus:outline-none",
          "focus:border-purple-500",
          "transition-colors",
          "duration-200"
        ].join(" ")}
      />
    </div>
  );
};

export default InlineNumberInput;
