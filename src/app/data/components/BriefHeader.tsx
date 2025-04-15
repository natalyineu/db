import React from 'react';

interface BriefHeaderProps {
  existingBrief: any;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const BriefHeader: React.FC<BriefHeaderProps> = ({ 
  existingBrief, 
  isEditing, 
  onEdit, 
  onDelete 
}) => {
  const icons = {
    edit: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
        <h2 className="text-lg font-semibold">Your Brief</h2>
      </div>
      
      {existingBrief && !isEditing && (
        <div className="flex space-x-2">
          <button 
            onClick={onEdit}
            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 flex items-center gap-1 text-sm"
          >
            {icons.edit}
            <span>Edit Brief</span>
          </button>
          <button 
            onClick={onDelete}
            className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center gap-1 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Brief</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BriefHeader; 