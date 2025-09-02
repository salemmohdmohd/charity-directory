import React from 'react';

/**
 * Simple Checkbox Component with Bootstrap styling
 */
const Checkbox = ({
  id,
  name,
  checked = false,
  onChange,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = [
    'form-check-input',
    error && 'is-invalid',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="mb-3">
      <div className="form-check">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          className={inputClasses}
          required={required}
          disabled={disabled}
          {...rest}
        />
        {label && (
          <label htmlFor={checkboxId} className="form-check-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
      </div>
      {error && (
        <div className="invalid-feedback d-block ps-4">
          {error}
        </div>
      )}
    </div>
  );
};


export default Checkbox;
