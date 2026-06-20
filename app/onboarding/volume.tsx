import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { color, radius, space } from "@/constants/theme";

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
      <Text variant="bodyStrong">{label}</Text>
      <Text variant="caption" color={color.inkFaint} style={s.fieldHint}>{hint}</Text>
      <View style={s.inputRow}>
        <Field
          style={s.input}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder={placeholder}
        />
        <View style={s.unit}>
          <Text variant="bodyStrong" color={color.inkMuted}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

export default function VolumeScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  return (
    <Screen insetTop insetBottom>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <StepIndicator current={1} total={4} />
        <Text variant="title">Volyymitavoite</Text>
        <Text variant="body" color={color.inkMuted} style={s.subtitle}>
          Kuinka paljon haluat harjoitella tällä kaudella?
        </Text>

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
          <Button label="← Takaisin" variant="secondary" onPress={() => router.back()} style={s.navBtn} />
          <Button label="Seuraava →" onPress={() => router.push("/onboarding/zones")} style={s.navBtn} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: space.xxl, paddingTop: space.md, paddingBottom: space.xxl },
  subtitle: { marginBottom: space.xxxl },
  field: { marginBottom: space.xl },
  fieldHint: { marginTop: space.xs, marginBottom: space.sm },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: color.surface,
  },
  input: { flex: 1, borderWidth: 0, borderRadius: 0 },
  unit: { paddingHorizontal: space.lg, paddingVertical: space.md, backgroundColor: color.bg },
  navRow: { flexDirection: "row", gap: space.md, marginTop: space.lg },
  navBtn: { flex: 1 },
});
