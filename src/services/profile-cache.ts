import { UserProfile } from '@/types/profile';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

// In-memory cache for profiles to reduce database hits
const profileCache = new Map<string, {
  profile: UserProfile;
  timestamp: number;
}>();

// Cache expiry time (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Service to manage profile caching
 */
export class ProfileCache {
  /**
   * Get a profile from cache if it exists and is not expired
   */
  static get(userId: string): UserProfile | null {
    const cached = profileCache.get(userId);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      if (DEBUG) console.log('ProfileCache: Using cached profile for user:', userId);
      return cached.profile;
    }
    
    return null;
  }
  
  /**
   * Store a profile in the cache
   */
  static set(userId: string, profile: UserProfile): void {
    profileCache.set(userId, {
      profile,
      timestamp: Date.now()
    });
    
    if (DEBUG) console.log('ProfileCache: Cached profile for user:', userId);
  }
  
  /**
   * Clear the profile cache for a specific user or all users
   */
  static clear(userId?: string): void {
    if (userId) {
      profileCache.delete(userId);
    } else {
      profileCache.clear();
    }
    
    if (DEBUG) console.log('ProfileCache: Cache cleared', userId ? `for user ${userId}` : 'for all users');
  }
} 