import React from 'react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ 
  isOpen, 
  onCancel, 
  onConfirm 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete this brief? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog; 