// SimpleMarquee.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  StyleProp,
  Text,
  TextStyle,
  View,
} from "react-native";
import { width } from "../styles/scaling";

type Props = {
  text: string;
  speed?: number; // pixels per second
  gap?: number;   // space between loops
  textStyle?: StyleProp<TextStyle>;
  shouldStart?: boolean; // control when animation starts
};

export default function SimpleMarquee({
  text,
  speed = 30,
  textStyle,
  shouldStart = false,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!textWidth) return;

    if (shouldStart) {
      const distance = textWidth;
      const duration = (distance / speed) * 2500; // ms

      translateX.setValue(0); // reset before loop

      const animation = Animated.loop(
        Animated.timing(translateX, {
          toValue: -distance *2,
          duration,
          useNativeDriver: true,
        })
      );

      animationRef.current = animation;
      animation.start();
    } else {
      // Stop animation when shouldStart is false
      if (animationRef.current) {
        animationRef.current.stop();
      }
      translateX.setValue(0); // reset to start position
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [textWidth, speed, translateX, shouldStart]);

  return (
    <View style={{ width:width}}>
      {shouldStart ? <Animated.View
        style={{
          flexDirection: "row",
          transform: [{ translateX }],
          // height: 12,
          gap: textWidth,
        }}
      >
        {/* first copy */}
        <Text
          style={[{ fontSize: 16 }, textStyle]}
          numberOfLines={1}
          onLayout={(e: LayoutChangeEvent) =>
            setTextWidth(e.nativeEvent.layout.width)
          }
        >
          {text}
        </Text>

        {/* second copy */}
        <Text
          style={[{ fontSize: 16 }, textStyle]}
          numberOfLines={1}
          onLayout={(e: LayoutChangeEvent) =>
            setTextWidth(e.nativeEvent.layout.width)
          }
        >
          {text}
        </Text>
      </Animated.View> 
      : 
      <View style={{
          flexDirection: "row",
        // height: 12,
        }}>
      <Text
      style={[{ fontSize: 16 }, textStyle]}
      numberOfLines={1}
      onLayout={(e: LayoutChangeEvent) =>
        setTextWidth(e.nativeEvent.layout.width)
      }
    >
      {text}
    </Text>
    </View>
        }
    </View>
  );
}
