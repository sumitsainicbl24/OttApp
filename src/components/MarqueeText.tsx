// SimpleMarquee.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, Text, TextStyle, View } from "react-native";

type Props = {
  text: string;
  speed?: number; // smaller = faster
  textStyle?: StyleProp<TextStyle>;
};

export default function SimpleMarquee({ text, speed = 100, textStyle }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -text.length * 50, // adjust based on text length
        duration: speed * 100,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX, speed]);

  return (
    <View style={{ overflow: "hidden", width: "100%" }}>
      <Animated.Text
        style={[{
          transform: [{ translateX }],
          fontSize: 16,
        },textStyle]}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {text}
      </Animated.Text>
    </View>
  );
}
