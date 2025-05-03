import { ProfileMapper } from '../profile-mapper';
import { UserProfile } from '@/types/profile';

describe('ProfileMapper', () => {
  describe('toUserProfile', () => {
    it('should convert db profile to UserProfile', () => {
      const dbProfile = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        status: 1,
        plan: 'Starter',
        first_name: 'John',
        last_name: 'Doe'
      };
      
      const result = ProfileMapper.toUserProfile(dbProfile);
      
      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        status: 1,
        plan: 'Starter',
        first_name: 'John',
        last_name: 'Doe'
      });
    });
    
    it('should return null for null input', () => {
      const result = ProfileMapper.toUserProfile(null);
      expect(result).toBeNull();
    });
    
    it('should handle missing optional fields', () => {
      const dbProfile = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const result = ProfileMapper.toUserProfile(dbProfile);
      
      expect(result).toHaveProperty('id', 'user123');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('plan', 'Starter'); // Default value
      expect(result?.status).toBeUndefined();
    });
  });
  
  describe('toDbUpdate', () => {
    it('should format profile update for database', () => {
      const now = new Date();
      const originalTimestamp = now.toISOString();
      // Mock Date.now to return a consistent value
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(originalTimestamp);
      
      const updatePayload = {
        first_name: 'Jane',
        last_name: 'Smith',
        plan: 'Professional'
      };
      
      const result = ProfileMapper.toDbUpdate(updatePayload);
      
      expect(result).toEqual({
        first_name: 'Jane',
        last_name: 'Smith',
        plan: 'Professional',
        updated_at: originalTimestamp
      });
      
      jest.restoreAllMocks();
    });
    
    it('should remove id and created_at from update payload', () => {
      const updatePayload = {
        id: 'user123', // Should be removed
        created_at: '2023-01-01T00:00:00Z', // Should be removed
        first_name: 'Jane',
        last_name: 'Smith'
      };
      
      const result = ProfileMapper.toDbUpdate(updatePayload as any);
      
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('created_at');
      expect(result).toHaveProperty('first_name', 'Jane');
      expect(result).toHaveProperty('last_name', 'Smith');
    });
  });
  
  describe('toPublicProfile', () => {
    it('should extract public fields only', () => {
      const profile: UserProfile = {
        id: 'user123',
        email: 'test@example.com', // Private, should not be included
        created_at: '2023-01-01T00:00:00Z', // Private, should not be included
        first_name: 'John',
        last_name: 'Doe',
        plan: 'Professional',
        address: '123 Main St' // Private, should not be included
      };
      
      const result = ProfileMapper.toPublicProfile(profile);
      
      expect(result).toEqual({
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        plan: 'Professional'
      });
      
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('created_at');
      expect(result).not.toHaveProperty('address');
    });
    
    it('should return null for null input', () => {
      const result = ProfileMapper.toPublicProfile(null);
      expect(result).toBeNull();
    });
  });
  
  describe('formatStatus', () => {
    it('should convert numeric status to string representation', () => {
      expect(ProfileMapper.formatStatus(1)).toBe('active');
      expect(ProfileMapper.formatStatus('1')).toBe('active');
      expect(ProfileMapper.formatStatus(2)).toBe('suspended');
      expect(ProfileMapper.formatStatus(3)).toBe('deactivated');
    });
    
    it('should return original string for unknown status codes', () => {
      expect(ProfileMapper.formatStatus('active')).toBe('active');
      expect(ProfileMapper.formatStatus('custom-status')).toBe('custom-status');
    });
    
    it('should handle undefined or null values', () => {
      expect(ProfileMapper.formatStatus(undefined)).toBe('unknown');
      expect(ProfileMapper.formatStatus(null as any)).toBe('unknown');
    });
  });
}); 