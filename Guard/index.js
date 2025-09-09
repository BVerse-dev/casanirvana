// Disable React DevTools hook in dev to avoid ExceptionsManager/console mutation issues on Hermes
if (typeof __DEV__ !== 'undefined' && __DEV__) {
	try {
		const hook = global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (hook && typeof hook === 'object') {
			hook.isDisabled = true;
			hook.inject = () => {};
		}
	} catch (e) {
		// no-op
	}
}

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
