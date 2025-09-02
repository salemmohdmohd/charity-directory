import React from 'react';

/**
 * Simple TextArea Component with Bootstrap styling
 */
const TextArea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  ...rest
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const textareaClasses = [
    'form-control',
    error && 'is-invalid',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={textareaClasses}
        required={required}
        disabled={disabled}
        rows={rows}
        {...rest}
      />
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
};


export default TextArea;
