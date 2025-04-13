import { memo, useMemo } from 'react';
import { UserProfile } from '@/types';
import { formatDate, formatProfileField } from '@/utils';

interface ProfileInfoProps {
  profile: UserProfile;
}

// Memoized Profile Info component
const ProfileInfo = memo(({ profile }: ProfileInfoProps) => {
  const profileInfo = useMemo(() => [
    { label: 'Email', value: profile.email, icon: (
      <svg className="w-4 h-4 text-[#1967D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ) },
    { label: 'Account ID', value: profile.id?.substring(0, 8) + '...', icon: (
      <svg className="w-4 h-4 text-[#1967D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ) },
    { label: 'Created', value: formatDate(profile.created_at), icon: (
      <svg className="w-4 h-4 text-[#1967D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ) },
    { label: 'Last Updated', value: profile.updated_at ? formatDate(profile.updated_at) : 'Never', icon: (
      <svg className="w-4 h-4 text-[#1967D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) }
  ], [profile]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm transform transition-all duration-500 ease-out translate-y-0 opacity-100 border border-[#DADCE0]">
      <h2 className="text-xl font-semibold text-[#3C4043] mb-5 pb-2 border-b border-[#DADCE0]">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {profileInfo.map((item, index) => (
          <div key={`profile-${index}`} className="flex items-center animate-fade-in" style={{ animationDelay: `${400 + index * 100}ms` }}>
            <div className="w-8 h-8 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <div className="ml-3">
              <span className="text-xs font-medium text-[#5F6368] uppercase tracking-wide">{item.label}</span>
              <p className="text-sm font-medium text-[#3C4043] mt-0.5">{formatProfileField(item.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
ProfileInfo.displayName = 'ProfileInfo';

export default ProfileInfo; 