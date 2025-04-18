import { memo } from 'react';

interface DashboardHeaderProps {
  title: string;
  userName: string;
  onSignOut?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onBack?: () => void;
  backText?: string;
}

// Memoized Header component
const DashboardHeader = memo(({ 
  title, 
  userName, 
  onSignOut, 
  onRefresh, 
  isRefreshing = false,
  onBack,
  backText
}: DashboardHeaderProps) => (
  <div className="mb-6 text-center transform transition-all duration-700 ease-out translate-y-0 opacity-100">
    <div className="inline-block relative mb-2">
      <h1 className="text-3xl font-bold text-[#1967D2] relative z-10">
        {title}
      </h1>
      <div className="absolute -bottom-1 left-0 w-full h-2 bg-[#E8F0FE] rounded-full transform scale-110"></div>
    </div>
    <p className="mt-2 text-base text-[#5F6368]">Welcome to your personal account dashboard, {userName}!</p>
    <div className="mt-4 flex justify-center space-x-3">
      {onBack ? (
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC] rounded-md transition-colors text-sm flex items-center font-medium"
          aria-label={backText || "Back"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backText || "Back"}
        </button>
      ) : (
        <>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`px-4 py-2 ${isRefreshing ? 'bg-[#E8F0FE] text-[#1967D2]/50' : 'bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC]'} rounded-md transition-colors text-sm flex items-center font-medium`}
              aria-label="Refresh dashboard"
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1967D2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          )}
          
          {onSignOut && (
            <button 
              onClick={onSignOut}
              className="px-4 py-2 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95 transition-colors text-sm font-medium"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          )}
        </>
      )}
    </div>
  </div>
));
DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader; 