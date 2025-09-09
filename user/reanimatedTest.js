// Simple test to verify react-native-reanimated works
import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const ReanimatedTest = () => {
  const opacity = useSharedValue(0);
  
  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={[{ padding: 20 }, animatedStyle]}>
        <Text>Reanimated is working!</Text>
      </Animated.View>
    </View>
  );
};

export default ReanimatedTest;
