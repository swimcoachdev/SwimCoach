import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import type { BaselineResult } from "@/types/onboarding";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

export default function BaselineScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  const [stroke, setStroke] = useState<SwimStroke>("vapaa");
  const [distance, setDistance] = useState<RaceDistance>(100);
  const [time, setTime] = useState("");
  const [addError, setAddError] = useState("");

  function addResult() {
    if (!time.trim()) { setAddError("Syötä aika"); return; }
    const exists = data.baselines.find(b => b.stroke === stroke && b.distance === distance);
    if (exists) { setAddError("Tämä laji+matka on jo lisätty. Poista ensin aiempi tulos."); return; }
    setAddError("");
    const result: BaselineResult = { id: Date.now().toString(), stroke, distance, timeString: time };
    setData({ baselines: [...data.baselines, result] });
    setTime("");
  }

  function remove(id: string) {
    setData({ baselines: data.baselines.filter(b => b.id !== id) });
  }

  return (
    <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={s.container}>
        <StepIndicator current={0} total={4} />
        <Text style={s.title}>Lähtötaso</Text>
        <Text style={s.subtitle}>
          Lisää aiemmat kisatuloksesi. Näitä käytetään kehityksesi mittaamiseen.
        </Text>

        {data.baselines.length > 0 && (
          <View style={s.list}>
            {data.baselines.map(b => (
              <View key={b.id} style={s.listRow}>
                <Text style={s.listName}>{b.distance}m {STROKES[b.stroke].label}</Text>
                <Text style={s.listTime}>{b.timeString}</Text>
                <TouchableOpacity onPress={() => remove(b.id)}>
                  <Text style={s.removeBtn}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={s.form}>
          <Text style={s.formTitle}>Lisää tulos</Text>

          <Text style={s.label}>Uintilaji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
            <View style={s.chipRow}>
              {STROKE_LIST.map(([s2, info]) => (
                <TouchableOpacity
                  key={s2}
                  onPress={() => setStroke(s2)}
                  style={[s.chip, stroke === s2 && s.chipActive]}
                >
                  <Text style={[s.chipText, stroke === s2 && s.chipTextActive]}>{info.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={s.label}>Matka</Text>
          <View style={s.distRow}>
            {RACE_DISTANCES.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setDistance(d)}
                style={[s.chip, distance === d && s.chipActive]}
              >
                <Text style={[s.chipText, distance === d && s.chipTextActive]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Aika (esim. 1:02.45 tai 58.30)</Text>
          <View style={s.timeRow}>
            <TextInput
              style={s.timeInput}
              placeholder="mm:ss.hh"
              value={time}
              onChangeText={v => { setTime(v); setAddError(""); }}
              keyboardType="numeric"
            />
            <TouchableOpacity style={s.addBtn} onPress={addResult}>
              <Text style={s.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {addError ? <Text style={s.error}>{addError}</Text> : null}
        </View>

        <View style={s.navRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Takaisin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.nextBtn} onPress={() => router.push("/onboarding/volume")}>
            <Text style={s.nextText}>
              {data.baselines.length === 0 ? "Ohita →" : "Seuraava →"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { color: "#6B7280", marginBottom: 24 },
  list: { marginBottom: 24 },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  listName: { flex: 1, fontWeight: "500", color: "#1F2937" },
  listTime: { color: "#0EA5E9", fontWeight: "700", marginRight: 16 },
  removeBtn: { color: "#F87171", fontSize: 20 },
  form: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 24 },
  formTitle: { fontWeight: "600", color: "#374151", marginBottom: 12 },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  chipScroll: { marginBottom: 12 },
  chipRow: { flexDirection: "row", gap: 8 },
  distRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  chipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  chipText: { fontWeight: "500", fontSize: 14, color: "#374151" },
  chipTextActive: { color: "#fff" },
  timeRow: { flexDirection: "row", gap: 12 },
  timeInput: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", fontSize: 16 },
  addBtn: { backgroundColor: "#0EA5E9", borderRadius: 12, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 18 },
  error: { color: "#EF4444", fontSize: 12, marginTop: 8 },
  navRow: { flexDirection: "row", gap: 12 },
  backBtn: { flex: 1, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16 },
  backText: { color: "#4B5563", fontWeight: "500" },
  nextBtn: { flex: 1, backgroundColor: "#0EA5E9", paddingVertical: 16, alignItems: "center", borderRadius: 16 },
  nextText: { color: "#fff", fontWeight: "600" },
});
