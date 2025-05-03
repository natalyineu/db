import { UserProfile } from '@/types';
import { ProfileMapper } from '@/services/profile-mapper';

/**
 * Safely parses a profile JSON string
 * @param jsonString The JSON string to parse
 * @returns UserProfile object or null if invalid
 */
export const parseProfileJSON = (jsonString: string): UserProfile | null => {
  try {
    if (!jsonString) return null;
    const data = JSON.parse(jsonString);
    return ProfileMapper.mapProfileData(data);
  } catch (error) {
    console.error('Error parsing profile JSON:', error);
    return null;
  }
};

/**
 * Gets full name from profile
 */
export const getFullName = (profile: UserProfile | null): string => {
  if (!profile) return '';
  
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return '';
  }
}; 