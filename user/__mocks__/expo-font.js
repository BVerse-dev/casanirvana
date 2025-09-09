// Mock for expo-font
export const useFonts = jest.fn(() => [true]);
export const Font = {
  loadAsync: jest.fn(() => Promise.resolve()),
};
