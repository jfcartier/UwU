import React, { ReactNode } from 'react';

interface InlineFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

const InlineField: React.FC<InlineFieldProps> = ({ label, children, className = '' }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <label className="uppercase text-sm font-medium w-1/3 text-end">
        {label}
      </label>
      <div className="w-2/3">
        {children}
      </div>
    </div>
  );
};

export default InlineField;
