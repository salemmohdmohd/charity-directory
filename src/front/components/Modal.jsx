import React, { useEffect } from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer';

/**
 * Simple Modal Component with Global State
 */
const Modal = ({
  modalKey, // Key to identify which modal in global state
  title,
  children,
  className = ''
}) => {
  const { store, dispatch } = useGlobalReducer();

  const isOpen = store.modals[modalKey] || false;

  const onClose = () => {
    dispatch({
      type: 'TOGGLE_MODAL',
      payload: modalKey
    });
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className={`modal d-block ${className}`}
        tabIndex={-1}
        role="dialog"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            {title && (
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>
            )}
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export { Modal };
export default Modal;
