import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "@/features/onboarding/StepIndicator";
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";

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
    setData({ [key]: next } as any);
  }

  return (
    <View style={s.container}>
      <StepIndicator current={2} total={4} />
      <Text style={s.title}>Tehoaluejakauma</Text>
      <Text style={s.subtitle}>
        Miten harjoittelusi jakautuu tehoalueille? Summan tulee olla 100%.
      </Text>

      <View style={[s.sumBadge, total === 100 ? s.sumOk : s.sumWarn]}>
        <Text style={[s.sumText, total === 100 ? s.sumOkText : s.sumWarnText]}>
          {total === 100
            ? "✓ Jakauma täynnä"
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
        {remaining > 0 && <View style={{ flex: remaining, backgroundColor: "#E5E7EB" }} />}
      </View>

      {ZONE_ORDER.map(zone => {
        const { label, color, description } = ZONES[zone];
        const value = data[ZONE_KEYS[zone]];
        return (
          <View key={zone} style={s.zoneRow}>
            <View style={[s.zoneDot, { backgroundColor: color }]} />
            <View style={s.zoneInfo}>
              <Text style={s.zoneName}>{label}</Text>
              <Text style={s.zoneDesc}>{description}</Text>
            </View>
            <TouchableOpacity style={s.adjBtn} onPress={() => adjust(zone, -5)}>
              <Text style={s.adjText}>−</Text>
            </TouchableOpacity>
            <Text style={[s.zonePct, { color }]}>{value}%</Text>
            <TouchableOpacity style={s.adjBtn} onPress={() => adjust(zone, 5)}>
              <Text style={s.adjText}>+</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={s.navRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.nextBtn, total !== 100 && s.nextBtnDisabled]}
          onPress={() => total === 100 && router.push("/onboarding/goal")}
          disabled={total !== 100}
        >
          <Text style={s.nextText}>Seuraava →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { color: "#6B7280", marginBottom: 8 },
  sumBadge: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24 },
  sumOk: { backgroundColor: "#F0FDF4" },
  sumWarn: { backgroundColor: "#FFFBEB" },
  sumText: { fontSize: 14, fontWeight: "500" },
  sumOkText: { color: "#15803D" },
  sumWarnText: { color: "#B45309" },
  vizBar: { flexDirection: "row", height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 24 },
  zoneRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  zoneDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  zoneInfo: { flex: 1 },
  zoneName: { fontWeight: "600", color: "#1F2937" },
  zoneDesc: { fontSize: 12, color: "#9CA3AF" },
  adjBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  adjText: { color: "#4B5563", fontWeight: "700", fontSize: 18 },
  zonePct: { width: 48, textAlign: "center", fontWeight: "700", fontSize: 16 },
  navRow: { flexDirection: "row", gap: 12, marginTop: "auto", paddingBottom: 32 },
  backBtn: { flex: 1, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16 },
  backText: { color: "#4B5563", fontWeight: "500" },
  nextBtn: { flex: 1, backgroundColor: "#0EA5E9", paddingVertical: 16, alignItems: "center", borderRadius: 16 },
  nextBtnDisabled: { backgroundColor: "#D1D5DB" },
  nextText: { color: "#fff", fontWeight: "600" },
});
