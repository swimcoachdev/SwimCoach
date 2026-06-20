import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Check, Minus, Plus } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { color, radius, space } from "@/constants/theme";

const ZONE_KEYS = {
  pk: "targetPctPk",
  vk: "targetPctVk",
  mk: "targetPctMk",
  mak: "targetPctMak",
} as const;

export default function ZonesScreen() {
  const router = useRouter();
  const { data, setData } = useOnboardingStore();

  const total = data.targetPctPk + data.targetPctVk + data.targetPctMk + data.targetPctMak;
  const remaining = 100 - total;

  function adjust(zone: IntensityZone, delta: number) {
    const key = ZONE_KEYS[zone];
    const current = data[key];
    const next = Math.max(0, Math.min(100, current + delta));
    setData({ [key]: next } as Partial<typeof data>);
  }

  return (
    <Screen insetTop insetBottom style={s.container}>
      <StepIndicator current={2} total={4} />
      <Text variant="title">Tehoaluejakauma</Text>
      <Text variant="body" color={color.inkMuted} style={s.subtitle}>
        Miten harjoittelusi jakautuu tehoalueille? Summan tulee olla 100%.
      </Text>

      <View style={[s.sumBadge, { backgroundColor: total === 100 ? color.goodWash : color.warnWash }]}>
        {total === 100 ? <Check size={16} color={color.good} strokeWidth={2.5} /> : null}
        <Text variant="caption" color={total === 100 ? color.good : color.warn}>
          {total === 100
            ? "Jakauma täynnä"
            : total < 100
            ? "Jäljellä " + remaining + "% jaettavaksi"
            : "Ylitetty " + (-remaining) + "% — vähennä jostakin"}
        </Text>
      </View>

      <View style={s.vizBar}>
        {ZONE_ORDER.map(z => {
          const pct = data[ZONE_KEYS[z]];
          return pct > 0 ? (
            <View key={z} style={{ flex: pct, backgroundColor: ZONES[z].color }} />
          ) : null;
        })}
        {remaining > 0 && <View style={{ flex: remaining, backgroundColor: color.border }} />}
      </View>

      {ZONE_ORDER.map(zone => {
        const { label, color: zoneColor, description } = ZONES[zone];
        const value = data[ZONE_KEYS[zone]];
        return (
          <View key={zone} style={s.zoneRow}>
            <View style={[s.zoneDot, { backgroundColor: zoneColor }]} />
            <View style={s.zoneInfo}>
              <Text variant="bodyStrong">{label}</Text>
              <Text variant="caption" color={color.inkFaint}>{description}</Text>
            </View>
            <TouchableOpacity style={s.adjBtn} onPress={() => adjust(zone, -5)}>
              <Minus size={18} color={color.inkMuted} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text variant="statValue" color={zoneColor} style={s.zonePct}>{value}%</Text>
            <TouchableOpacity style={s.adjBtn} onPress={() => adjust(zone, 5)}>
              <Plus size={18} color={color.inkMuted} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={s.navRow}>
        <Button label="← Takaisin" variant="secondary" onPress={() => router.back()} style={s.navBtn} />
        <Button
          label="Seuraava →"
          onPress={() => total === 100 && router.push("/onboarding/goal")}
          disabled={total !== 100}
          style={s.navBtn}
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: space.xxl },
  subtitle: { marginBottom: space.sm },
  sumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    marginBottom: space.xxl,
  },
  vizBar: { flexDirection: "row", height: 16, borderRadius: radius.sm, overflow: "hidden", marginBottom: space.xxl },
  zoneRow: { flexDirection: "row", alignItems: "center", marginBottom: space.lg },
  zoneDot: { width: 12, height: 12, borderRadius: radius.sm, marginRight: space.md },
  zoneInfo: { flex: 1 },
  adjBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: color.bg, alignItems: "center", justifyContent: "center" },
  zonePct: { width: 56, textAlign: "center" },
  navRow: { flexDirection: "row", gap: space.md, marginTop: "auto", paddingBottom: space.xxxl },
  navBtn: { flex: 1 },
});
