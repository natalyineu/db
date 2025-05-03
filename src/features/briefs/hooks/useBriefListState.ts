import { useBriefList } from '@/hooks/useBriefList';
import { Brief } from '@/types';

interface UseBriefListStateProps {
  briefs: Brief[];
  defaultSortField?: keyof Brief;
  defaultItemsPerPage?: number;
}

/**
 * Re-export of the shared useBriefList hook to maintain feature-specific API
 */
export function useBriefListState({
  briefs,
  defaultSortField,
  defaultItemsPerPage,
}: UseBriefListStateProps) {
  return useBriefList({
    briefs,
    defaultSortField,
    defaultItemsPerPage,
  });
}

export default useBriefListState; 