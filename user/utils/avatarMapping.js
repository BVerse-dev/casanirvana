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

// Debug log to see what require() actually returns
console.log('🔍 Avatar require() debug:', {
  member1: typeof member1,
  member1Value: member1,
  member2: typeof member2,
  member2Value: member2,
});

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
  console.log('🔍 getAvatarSource called with:', avatarUrl, typeof avatarUrl);
  
  if (!avatarUrl) {
    console.log('🎯 No avatar URL, using default member13');
    return member13;
  }
  
  // If it's already a number (result of require()), it means we have a valid image asset
  // But we need to verify it's a valid require() result, not just any number
  if (typeof avatarUrl === 'number') {
    console.log('🎯 Received number (require result), using default member13 for safety');
    // For safety, always return a known good require() result instead of trusting the number
    return member13;
  }
  
  // Check if it's a predefined member avatar URL
  if (avatarUrlMap[avatarUrl]) {
    const result = avatarUrlMap[avatarUrl];
    console.log('🎯 Using predefined avatar mapping:', avatarUrl, '->', typeof result, result);
    // Ensure we return the require() result, not just the number
    return result;
  }
  
  // Handle dynamic user images (like pic1.png, etc.)
  // If it's a URL or file path, return as URI object for Image component
  if (typeof avatarUrl === 'string' && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/') || avatarUrl.includes('.png') || avatarUrl.includes('.jpg'))) {
    console.log('🎯 Using dynamic user image:', avatarUrl);
    return { uri: avatarUrl };
  }
  
  // Fallback to default
  console.log('🎯 Fallback to default member13');
  return member13;
};

export default { getAvatarSource, avatarImages };
