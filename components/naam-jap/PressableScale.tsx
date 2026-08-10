import { MotiView } from "moti";
import React, { ReactNode, useState } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

type PressableScaleProps = Omit<PressableProps, "children" | "style"> & {
  children?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function PressableScale({
  children,
  containerStyle,
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
      style={containerStyle}
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
