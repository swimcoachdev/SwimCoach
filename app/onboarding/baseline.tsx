import { useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import type { BaselineResult } from "@/types/onboarding";
import { color, space } from "@/constants/theme";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

export default function BaselineScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  const [stroke, setStroke] = useState<SwimStroke>("vapaa");
  const [distance, setDistance] = useState<RaceDistance>("100");
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
    <Screen insetTop insetBottom>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <StepIndicator current={0} total={4} />
        <Text variant="title">Lähtötaso</Text>
        <Text variant="body" color={color.inkMuted} style={s.subtitle}>
          Lisää aiemmat kisatuloksesi. Näitä käytetään kehityksesi mittaamiseen.
        </Text>

        {data.baselines.length > 0 && (
          <View style={s.list}>
            {data.baselines.map(b => (
              <View key={b.id} style={s.listRow}>
                <Text variant="bodyStrong" style={s.listName}>{b.distance}m {STROKES[b.stroke].label}</Text>
                <Text variant="mono" color={color.primaryInk} style={s.listTime}>{b.timeString}</Text>
                <TouchableOpacity onPress={() => remove(b.id)} hitSlop={8}>
                  <X size={18} color={color.accent} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Card style={s.form}>
          <Text variant="heading">Lisää tulos</Text>

          <Text variant="label">Uintilaji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>
              {STROKE_LIST.map(([s2, info]) => (
                <Chip key={s2} label={info.label} active={stroke === s2} onPress={() => setStroke(s2)} />
              ))}
            </View>
          </ScrollView>

          <Text variant="label">Matka</Text>
          <View style={s.distRow}>
            {RACE_DISTANCES.map(d => (
              <Chip key={d} label={`${d}m`} active={distance === d} onPress={() => setDistance(d)} />
            ))}
          </View>

          <Text variant="label">Aika (esim. 1:02.45 tai 58.30)</Text>
          <View style={s.timeRow}>
            <Field
              containerStyle={s.timeInput}
              placeholder="mm:ss.hh"
              value={time}
              onChangeText={v => { setTime(v); setAddError(""); }}
              keyboardType="numeric"
            />
            <Button label="+" onPress={addResult} style={s.addBtn} />
          </View>
          {addError ? <Text variant="caption" color={color.accent}>{addError}</Text> : null}
        </Card>

        <View style={s.navRow}>
          <Button label="← Takaisin" variant="secondary" onPress={() => router.back()} style={s.navBtn} />
          <Button
            label={data.baselines.length === 0 ? "Ohita →" : "Seuraava →"}
            onPress={() => router.push("/onboarding/volume")}
            style={s.navBtn}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: space.xxl, paddingTop: space.md, paddingBottom: space.xxl },
  subtitle: { marginBottom: space.xxl },
  list: { marginBottom: space.xxl },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border,
  },
  listName: { flex: 1 },
  listTime: { marginRight: space.lg },
  form: { gap: space.md, marginBottom: space.xxl },
  chipRow: { flexDirection: "row", gap: space.sm },
  distRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  timeRow: { flexDirection: "row", gap: space.md, alignItems: "stretch" },
  timeInput: { flex: 1 },
  addBtn: { justifyContent: "center" },
  navRow: { flexDirection: "row", gap: space.md },
  navBtn: { flex: 1 },
});
