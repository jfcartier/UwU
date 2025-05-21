import React, { useState } from 'react';

interface InlineTagInputProps {
  label: string;
  name: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const InlineTagInput: React.FC<InlineTagInputProps> = ({ label, name, value, onChange, placeholder = '' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="flex items-start space-x-3">
      <label htmlFor={name} className="text-slate-400 uppercase text-sm text-end font-medium w-1/3 pt-2">
        {label}
      </label>
      <div className="w-2/3">
        <div className={[
          "flex",
          "flex-wrap",
          "gap-2",
          "py-1",
          "px-2",
          "border-b",
          "border-gray-400", 
          "min-h-[44px]",
          "mb-1",
          "focus-within:border-purple-500",
          "transition-colors",
          "duration-200"
        ].join(" ")}>
          {value.map(tag => (
            <span key={tag} className={[
              "flex",
              "items-center",
              "bg-purple-100",
              "text-purple-800", 
              "text-sm",
              "rounded-full",
              "px-2",
              "py-1"
            ].join(" ")}>
              {tag}
              <button
                type="button"
                className={[
                  "ml-2",
                  "text-purple-500",
                  "hover:text-purple-700",
                  "font-bold"
                ].join(" ")}
                onClick={() => removeTag(tag)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            id={name}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={[
              "flex-grow",
              "border-0",
              "focus:ring-0", 
              "focus:outline-none",
              "min-w-[120px]",
              "p-0",
              "text-sm",
              "bg-transparent"
            ].join(" ")}
          />
        </div>
        <div className="text-xs text-gray-500">
          Appuyez sur Entrée pour ajouter un tag
        </div>
      </div>
    </div>
  );
};

export default InlineTagInput;