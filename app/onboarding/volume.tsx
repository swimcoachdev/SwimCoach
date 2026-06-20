import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";

interface FieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
}

function GoalField({ label, hint, value, onChange, unit, placeholder }: FieldProps) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldHint}>{hint}</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder={placeholder}
        />
        <View style={s.unit}>
          <Text style={s.unitText}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

export default function VolumeScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  return (
    <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={s.container}>
        <StepIndicator current={1} total={4} />
        <Text style={s.title}>Volyymitavoite</Text>
        <Text style={s.subtitle}>Kuinka paljon haluat harjoitella tällä kaudella?</Text>

        <GoalField label="Uintimetrit" hint="Esim. 400 km on noin 5 harjoitusta viikossa"
          value={data.targetPoolKm} onChange={v => setData({ targetPoolKm: v })}
          unit="km" placeholder="esim. 400" />
        <GoalField label="Kuivaharjoittelu" hint="Kaikki salitreenit, joustavuus, koordinaatio"
          value={data.targetDrylandHours} onChange={v => setData({ targetDrylandHours: v })}
          unit="h" placeholder="esim. 60" />
        <GoalField label="Harjoituskerrat" hint="Yhteensä uinti + kuiva"
          value={data.targetWorkouts} onChange={v => setData({ targetWorkouts: v })}
          unit="krt" placeholder="esim. 200" />

        <View style={s.navRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Takaisin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.nextBtn} onPress={() => router.push("/onboarding/zones")}>
            <Text style={s.nextText}>Seuraava →</Text>
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
  subtitle: { color: "#6B7280", marginBottom: 32 },
  field: { marginBottom: 20 },
  fieldLabel: { fontWeight: "600", color: "#1F2937", marginBottom: 4 },
  fieldHint: { fontSize: 12, color: "#9CA3AF", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  unit: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F9FAFB" },
  unitText: { color: "#6B7280", fontWeight: "500" },
  navRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  backBtn: { flex: 1, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16 },
  backText: { color: "#4B5563", fontWeight: "500" },
  nextBtn: { flex: 1, backgroundColor: "#0EA5E9", paddingVertical: 16, alignItems: "center", borderRadius: 16 },
  nextText: { color: "#fff", fontWeight: "600" },
});
