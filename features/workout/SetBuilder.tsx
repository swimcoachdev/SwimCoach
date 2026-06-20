import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ZoneBadge } from "./ZoneBadge";
import { ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { STROKES, type SwimStroke } from "@/constants/strokes";

export interface SetEntry {
  id: string;
  repetitions: number;
  distance_m: number;
  stroke: SwimStroke;
  intensity_zone: IntensityZone;
  description?: string;
}

interface Props {
  sets: SetEntry[];
  onChange: (sets: SetEntry[]) => void;
}

export function SetBuilder({ sets, onChange }: Props) {
  const [reps, setReps] = useState("4");
  const [dist, setDist] = useState("200");
  const [stroke, setStroke] = useState<SwimStroke>("vapaa");
  const [zone, setZone] = useState<IntensityZone>("pk");

  const totalM = sets.reduce((sum, s) => sum + s.repetitions * s.distance_m, 0);

  function addSet() {
    const r = parseInt(reps);
    const d = parseInt(dist);
    if (!r || !d) return;
    onChange([...sets, { id: Date.now().toString(), repetitions: r, distance_m: d, stroke, intensity_zone: zone }]);
  }

  function removeSet(id: string) {
    onChange(sets.filter(s => s.id !== id));
  }

  return (
    <View>
      {sets.map((s) => (
        <View key={s.id} style={st.setRow}>
          <Text style={st.setName}>{s.repetitions}×{s.distance_m}m {STROKES[s.stroke].short}</Text>
          <Text style={st.setDist}>{s.repetitions * s.distance_m}m</Text>
          <ZoneBadge zone={s.intensity_zone} size="sm" />
          <TouchableOpacity onPress={() => removeSet(s.id)} style={st.removeBtn}>
            <Text style={st.removeText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {sets.length > 0 && (
        <View style={st.totalRow}>
          <Text style={st.totalText}>{totalM}m yhteensä</Text>
        </View>
      )}

      <View style={st.addBox}>
        <Text style={st.addTitle}>Lisää setti</Text>

        <View style={st.inputRow}>
          <View style={{ flex: 1 }}>
            <Text style={st.inputLabel}>Toistot</Text>
            <TextInput style={st.input} value={reps} onChangeText={setReps} keyboardType="number-pad" textAlign="center" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.inputLabel}>Matka (m)</Text>
            <TextInput style={st.input} value={dist} onChangeText={setDist} keyboardType="number-pad" textAlign="center" />
          </View>
        </View>

        <Text style={st.inputLabel}>Tehoalue</Text>
        <View style={st.zoneRow}>
          {ZONE_ORDER.map((z) => (
            <TouchableOpacity key={z} onPress={() => setZone(z)} style={{ opacity: zone === z ? 1 : 0.4 }}>
              <ZoneBadge zone={z} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={st.addBtn} onPress={addSet}>
          <Text style={st.addBtnText}>+ Lisää setti</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  setName: { flex: 1, fontSize: 15, fontWeight: "500", color: "#111827" },
  setDist: { fontSize: 13, color: "#6b7280", marginRight: 8 },
  removeBtn: { marginLeft: 10, padding: 4 },
  removeText: { fontSize: 20, color: "#f87171" },
  totalRow: { paddingVertical: 8, alignItems: "flex-end" },
  totalText: { fontSize: 15, fontWeight: "700", color: "#0EA5E9" },
  addBox: { marginTop: 16, padding: 16, backgroundColor: "#f8fafc", borderRadius: 14 },
  addTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  inputLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 10, fontSize: 16,
    backgroundColor: "#ffffff", color: "#111827",
  },
  zoneRow: { flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  addBtn: { backgroundColor: "#0EA5E9", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  addBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
});
