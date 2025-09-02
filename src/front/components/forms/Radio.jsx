import React from 'react';

/**
 * Simple Radio Component with Bootstrap styling
 */
const Radio = ({
  id,
  name,
  value,
  checked = false,
  onChange,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = [
    'form-check-input',
    error && 'is-invalid',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-check">
      <input
        type="radio"
        id={radioId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className={inputClasses}
        required={required}
        disabled={disabled}
        {...rest}
      />
      {label && (
        <label htmlFor={radioId} className="form-check-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      {error && (
        <div className="invalid-feedback d-block ps-4">
          {error}
        </div>
      )}
    </div>
  );
};


export { Radio };
export default Radio;
