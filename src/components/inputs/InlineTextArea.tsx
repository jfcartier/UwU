import React from 'react';

interface InlineTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

const InlineTextArea: React.FC<InlineTextAreaProps> = ({ label, name, value, onChange, rows = 3 }) => {
  return (
    <div className="flex items-start space-x-3">
      <label htmlFor={name} className="text-slate-400 uppercase text-sm text-end font-medium w-1/3 pt-2">
        {label}
      </label>      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
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

export default InlineTextArea;
