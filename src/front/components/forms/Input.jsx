import React from 'react';

/**
 * Simple Input Component with Bootstrap styling
 */
const Input = ({
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  helpText,
  ...rest
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = [
    'form-control',
    error && 'is-invalid',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
        disabled={disabled}
        {...rest}
      />
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
      {helpText && !error && (
        <small className="form-text text-muted">
          {helpText}
        </small>
      )}
    </div>
  );
};


export default Input;
