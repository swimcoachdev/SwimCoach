import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { color, space, radius } from "@/constants/theme";
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
          <Text variant="bodyStrong" style={st.setName}>{s.repetitions}×{s.distance_m}m {STROKES[s.stroke].short}</Text>
          <Text variant="caption" color={color.inkMuted} style={st.setDist}>{s.repetitions * s.distance_m}m</Text>
          <ZoneBadge zone={s.intensity_zone} size="sm" />
          <TouchableOpacity onPress={() => removeSet(s.id)} style={st.removeBtn}>
            <X size={18} color={color.accent} />
          </TouchableOpacity>
        </View>
      ))}

      {sets.length > 0 && (
        <View style={st.totalRow}>
          <Text variant="bodyStrong" color={color.primary}>{totalM}m yhteensä</Text>
        </View>
      )}

      <View style={st.addBox}>
        <Text variant="bodyStrong" color={color.inkMuted} style={st.addTitle}>Lisää setti</Text>

        <View style={st.inputRow}>
          <View style={{ flex: 1 }}>
            <Field label="Toistot" style={st.input} value={reps} onChangeText={setReps} keyboardType="number-pad" textAlign="center" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Matka (m)" style={st.input} value={dist} onChangeText={setDist} keyboardType="number-pad" textAlign="center" />
          </View>
        </View>

        <Text variant="label" style={st.inputLabel}>Tehoalue</Text>
        <View style={st.zoneRow}>
          {ZONE_ORDER.map((z) => (
            <TouchableOpacity key={z} onPress={() => setZone(z)} style={{ opacity: zone === z ? 1 : 0.4 }}>
              <ZoneBadge zone={z} />
            </TouchableOpacity>
          ))}
        </View>

        <Button label="+ Lisää setti" onPress={addSet} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: color.border },
  setName: { flex: 1, fontSize: 15 },
  setDist: { marginRight: space.sm },
  removeBtn: { marginLeft: 10, padding: space.xs },
  totalRow: { paddingVertical: space.sm, alignItems: "flex-end" },
  addBox: { marginTop: space.lg, padding: space.lg, backgroundColor: color.bg, borderRadius: radius.lg },
  addTitle: { fontSize: 14, marginBottom: space.md },
  inputRow: { flexDirection: "row", gap: space.md, marginBottom: space.md },
  inputLabel: { marginBottom: space.xs },
  input: { borderWidth: 1.5 },
  zoneRow: { flexDirection: "row", gap: space.sm, marginBottom: 14, flexWrap: "wrap" },
});
