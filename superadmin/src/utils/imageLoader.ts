/**
 * Centralized image loader utility
 * This allows us to change image source logic in one place
 */

// Base path for all images (can be easily changed)
const IMAGE_BASE_PATH = '/assets/images';

/**
 * Load an image from the public directory
 * @param imagePath - path relative to /assets/images/
 * @returns full public path to the image
 */
export const loadImage = (imagePath: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${IMAGE_BASE_PATH}/${cleanPath}`;
};

/**
 * Load multiple images and return as an object
 */
export const loadImages = (imagePaths: Record<string, string>): Record<string, string> => {
  const images: Record<string, string> = {};
  
  for (const [key, path] of Object.entries(imagePaths)) {
    images[key] = loadImage(path);
  }
  
  return images;
};

/**
 * Pre-defined image collections
 */

// User avatars
export const avatars = {
  avatar1: loadImage('users/avatar-1.jpg'),
  avatar2: loadImage('users/avatar-2.jpg'),
  avatar3: loadImage('users/avatar-3.jpg'),
  avatar4: loadImage('users/avatar-4.jpg'),
  avatar5: loadImage('users/avatar-5.jpg'),
  avatar6: loadImage('users/avatar-6.jpg'),
  avatar7: loadImage('users/avatar-7.jpg'),
  avatar8: loadImage('users/avatar-8.jpg'),
  avatar9: loadImage('users/avatar-9.jpg'),
  avatar10: loadImage('users/avatar-10.jpg'),
  avatar11: loadImage('users/avatar-11.jpg'),
  avatar12: loadImage('users/avatar-12.jpg'),
  dummyAvatar: loadImage('users/dummy-avatar.jpg'),
};

// Array for easy random selection
export const avatarList = Object.values(avatars);

// Logos
export const logos = {
  logoDark: loadImage('../logo-dark.png'), // These are in public root
  logoLight: loadImage('../logo-light.png'),
  logoSm: loadImage('../logo-sm.png'),
};

// Small images
export const smallImages = {
  img1: loadImage('small/img-1.jpg'),
  img2: loadImage('small/img-2.jpg'),
  img3: loadImage('small/img-3.jpg'),
  img4: loadImage('small/img-4.jpg'),
  img5: loadImage('small/img-5.jpg'),
  img6: loadImage('small/img-6.jpg'),
  img7: loadImage('small/img-7.jpg'),
  img8: loadImage('small/img-8.jpg'),
  img9: loadImage('small/img-9.jpg'),
  img10: loadImage('small/img-10.jpg'),
};

// Properties
export const propertyImages = {
  p1: loadImage('properties/p-1.jpg'),
  p2: loadImage('properties/p-2.jpg'),
  p3: loadImage('properties/p-3.jpg'),
  p4: loadImage('properties/p-4.jpg'),
  p5: loadImage('properties/p-5.jpg'),
  p6: loadImage('properties/p-6.jpg'),
  p7: loadImage('properties/p-7.jpg'),
  p8: loadImage('properties/p-8.jpg'),
  p9: loadImage('properties/p-9.jpg'),
  p10: loadImage('properties/p-10.jpg'),
  p11: loadImage('properties/p-11.jpg'),
  p12: loadImage('properties/p-12.jpg'),
  p13: loadImage('properties/p-13.jpg'),
  p14: loadImage('properties/p-14.jpg'),
  p15: loadImage('properties/p-15.jpg'),
  p16: loadImage('properties/p-16.jpg'),
};

// Products
export const productImages = {
  p1: loadImage('product/p-1.png'),
  p2: loadImage('product/p-2.png'),
  p3: loadImage('product/p-3.png'),
  p4: loadImage('product/p-4.png'),
  p5: loadImage('product/p-5.png'),
  p6: loadImage('product/p-6.png'),
  p7: loadImage('product/p-7.png'),
  p8: loadImage('product/p-8.png'),
  p9: loadImage('product/p-9.png'),
  p10: loadImage('product/p-10.png'),
  p11: loadImage('product/p-11.png'),
  p12: loadImage('product/p-12.png'),
  p13: loadImage('product/p-13.png'),
  p14: loadImage('product/p-14.png'),
};

// Other common images
export const otherImages = {
  chip: loadImage('chip.png'),
  contactlessPayment: loadImage('contactless-payment.png'),
  customerBg: loadImage('customer-bg.jpg'),
  dhl: loadImage('dhl.png'),
  eShoes: loadImage('e-shoes.png'),
  fedex: loadImage('fedex.png'),
  happyMan: loadImage('happy-man.png'),
  home2: loadImage('home-2.png'),
  maintenance: loadImage('maintenance.svg'),
  money: loadImage('money.png'),
  party: loadImage('party.png'),
  trophy: loadImage('trophy.png'),
  ups: loadImage('ups.png'),
  agent1: loadImage('agent-1.png'),
  analyticsM: loadImage('analytics-m.png'),
  error404: loadImage('404.svg'),
  bgPattern: loadImage('bg-pattern.svg'),
};

// Default export with all image collections
export default {
  loadImage,
  loadImages,
  avatars,
  avatarList,
  logos,
  smallImages,
  propertyImages,
  productImages,
  otherImages,
};
