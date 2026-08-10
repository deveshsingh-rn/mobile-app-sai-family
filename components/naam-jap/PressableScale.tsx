import { MotiView } from "moti";
import React, { useState } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

type PressableScaleProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  ...rest
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        setPressed(true);
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        rest.onPressOut?.(e);
      }}
    >
      <MotiView
        animate={{ scale: pressed ? scaleTo : 1 }}
        style={style}
        transition={{ damping: 16, stiffness: 260, type: "spring" }}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}