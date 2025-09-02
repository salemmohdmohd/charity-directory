import React from 'react';

/**
 * Simple Button Component with Bootstrap styling
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  outline = false,
  disabled = false,
  loading = false,
  loadingText,
  className = '',
  onClick,
  ...rest
}) => {
  // Build button classes
  const buttonClasses = [
    'btn',
    outline ? `btn-outline-${variant}` : `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    loading && 'disabled',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...rest}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

export { Button };
export default Button;
