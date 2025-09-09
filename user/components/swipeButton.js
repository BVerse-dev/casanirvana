import React, { useState } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  interpolateColor,
} from "react-native-reanimated";
import { Colors, Default } from "../constants/styles";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { ms } from "react-native-size-matters/extend";

const { height } = Dimensions.get("window");

const BUTTON_WIDTH = ms(60);
const BUTTON_HEIGHT = height / 3.2;
const BUTTON_PADDING = Default.fixPadding * 0.7;

const SWIPEABLE_DIMENSIONS = BUTTON_WIDTH - 2 * BUTTON_PADDING;
const H_SWIPE_RANGE = BUTTON_HEIGHT - 2 * BUTTON_PADDING - SWIPEABLE_DIMENSIONS;

const SwipeButton = (props) => {
  const Y = useSharedValue(H_SWIPE_RANGE);
  const [toggled, setToggled] = useState(true);

  const handleComplete = (isToggled) => {
    if (isToggled !== toggled) {
      setToggled(isToggled);
      if (isToggled === false) {
        props.onSwipeUpToAllowHandle();
      }
    }
  };

  const animatedGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.completed = toggled;
    },
    onActive: (e, ctx) => {
      let newValue;
      if (ctx.completed) {
        newValue = H_SWIPE_RANGE + e.translationY;
      } else {
        newValue = e.translationY;
      }

      if (newValue >= 0 && newValue <= H_SWIPE_RANGE) {
        Y.value = newValue;
      }
    },
    onEnd: () => {
      if (Y.value < BUTTON_HEIGHT / 2 - SWIPEABLE_DIMENSIONS / 2) {
        Y.value = withSpring(0);
        runOnJS(handleComplete)(false);
      } else {
        Y.value = withSpring(H_SWIPE_RANGE);
        runOnJS(handleComplete)(true);
      }
    },
  });

  const InterpolateYInput = [0, H_SWIPE_RANGE];

  const AnimatedStyles = {
    swipeable: useAnimatedStyle(() => {
      return {
        backgroundColor: interpolateColor(
          Y.value,
          [0, BUTTON_WIDTH - SWIPEABLE_DIMENSIONS - BUTTON_PADDING],
          [Colors.green, Colors.green]
        ),
        transform: [{ translateY: Y.value }],
      };
    }),
    colorWave: useAnimatedStyle(() => {
      return {
        height: H_SWIPE_RANGE - Y.value + Default.fixPadding * 4,
        opacity: interpolate(Y.value, InterpolateYInput, [1, 1]),
      };
    }),

    swipeText: useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          Y.value,
          [0, H_SWIPE_RANGE],
          [0, 1],
          Extrapolate.CLAMP
        ),
        transform: [
          {
            translateY: interpolate(
              Y.value,
              [0, H_SWIPE_RANGE],
              [0, BUTTON_HEIGHT / 8 - SWIPEABLE_DIMENSIONS],
              Extrapolate.CLAMP
            ),
          },
        ],
      };
    }),
  };

  return (
    <Animated.View style={[styles.swipeCont]}>
      <Animated.View style={[AnimatedStyles.colorWave, styles.colorWave]} />
      <PanGestureHandler onGestureEvent={animatedGestureHandler}>
        <Animated.View style={[styles.swipeable, AnimatedStyles.swipeable]}>
          <FontAwesome5 name="arrow-up" size={20} color={Colors.white} />
        </Animated.View>
      </PanGestureHandler>
      <Animated.View style={[AnimatedStyles.swipeText]}>
        <FontAwesome5
          name="chevron-up"
          size={20}
          color={Colors.regularLightGrey}
          style={{ marginVertical: Default.fixPadding }}
        />
        <FontAwesome5
          name="chevron-up"
          size={20}
          color={Colors.primaryOpacity40}
        />
        <FontAwesome5
          name="chevron-up"
          size={20}
          color={Colors.primaryOpacity60}
          style={{ marginVertical: Default.fixPadding }}
        />
        <FontAwesome5 name="chevron-up" size={20} color={Colors.primary} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swipeCont: {
    justifyContent: "center",
    alignItems: "center",
    padding: BUTTON_PADDING,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_WIDTH,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  swipeable: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: BUTTON_PADDING,
    width: SWIPEABLE_DIMENSIONS,
    height: SWIPEABLE_DIMENSIONS,
    borderRadius: SWIPEABLE_DIMENSIONS,
  },
  colorWave: {
    position: "absolute",
    width: SWIPEABLE_DIMENSIONS,
    bottom: Default.fixPadding * 0.8,
    borderRadius: BUTTON_HEIGHT,
    backgroundColor: Colors.green,
  },
});

export default SwipeButton;
