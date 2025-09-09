# Mock Configuration for Jest Testing

This directory contains mock implementations for various dependencies used in the Casa Nirvana app. These mocks are necessary to handle ES module syntax and other complexities when running Jest tests.

## Key Mocks

- **expo-font**: Mocks the `useFonts` hook to always return `[true]` so font loading is considered complete.
- **expo-constants**: Provides mock configuration for Supabase and other environment variables.
- **react-native-vector-icons**: Mocks various icon sets (Ionicons, Feather) as simple string components.
- **react-native-size-matters**: Mocks scaling functions for responsive design.
- **@supabase/supabase-js**: Mocks Supabase client and authentication methods.
- **react-native**: Provides mock implementations of core React Native components and APIs.

## Usage

Mocks are automatically used by Jest when importing the corresponding modules in test files. To add new mocks:

1. Create a new file in the `__mocks__` directory with the same name as the module you want to mock.
2. Add the mock implementation to the file.
3. Import and use the module in your test file as you normally would.

For more complex modules with nested exports (like react-native-vector-icons), create a subdirectory and add individual mock files for each export.

## Example

```javascript
// In your test file
jest.mock('expo-font');
jest.mock('react-native-vector-icons/Ionicons');

// The test will use the mock implementations
import { useFonts } from 'expo-font';
import Ionicons from 'react-native-vector-icons/Ionicons';
```

## Troubleshooting

If you encounter an error like "Unexpected token 'export'" or "Cannot use import statement outside a module", you may need to add a mock for that module. Check the error message for the module path and create a mock implementation.
