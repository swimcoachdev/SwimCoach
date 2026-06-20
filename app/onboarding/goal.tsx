import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { STROKES, RACE_DISTANCES, type SwimStroke } from "@/constants/strokes";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { color, space } from "@/constants/theme";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

export default function GoalScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  return (
    <Screen insetTop insetBottom>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <StepIndicator current={3} total={4} />
        <Text variant="title">Kisatavoite</Text>
        <Text variant="body" color={color.inkMuted} style={s.subtitle}>
          Mikä on tärkein kilpailutavoitteesi tälle kaudelle?
        </Text>

        <Text variant="label">Laji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
          <View style={s.chipRow}>
            {STROKE_LIST.map(([s2, info]) => (
              <Chip
                key={s2}
                label={info.label}
                active={data.goalStroke === s2}
                onPress={() => setData({ goalStroke: s2 })}
              />
            ))}
          </View>
        </ScrollView>

        <Text variant="label">Matka</Text>
        <View style={s.distRow}>
          {RACE_DISTANCES.map(d => (
            <Chip
              key={d}
              label={`${d}m`}
              active={data.goalDistance === d}
              onPress={() => setData({ goalDistance: d })}
            />
          ))}
        </View>

        <Field
          label="Tavoiteaika"
          placeholder="esim. 2:05.00 tai 58.50"
          value={data.goalTimeString}
          onChangeText={v => setData({ goalTimeString: v })}
          keyboardType="numeric"
        />
        <Text variant="caption" color={color.inkFaint} style={s.hint}>
          Formaatti: minuutit:sekunnit.sadasosat
        </Text>

        <View style={s.navRow}>
          <Button label="← Takaisin" variant="secondary" onPress={() => router.back()} style={s.navBtn} />
          <Button label="Valmis →" onPress={() => router.push("/onboarding/done")} style={s.navBtn} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: space.xxl, paddingTop: space.md, paddingBottom: space.xxxl },
  subtitle: { marginBottom: space.xxxl },
  chipScroll: { marginTop: space.sm, marginBottom: space.xl },
  chipRow: { flexDirection: "row", gap: space.sm },
  distRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.sm, marginBottom: space.xl },
  hint: { marginTop: space.sm, marginBottom: space.xxxl },
  navRow: { flexDirection: "row", gap: space.md },
  navBtn: { flex: 1 },
});
