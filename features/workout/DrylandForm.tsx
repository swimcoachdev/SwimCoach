import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from "react-native";
import type { DrylandEntry, DrylandCategory } from "@/types/workout";
import { DRYLAND_CATEGORIES } from "@/types/workout";

interface Props {
  value: DrylandEntry | null;
  onChange: (d: DrylandEntry | null) => void;
}

export function DrylandForm({ value, onChange }: Props) {
  const [enabled, setEnabled] = useState(!!value);

  function toggle(on: boolean) {
    setEnabled(on);
    if (!on) { onChange(null); return; }
    onChange({ duration_min: 60, category: "voima" });
  }

  return (
    <View style={s.box}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Kuivaharjoittelu</Text>
          <Text style={s.subtitle}>Sali, liikkuvuus, koordinaatio</Text>
        </View>
        <Switch value={enabled} onValueChange={toggle} trackColor={{ true: "#0EA5E9" }} />
      </View>

      {enabled && value && (
        <>
          <Text style={s.label}>Kesto (min)</Text>
          <TextInput
            style={s.input}
            value={String(value.duration_min)}
            onChangeText={(v) => onChange({ ...value, duration_min: parseInt(v) || 0 })}
            keyboardType="number-pad"
            placeholder="60"
            placeholderTextColor="#94a3b8"
          />

          <Text style={s.label}>Tyyppi</Text>
          <View style={s.chips}>
            {(Object.keys(DRYLAND_CATEGORIES) as DrylandCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => onChange({ ...value, category: cat })}
                style={[s.chip, value.category === cat && s.chipActive]}
              >
                <Text style={[s.chipText, value.category === cat && s.chipTextActive]}>
                  {DRYLAND_CATEGORIES[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 16, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 15, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  label: { fontSize: 11, color: "#94a3b8", marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    backgroundColor: "#ffffff", color: "#111827", marginBottom: 14,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#e2e8f0", backgroundColor: "#ffffff",
  },
  chipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  chipText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  chipTextActive: { color: "#ffffff" },
});
