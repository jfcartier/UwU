import React from 'react';

interface NumberInputProps {
  label: string;
  name: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, name, value, onChange }) => {
  return (
    <div className="relative">
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder=" "
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-500"
      >
        {label}
      </label>
    </div>
  );
};

export default NumberInput;
