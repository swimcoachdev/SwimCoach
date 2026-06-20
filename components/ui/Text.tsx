import { Text as RNText, type TextProps } from "react-native";
import { type as typeStyles } from "@/constants/theme";

type Variant = keyof typeof typeStyles;

interface Props extends TextProps {
  /** A named style from the type scale in constants/theme.ts. Defaults to "body". */
  variant?: Variant;
  /** Override the token color without writing a StyleSheet. */
  color?: string;
}

/** Text bound to the design system's type scale — use instead of raw <Text>. */
export function Text({ variant = "body", color, style, ...rest }: Props) {
  return <RNText {...rest} style={[typeStyles[variant], color ? { color } : null, style]} />;
}
