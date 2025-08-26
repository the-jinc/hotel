import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}) {
  // If the dialog is not open, render nothing.
  if (!isOpen) return null;

  // Function to handle confirmation and close the dialog
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  // Determine the confirm button's classes based on whether it's a destructive action.
  const confirmButtonClasses = isDestructive
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  return (
    // Modal overlay - click outside to close
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 modal-overlay flex justify-center items-center z-[1000] p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      {/* Modal content container - stop propagation to prevent clicking the backdrop */}
      <div
        className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm scale-95 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        {/* Close button inside the modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close dialog"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-shrink-0">
            {isDestructive ? (
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" aria-hidden="true" />
            ) : (
              // You can use a different icon here for non-destructive actions if needed
              <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 id="dialog-title" className="text-xl font-bold text-gray-900">
              {title}
            </h3>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="mt-2 mb-6">
          <p id="dialog-message" className="text-sm text-gray-500">
            {message}
          </p>
        </div>

        {/* Dialog Footer with action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-semibold bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-200"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${confirmButtonClasses} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
