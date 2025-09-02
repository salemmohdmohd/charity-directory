import React from 'react';

/**
 * Simple Select Component with Bootstrap styling
 */
const Select = ({
  id,
  name,
  value,
  onChange,
  label,
  error,
  required = false,
  disabled = false,
  options = [],
  placeholder,
  className = '',
  ...rest
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const selectClasses = [
    'form-select',
    error && 'is-invalid',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className={selectClasses}
        required={required}
        disabled={disabled}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => {
          if (typeof option === 'string') {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          }
          return (
            <option key={option.value || index} value={option.value} disabled={option.disabled}>
              {option.label || option.value}
            </option>
          );
        })}
      </select>
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
};


export default Select;
