// Avatar mapping utility for agencies and users
// This ensures consistent avatar usage across List View, Grid View, and Details pages

// Import all avatars from the centralized index file
import { avatars } from '@/assets/images/users';

// Import property images for agency banners
import { 
  property1, property2, property3, property4, property5, property6, 
  property7, property8, property9, property10, property11, property12,
  property13, property14, property15, property16
} from '@/assets/images/properties';

// Agency avatar mapping for easy lookup - used across all agency views
export const agencyAvatarMap = {
  '/images/users/avatar-1.jpg': avatars.avatar1,
  '/images/users/avatar-2.jpg': avatars.avatar2,
  '/images/users/avatar-3.jpg': avatars.avatar3,
  '/images/users/avatar-4.jpg': avatars.avatar4,
  '/images/users/avatar-5.jpg': avatars.avatar5,
  '/images/users/avatar-6.jpg': avatars.avatar6,
  '/images/users/avatar-7.jpg': avatars.avatar7,
  '/images/users/avatar-8.jpg': avatars.avatar8,
  '/images/users/avatar-9.jpg': avatars.avatar9,
  '/images/users/avatar-10.jpg': avatars.avatar10,
};

// User avatar mapping for residents and other user-related pages
export const userAvatarMap = {
  '/images/users/avatar-1.jpg': avatars.avatar1,
  '/images/users/avatar-2.jpg': avatars.avatar2,
  '/images/users/avatar-3.jpg': avatars.avatar3,
  '/images/users/avatar-4.jpg': avatars.avatar4,
  '/images/users/avatar-5.jpg': avatars.avatar5,
  '/images/users/avatar-6.jpg': avatars.avatar6,
  '/images/users/avatar-7.jpg': avatars.avatar7,
  '/images/users/avatar-8.jpg': avatars.avatar8,
  '/images/users/avatar-9.jpg': avatars.avatar9,
  '/images/users/avatar-10.jpg': avatars.avatar10,
  '/images/users/avatar-11.jpg': avatars.avatar11,
  '/images/users/avatar-12.jpg': avatars.avatar12,
  '/images/users/dummy-avatar.jpg': avatars.dummyAvatar,
  'avatar-1.jpg': avatars.avatar1,
  'avatar-2.jpg': avatars.avatar2,
  'avatar-3.jpg': avatars.avatar3,
  'avatar-4.jpg': avatars.avatar4,
  'avatar-5.jpg': avatars.avatar5,
  'avatar-6.jpg': avatars.avatar6,
  'avatar-7.jpg': avatars.avatar7,
  'avatar-8.jpg': avatars.avatar8,
  'avatar-9.jpg': avatars.avatar9,
  'avatar-10.jpg': avatars.avatar10,
  'avatar-11.jpg': avatars.avatar11,
  'avatar-12.jpg': avatars.avatar12,
  'dummy-avatar.jpg': avatars.dummyAvatar,
};

// Property images array for easy access
const propertyImages = [
  property1, property2, property3, property4, property5, property6,
  property7, property8, property9, property10, property11, property12,
  property13, property14, property15, property16
];

/**
 * Maps avatar URL strings to imported avatar images (for residents and users)
 * @param avatarUrl - The avatar URL string from database
 * @returns The imported avatar image or null if not found
 */
export const mapAvatarUrl = (avatarUrl: string | null | undefined): any => {
  if (!avatarUrl) return null;
  
  // Handle direct .src property values (like "/_next/static/media/avatar-1.abc123.jpg")
  if (avatarUrl.includes('avatar-') && avatarUrl.includes('.jpg')) {
    // Extract avatar number from URL
    const match = avatarUrl.match(/avatar-(\d+)/);
    if (match) {
      const avatarNumber = parseInt(match[1]);
      const avatarKey = `avatar${avatarNumber}` as keyof typeof avatars;
      if (avatars[avatarKey]) {
        return avatars[avatarKey];
      }
    }
  }
  
  // Try direct mapping first
  if (userAvatarMap[avatarUrl as keyof typeof userAvatarMap]) {
    return userAvatarMap[avatarUrl as keyof typeof userAvatarMap];
  }
  
  // Try extracting filename from full URL
  const filename = avatarUrl.split('/').pop();
  if (filename && userAvatarMap[filename as keyof typeof userAvatarMap]) {
    return userAvatarMap[filename as keyof typeof userAvatarMap];
  }
  
  return null;
};

// Helper function to get agency avatar
export const getAgencyAvatar = (logoUrl: string | null) => {
  if (!logoUrl) return null;
  return agencyAvatarMap[logoUrl as keyof typeof agencyAvatarMap] || null;
};

// Helper function to get agency avatar with fallback
export const getAgencyAvatarWithFallback = (logoUrl: string | null) => {
  const avatar = getAgencyAvatar(logoUrl);
  return avatar || null; // Return null if no avatar found, components will handle fallback
};

/**
 * Gets the property image for an agency - SAME IMAGE for grid, list, and details views
 * @param agency - The agency object with id
 * @returns The static imported property image
 */
export const getAgencyPropertyImage = (agency: any): any => {
  if (!agency || !agency.id) return property1;
  
  // Simple hash of agency ID to consistently map to same image
  // Convert ID to string first to handle both number and string IDs
  const hash = String(agency.id).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const imageIndex = hash % propertyImages.length;
  
  return propertyImages[imageIndex];
};

/**
 * Maps agency data to property images for banners (returns string URL - deprecated)
 * @param agency - The agency object with id, name, and other information
 * @returns The property image URL based on agency characteristics
 */
export const mapAgencyToPropertyImage = (agency: any): string => {
  const image = getAgencyPropertyImage(agency);
  return image;
};

// Export the avatar map for direct access if needed
export default agencyAvatarMap;
