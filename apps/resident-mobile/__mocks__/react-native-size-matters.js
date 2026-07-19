// Mock for react-native-size-matters
export const ms = jest.fn((size) => size);
export const s = jest.fn((size) => size);
export const vs = jest.fn((size) => size);
export const mvs = jest.fn((size) => size);
export const ScaledSheet = {
  create: jest.fn((styles) => styles),
};
