import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  Vibration,
  ViewStyle,
} from "react-native";

type HapticTabProps = Omit<PressableProps, "style"> & {
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const HAPTIC_DURATION = 8;

const HapticTab: React.FC<HapticTabProps> = ({
  children,
  onPress,
  className,
  style,
  ...rest
}) => {
  const handlePress: NonNullable<HapticTabProps["onPress"]> = (
    ...args: any[]
  ) => {
    try {
      // simple vibration-based haptic feedback without extra deps
      Vibration.vibrate(HAPTIC_DURATION);
    } catch (e) {
      // ignore if vibration isn't available
    }

    if (onPress) onPress(...(args as any));
  };

  return (
    // Pressable supports NativeWind className when configured in the project
    // forward both className and style so consumers can use either NativeWind or style props

    <Pressable
      onPress={handlePress}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Pressable>
  );
};

export default HapticTab;
