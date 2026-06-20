import { useState } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Check, Pencil } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius, type as typeStyles } from "@/constants/theme";
import type { AttendeeEntry } from "@/types/workout";

interface Props {
  attendees: AttendeeEntry[];
  totalPoolM: number;
  onToggle: (id: string) => void;
  onOverride: (id: string, m: number | undefined) => void;
}

export function AttendanceList({ attendees, totalPoolM, onToggle, onOverride }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const presentCount = attendees.filter(a => a.present).length;

  if (attendees.length === 0) {
    return (
      <View style={s.emptyBox}>
        <Text variant="caption" color={color.inkFaint} style={s.emptyText}>Valitse ensin ryhmä nähdäksesi uimarit</Text>
      </View>
    );
  }

  return (
    <View style={s.box}>
      <View style={s.header}>
        <Text variant="bodyStrong" style={s.headerTitle}>Läsnäolijat</Text>
        <Text variant="caption" color={color.inkMuted}>{presentCount}/{attendees.length}</Text>
      </View>

      {attendees.map((a) => (
        <View key={a.swimmer_id}>
          <TouchableOpacity
            style={[s.row, !a.present && { opacity: 0.4 }]}
            onPress={() => onToggle(a.swimmer_id)}
          >
            <View style={[s.checkbox, a.present && s.checkboxActive]}>
              {a.present && <Check size={14} color={color.onPrimary} strokeWidth={3} />}
            </View>
            <Text variant="bodyStrong" style={s.name}>{a.full_name}</Text>
            {a.present && (
              <TouchableOpacity
                style={s.mBadge}
                onPress={() => setExpandedId(expandedId === a.swimmer_id ? null : a.swimmer_id)}
              >
                <Text variant="caption" color={color.inkMuted} style={s.mBadgeText}>
                  {a.actual_pool_m != null ? `${a.actual_pool_m}m` : `${totalPoolM}m`}
                </Text>
                <Pencil size={11} color={color.inkMuted} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {expandedId === a.swimmer_id && a.present && (
            <View style={s.overrideRow}>
              <Text variant="caption" color={color.inkFaint}>Poikkeava metrimäärä:</Text>
              <TextInput
                style={s.overrideInput}
                value={a.actual_pool_m != null ? String(a.actual_pool_m) : ""}
                onChangeText={(v) => onOverride(a.swimmer_id, v ? parseInt(v) : undefined)}
                keyboardType="number-pad"
                placeholder={String(totalPoolM)}
                placeholderTextColor={color.inkFaint}
              />
              <Text variant="caption" color={color.inkFaint}>m</Text>
              {a.actual_pool_m != null && (
                <TouchableOpacity onPress={() => onOverride(a.swimmer_id, undefined)}>
                  <Text variant="caption" color={color.accent}>poista</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  emptyBox: { backgroundColor: color.bg, borderRadius: radius.lg, padding: space.xl, marginBottom: space.lg },
  emptyText: { textAlign: "center" },
  box: { backgroundColor: color.bg, borderRadius: radius.lg, padding: space.lg, marginBottom: space.lg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.md },
  headerTitle: { fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.border },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: color.border, marginRight: space.md, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: color.primary, borderColor: color.primary },
  name: { flex: 1, fontSize: 15 },
  mBadge: { flexDirection: "row", alignItems: "center", gap: space.xs, backgroundColor: color.border, borderRadius: radius.sm, paddingHorizontal: space.sm, paddingVertical: space.xs },
  mBadgeText: {},
  overrideRow: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.sm, paddingLeft: 36 },
  overrideInput: {
    ...typeStyles.body,
    borderWidth: 1.5, borderColor: color.border, borderRadius: radius.sm,
    paddingHorizontal: space.md, paddingVertical: 6, fontSize: 14,
    backgroundColor: color.surface, width: 80, textAlign: "center", color: color.ink,
  },
});
