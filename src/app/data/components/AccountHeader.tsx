import React from 'react';

interface AccountHeaderProps {
  profile: any;
  userBusinessType: string;
  onLogout: () => void;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ profile, userBusinessType, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
          {profile.first_name?.[0] || profile.email[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI-Vertise Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile.first_name || profile.email.split("@")[0]}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`px-3 py-1 rounded-full text-sm ${userBusinessType === 'Business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {userBusinessType}
        </div>
        <button 
          onClick={onLogout}
          className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AccountHeader; 