import React from 'react';

interface AccountHeaderProps {
  profile: any;
  userBusinessType: string;
  onLogout: () => void;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ profile, userBusinessType, onLogout }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-5 sm:mb-8 gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
          {profile.first_name?.[0] || profile.email[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">AI-Vertise Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back, {profile.first_name || profile.email.split("@")[0]}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 rounded-full text-xs sm:text-sm bg-indigo-100 text-indigo-800">
          {userBusinessType}
        </div>
        <button 
          onClick={onLogout}
          className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AccountHeader; 