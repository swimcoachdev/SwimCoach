import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
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
        <Text style={s.emptyText}>Valitse ensin ryhmä nähdäksesi uimarit</Text>
      </View>
    );
  }

  return (
    <View style={s.box}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Läsnäolijat</Text>
        <Text style={s.headerCount}>{presentCount}/{attendees.length}</Text>
      </View>

      {attendees.map((a) => (
        <View key={a.swimmer_id}>
          <TouchableOpacity
            style={[s.row, !a.present && { opacity: 0.4 }]}
            onPress={() => onToggle(a.swimmer_id)}
          >
            <View style={[s.checkbox, a.present && s.checkboxActive]}>
              {a.present && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.name}>{a.full_name}</Text>
            {a.present && (
              <TouchableOpacity
                style={s.mBadge}
                onPress={() => setExpandedId(expandedId === a.swimmer_id ? null : a.swimmer_id)}
              >
                <Text style={s.mBadgeText}>
                  {a.actual_pool_m != null ? `${a.actual_pool_m}m ✎` : `${totalPoolM}m ✎`}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {expandedId === a.swimmer_id && a.present && (
            <View style={s.overrideRow}>
              <Text style={s.overrideLabel}>Poikkeava metrimäärä:</Text>
              <TextInput
                style={s.overrideInput}
                value={a.actual_pool_m != null ? String(a.actual_pool_m) : ""}
                onChangeText={(v) => onOverride(a.swimmer_id, v ? parseInt(v) : undefined)}
                keyboardType="number-pad"
                placeholder={String(totalPoolM)}
                placeholderTextColor="#94a3b8"
              />
              <Text style={s.overrideLabel}>m</Text>
              {a.actual_pool_m != null && (
                <TouchableOpacity onPress={() => onOverride(a.swimmer_id, undefined)}>
                  <Text style={s.removeText}>poista</Text>
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
  emptyBox: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 20, marginBottom: 16 },
  emptyText: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  box: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 16, marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  headerCount: { fontSize: 13, color: "#6b7280" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#d1d5db", marginRight: 12, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  checkmark: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  name: { flex: 1, fontSize: 15, fontWeight: "500", color: "#111827" },
  mBadge: { backgroundColor: "#e2e8f0", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  mBadgeText: { fontSize: 12, color: "#6b7280" },
  overrideRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingLeft: 36 },
  overrideLabel: { fontSize: 12, color: "#94a3b8" },
  overrideInput: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, fontSize: 14,
    backgroundColor: "#ffffff", width: 80, textAlign: "center", color: "#111827",
  },
  removeText: { fontSize: 12, color: "#f87171" },
});
