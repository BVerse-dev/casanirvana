import { properties } from '@/assets/images/properties';

/**
 * Maps property image URLs from database to Next.js imported images
 * @param dbImageUrl - The image URL stored in database (e.g., 'properties.property1.src' or '/images/properties/p-1.jpg')
 * @returns The actual imported image or null if not found
 */
export const mapPropertyUrl = (dbImageUrl: string | null | undefined): string | null => {
  if (!dbImageUrl) return null;

  // Handle database URL patterns like 'properties.property' and 'properties.property1.src'
  if (dbImageUrl.startsWith('properties.property') && dbImageUrl.endsWith('.src')) {
    const mappedImage = properties[dbImageUrl as keyof typeof properties];
    return mappedImage || null;
  }

  // Handle legacy URL patterns like '/images/properties/p-1.jpg'
  if (dbImageUrl.includes('/properties/p-')) {
    const match = dbImageUrl.match(/p-(\d+)\.jpg/);
    if (match) {
      const propertyNumber = parseInt(match[1], 10);
      const propertyKey = `property${propertyNumber}` as keyof typeof properties;
      const mappedImage = properties[propertyKey];
      return mappedImage || null;
    }
  }

  // Handle direct property names like 'property1', 'property2', etc.
  if (dbImageUrl.match(/^property\d+$/)) {
    const mappedImage = properties[dbImageUrl as keyof typeof properties];
    return mappedImage || null;
  }

  // Return null if no mapping found
  return null;
};

/**
 * Maps society names to property images when no image_url is available
 * @param societyName - The name of the society
 * @returns The property image URL or default property image
 */
export const mapCommunityToPropertyImage = (communityName: string | null | undefined): string => {
  if (!communityName) return properties.property1;

  // Create a simple hash from community name to get consistent image mapping
  const hash = communityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIndex = (hash % 12) + 1; // We have 12 property images
  const propertyKey = `property${imageIndex}` as keyof typeof properties;
  
  return properties[propertyKey] || properties.property1;
};

// Backward-compatible alias for existing imports
export const mapSocietyToPropertyImage = mapCommunityToPropertyImage;

/**
 * Maps unit data to property images when no images array is available or valid
 * @param unit - The unit object with id, type, and society information
 * @returns The property image URL based on unit characteristics
 */
export const mapUnitToPropertyImage = (unit: any): string => {
  // If the unit has valid images array, use the first image
  if (Array.isArray(unit.images) && unit.images.length > 0 && typeof unit.images[0] === 'string') {
    const mappedUrl = mapPropertyUrl(unit.images[0]);
    if (mappedUrl) return mappedUrl;
  }
  
  // Calculate a consistent image based on unit ID and type
  const unitId = unit.id || '';
  const unitType = (unit.type || '').toLowerCase();
  
  // Use different image sets based on unit type
  let baseImageIndex = 1;
  
  if (unitType.includes('1bhk')) {
    baseImageIndex = 1;
  } else if (unitType.includes('2bhk')) {
    baseImageIndex = 4;
  } else if (unitType.includes('3bhk')) {
    baseImageIndex = 7;
  } else if (unitType.includes('4bhk')) {
    baseImageIndex = 10;
  }
  
  // Add some variation based on unit ID
  const hash = unitId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const variation = hash % 3; // 0, 1, or 2
  
  const finalIndex = baseImageIndex + variation;
  const propertyKey = `property${finalIndex}` as keyof typeof properties;
  
  return properties[propertyKey] || properties.property1;
};
