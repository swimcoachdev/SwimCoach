import { type ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, space } from "@/constants/theme";

interface Props {
  children: ReactNode;
  /** Center children — for full-screen loading / empty states. */
  center?: boolean;
  /** Pad the top by the safe-area inset; use when the screen has no <Header>. */
  insetTop?: boolean;
  /** Pad the bottom by the safe-area inset. */
  insetBottom?: boolean;
  /** Background override; defaults to the app background token. */
  background?: string;
  style?: StyleProp<ViewStyle>;
}

/** The root container for every screen: app background + safe-area handling. */
export function Screen({ children, center, insetTop, insetBottom, background, style }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: background ?? color.bg },
        insetTop ? { paddingTop: insets.top } : null,
        insetBottom ? { paddingBottom: insets.bottom } : null,
        center ? styles.center : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: space.md },
});
