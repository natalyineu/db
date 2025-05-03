import React from 'react';
import { Brief } from '@/types';
import BriefList from '@/components/ui/BriefList';

interface BriefListProps {
  briefs: Brief[];
  isLoading: boolean;
  onSelect: (brief: Brief) => void;
  onDelete: (briefId: string) => Promise<void>;
  onView: (briefId: string) => void;
}

/**
 * Feature-specific wrapper around the shared BriefList component
 */
const FeatureBriefList: React.FC<BriefListProps> = ({
  briefs,
  isLoading,
  onSelect,
  onDelete,
  onView,
}) => {
  return (
    <BriefList
      briefs={briefs}
      isLoading={isLoading}
      onSelect={onSelect}
      onDelete={onDelete}
      onView={onView}
    />
  );
};

export default FeatureBriefList; 