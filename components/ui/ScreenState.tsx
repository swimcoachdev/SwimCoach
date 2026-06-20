import { type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";
import { Text } from "./Text";
import { Button } from "./Button";
import { PaceClock } from "./PaceClock";
import { color, space } from "@/constants/theme";

interface Props<T> {
  query: UseQueryResult<T>;
  /** Render the loaded data. Only called once data is defined. */
  children: (data: T) => ReactNode;
  /** Force the loading state even when the query is settled (e.g. ids not ready). */
  busy?: boolean;
  /** Shown when the query succeeds but the data is considered empty. */
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  errorText?: string;
}

/**
 * The loading / error / empty / data ladder every screen repeats, in one place:
 * a pace-clock spinner while loading, a retry on error, an optional empty slot.
 */
export function ScreenState<T>({ query, children, busy, empty, isEmpty, errorText }: Props<T>) {
  if (query.isError && query.data === undefined) {
    return (
      <View style={styles.center}>
        <Text variant="body" color={color.inkMuted}>{errorText ?? "Tietojen lataus epäonnistui."}</Text>
        <Button label="Yritä uudelleen" variant="ghost" onPress={() => query.refetch()} />
      </View>
    );
  }
  if (busy || query.data === undefined) {
    return (
      <View style={styles.center}>
        <PaceClock size={48} />
      </View>
    );
  }
  if (empty && isEmpty?.(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.md, padding: space.xl },
});
