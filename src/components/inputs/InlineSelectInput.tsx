import React from 'react';

interface InlineSelectInputProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const InlineSelectInput: React.FC<InlineSelectInputProps> = ({ label, name, value, options, onChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <label htmlFor={name} className="text-slate-400 uppercase text-sm text-end font-medium w-1/3">
        {label}
      </label>      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={[
          "w-2/3",
          "bg-transparent",
          "border-b",
          "border-gray-400",
          "px-2",
          "py-1",
          "focus:outline-none",
          "focus:border-purple-500",
          "transition-colors",
          "duration-200",
          "dark:bg-gray-800",
          "dark:text-white"
        ].join(" ")}
      >
        <option value="" disabled>
          Sélectionnez...
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="dark:bg-gray-800 dark:text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InlineSelectInput;
