// __tests__/Component.test.js
// Add all mocks at the top
jest.mock('expo-font');
jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
  TransitionPresets: {
    SlideFromRightIOS: {},
    DefaultTransition: {},
  },
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: () => 'NavigationContainer',
  useFocusEffect: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  withTranslation: () => (Component) => Component,
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native-size-matters/extend');
jest.mock('react-native-size-matters');
jest.mock('react-native-really-awesome-button');
jest.mock('expo-constants');
jest.mock('@supabase/supabase-js');
jest.mock('react-native-vector-icons/Ionicons');
jest.mock('react-native-vector-icons/Feather');
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
  LogBox: {
    ignoreAllLogs: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  Image: 'Image',
  StyleSheet: {
    create: jest.fn(styles => styles),
    flatten: jest.fn(style => style),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

import React from 'react';
import { View, Text } from 'react-native';
import { render } from '@testing-library/react-native';

// Simple component for testing
const SimpleComponent = ({ title }) => (
  <View>
    <Text>{title}</Text>
  </View>
);

describe('SimpleComponent', () => {
  it('renders with the correct title', () => {
    const { getByText } = render(<SimpleComponent title="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });
});
