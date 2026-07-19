// Centralized avatar mapping to ensure consistency across all components

// Pre-import all avatar images to ensure consistent IDs
const member1 = require("../assets/images/member1.png");
const member2 = require("../assets/images/member2.png");
const member3 = require("../assets/images/member3.png");
const member4 = require("../assets/images/member4.png");
const member5 = require("../assets/images/member5.png");
const member6 = require("../assets/images/member6.png");
const member7 = require("../assets/images/member7.png");
const member8 = require("../assets/images/member8.png");
const member9 = require("../assets/images/member9.png");
const member10 = require("../assets/images/member10.png");
const member11 = require("../assets/images/member11.png");
const member12 = require("../assets/images/member12.png");
const member13 = require("../assets/images/member13.png");
const member14 = require("../assets/images/member14.png");
const pic1 = require("../assets/images/pic1.png");

// Export all images for direct access if needed
export const avatarImages = {
  member1,
  member2,
  member3,
  member4,
  member5,
  member6,
  member7,
  member8,
  member9,
  member10,
  member11,
  member12,
  member13,
  member14,
  pic1,
};

// Map relative avatar paths to actual image assets
const avatarUrlMap = {
  '/assets/images/users/avatar-1.jpg': member1,
  '/assets/images/users/avatar-2.jpg': member2,
  '/assets/images/users/avatar-3.jpg': member3,
  '/assets/images/users/avatar-4.jpg': member4,
  '/assets/images/users/avatar-5.jpg': member5,
  '/assets/images/users/avatar-6.jpg': member6,
  '/assets/images/users/avatar-7.jpg': member7,
  '/assets/images/users/avatar-8.jpg': member8,
  '/assets/images/users/avatar-9.jpg': member9,
  '/assets/images/users/avatar-10.jpg': member10,
  '/assets/images/users/avatar-11.jpg': member11,
  '/assets/images/users/avatar-12.jpg': member12,
  '/assets/images/users/avatar-13.jpg': member13,
  '/assets/images/pic1.png': pic1,
  'pic1.png': pic1,
};

/**
 * Get avatar image source from avatar URL
 * @param {string|number} avatarUrl - The avatar URL from the database or numeric require result
 * @returns {any} The require() result for the avatar image or URI object for dynamic images
 */
export const getAvatarSource = (avatarUrl) => {
  if (!avatarUrl) {
    return member13;
  }

  // Numeric values can be stale module IDs across reloads/app versions.
  // Use a known-safe fallback to prevent invalid Image source crashes.
  if (typeof avatarUrl === 'number') {
    return member13;
  }

  if (typeof avatarUrl === 'object' && avatarUrl?.uri) {
    return getAvatarSource(avatarUrl.uri);
  }

  if (typeof avatarUrl === 'string') {
    const normalized = avatarUrl.trim();

    if (!normalized) {
      return member13;
    }

    if (avatarUrlMap[normalized]) {
      return avatarUrlMap[normalized];
    }

    if (
      normalized.startsWith('http://') ||
      normalized.startsWith('https://') ||
      normalized.startsWith('file://') ||
      normalized.startsWith('content://') ||
      normalized.startsWith('data:image/')
    ) {
      return { uri: normalized };
    }

    // Map known local filename aliases to a safe bundled image.
    if (normalized.endsWith('/pic1.png') || normalized === 'pic1.png') {
      return pic1;
    }
  }

  return member13;
};

export default { getAvatarSource, avatarImages };
