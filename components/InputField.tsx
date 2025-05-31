
import React from 'react';
import CalendarIcon from './icons/CalendarIcon'; // Import the new icon

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  disabled?: boolean;
  datalistId?: string; // For associating with a <datalist>
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  disabled = false,
  datalistId,
}) => {
  const isDateType = type === 'date';

  return (
    <div>
      <label htmlFor={name} className="block text-sm text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative"> {/* Wrapper for icon positioning if needed */}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          list={datalistId} // Associate with datalist
          className={`mt-1 block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm text-gray-800 placeholder-slate-400
                     focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                     disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                     invalid:border-pink-500 invalid:text-pink-600
                     focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                     ${isDateType ? 'pr-10' : ''}` // Add padding-right if date type for icon space, adjusted for larger icon area
                    }
        />
        {isDateType && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;