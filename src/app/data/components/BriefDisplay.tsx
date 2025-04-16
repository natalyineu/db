import React from 'react';

interface BriefDisplayProps {
  brief: {
    platforms?: string[];
    target_audience?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    type?: string;
    description?: string;
  };
}

const BriefDisplay: React.FC<BriefDisplayProps> = ({ brief }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Landing Page URL:</h3>
        <p className="mt-0.5 break-all">
          <a 
            href={brief.platforms?.[0]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            {brief.platforms?.[0]}
          </a>
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Target Audience:</h3>
        <p className="mt-0.5">{brief.target_audience || "Not specified"}</p>
      </div>
      
      {brief.platforms?.[1] && (
        <div>
          <h3 className="text-sm font-medium text-gray-500">Creatives Link:</h3>
          <p className="mt-0.5 break-all">
            <a 
              href={brief.platforms?.[1]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              {brief.platforms?.[1]}
            </a>
          </p>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Location:</h3>
        <p className="mt-0.5">{brief.location || "Not specified"}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Campaign Period:</h3>
        <p className="mt-0.5">
          {brief.start_date ? new Date(brief.start_date).toLocaleDateString() : "Not specified"} - {brief.end_date ? new Date(brief.end_date).toLocaleDateString() : "Not specified"} 
          <span className="text-xs text-gray-500 ml-1">(30 days)</span>
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Goal:</h3>
        <p className="mt-0.5 capitalize">{brief.type || "Awareness"}</p>
      </div>
      
      {brief.description && (
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Additional Notes:</h3>
          <p className="mt-0.5">{brief.description}</p>
        </div>
      )}
    </div>
  );
};

export default BriefDisplay; 