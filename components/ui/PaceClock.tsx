import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { color } from "@/constants/theme";

/**
 * The pace clock — the instrument the whole squad reads off the pool wall, and
 * SwimCoach's signature mark. Used as the app's loading state: a clean white
 * face with 12 ticks and a red sweep hand that loops once every two seconds.
 */
export function PaceClock({ size = 44 }: { size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const r = size / 2;
  const ticks = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={r} cy={r} r={r - 1.5} fill={color.surface} stroke={color.border} strokeWidth={2} />
        {ticks.map((i) => {
          const major = i % 3 === 0;
          const a = (i * 30 * Math.PI) / 180;
          const outer = r - 4;
          const inner = r - (major ? 9 : 6.5);
          return (
            <Line
              key={i}
              x1={r + Math.sin(a) * inner}
              y1={r - Math.cos(a) * inner}
              x2={r + Math.sin(a) * outer}
              y2={r - Math.cos(a) * outer}
              stroke={major ? color.ink : color.inkFaint}
              strokeWidth={major ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
      <Animated.View style={{ position: "absolute", width: size, height: size, transform: [{ rotate }] }}>
        <Svg width={size} height={size}>
          <Line x1={r} y1={r} x2={r} y2={size * 0.2} stroke={color.accent} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={r} cy={r} r={3} fill={color.accent} />
        </Svg>
      </Animated.View>
    </View>
  );
}
