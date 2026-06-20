import {
  View,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "./Text";
import { color, radius, space, type as typeStyles } from "@/constants/theme";

interface Props extends TextInputProps {
  /** Optional eyebrow label above the input. */
  label?: string;
  /** Layout style for the wrapper — use this (not `style`) to flex the field in a row. */
  containerStyle?: StyleProp<ViewStyle>;
}

/** A labelled text input wired to the type scale + token colors. */
export function Field({ label, containerStyle, style, ...rest }: Props) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput placeholderTextColor={color.inkFaint} style={[styles.input, style]} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  input: {
    ...typeStyles.body,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: color.surface,
    color: color.ink,
  },
});
