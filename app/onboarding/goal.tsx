import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

export default function GoalScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  return (
    <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={s.container}>
        <StepIndicator current={3} total={4} />
        <Text style={s.title}>Kisatavoite</Text>
        <Text style={s.subtitle}>Mikä on tärkein kilpailutavoitteesi tälle kaudelle?</Text>

        <Text style={s.label}>Laji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
          <View style={s.chipRow}>
            {STROKE_LIST.map(([s2, info]) => (
              <TouchableOpacity
                key={s2}
                onPress={() => setData({ goalStroke: s2 })}
                style={[s.chip, data.goalStroke === s2 && s.chipActive]}
              >
                <Text style={[s.chipText, data.goalStroke === s2 && s.chipTextActive]}>
                  {info.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.label}>Matka</Text>
        <View style={s.distRow}>
          {RACE_DISTANCES.map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setData({ goalDistance: d })}
              style={[s.chip, data.goalDistance === d && s.chipActive]}
            >
              <Text style={[s.chipText, data.goalDistance === d && s.chipTextActive]}>{d}m</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Tavoiteaika</Text>
        <TextInput
          style={s.input}
          placeholder="esim. 2:05.00 tai 58.50"
          value={data.goalTimeString}
          onChangeText={v => setData({ goalTimeString: v })}
          keyboardType="numeric"
        />
        <Text style={s.hint}>Formaatti: minuutit:sekunnit.sadasosat</Text>

        <View style={s.navRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Takaisin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.nextBtn} onPress={() => router.push("/onboarding/done")}>
            <Text style={s.nextText}>Valmis →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { color: "#6B7280", marginBottom: 32 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  chipScroll: { marginBottom: 20 },
  chipRow: { flexDirection: "row", gap: 8 },
  distRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  chipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  chipText: { fontWeight: "500", color: "#374151" },
  chipTextActive: { color: "#fff" },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: "#fff", marginBottom: 8 },
  hint: { fontSize: 12, color: "#9CA3AF", marginBottom: 32 },
  navRow: { flexDirection: "row", gap: 12 },
  backBtn: { flex: 1, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16 },
  backText: { color: "#4B5563", fontWeight: "500" },
  nextBtn: { flex: 1, backgroundColor: "#0EA5E9", paddingVertical: 16, alignItems: "center", borderRadius: 16 },
  nextText: { color: "#fff", fontWeight: "600" },
});
