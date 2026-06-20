import { View, ScrollView, StyleSheet } from "react-native";
import { Target } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { ScreenState } from "@/components/ui/ScreenState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useYearlyGoal } from "@/lib/queries/goals";
import { targetZones } from "@/features/swimmer/swimmer-detail.lib";
import { msToTimeString } from "@/lib/utils/time";
import { STROKES } from "@/constants/strokes";
import { ZONES, ZONE_ORDER } from "@/constants/zones";
import { color, radius, space } from "@/constants/theme";

export default function GoalsScreen() {
  const { swimmerId, ready } = useSwimmerContext();
  const year = new Date().getFullYear();
  const goalQ = useYearlyGoal(swimmerId ?? undefined, year);

  return (
    <Screen>
      <Header title="Tavoitteet" subtitle={`Kausi ${year}`} />
      <ScreenState
        query={goalQ}
        busy={!ready}
        isEmpty={(goal) => goal === null}
        empty={
          <EmptyState
            icon={Target}
            text={"Ei vuositavoitetta\nTavoite asetetaan onboarding-vaiheessa tai valmentajan kautta."}
          />
        }
      >
        {(goal) => {
          if (!goal) return null;
          const zones = targetZones(goal) ?? { pk: 0, vk: 0, mk: 0, mak: 0 };
          const volumeRows = [
            { label: "Uintimetrit", value: goal.target_pool_km ? `${goal.target_pool_km} km` : "—" },
            { label: "Kuivaharjoittelu", value: goal.target_dryland_hours ? `${goal.target_dryland_hours} h` : "—" },
            { label: "Harjoituskerrat", value: goal.target_workouts ? `${goal.target_workouts} krt` : "—" },
          ];

          return (
            <ScrollView style={s.scroll} contentContainerStyle={s.content}>
              <Card>
                <Text variant="heading" style={s.cardTitle}>Volyymi</Text>
                {volumeRows.map((row, i, arr) => (
                  <View key={row.label} style={[s.row, i < arr.length - 1 && s.rowBorder]}>
                    <Text variant="body" color={color.inkMuted}>{row.label}</Text>
                    <Text variant="bodyStrong">{row.value}</Text>
                  </View>
                ))}
              </Card>

              <Card>
                <Text variant="heading" style={s.cardTitle}>Tehoaluejakauma</Text>
                <View style={s.zoneBar}>
                  {ZONE_ORDER.map((z) =>
                    zones[z] > 0 ? <View key={z} style={{ flex: zones[z], backgroundColor: ZONES[z].color }} /> : null,
                  )}
                </View>
                {ZONE_ORDER.map((z, i) => (
                  <View key={z} style={[s.zoneRow, i < ZONE_ORDER.length - 1 && s.rowBorder]}>
                    <View style={[s.zoneDot, { backgroundColor: ZONES[z].color }]} />
                    <Text variant="caption" color={color.inkMuted} style={s.zoneLabel}>
                      {ZONES[z].label} — {ZONES[z].description}
                    </Text>
                    <Text variant="bodyStrong" color={ZONES[z].color}>{zones[z]}%</Text>
                  </View>
                ))}
              </Card>

              {goal.target_stroke && (
                <Card>
                  <Text variant="heading" style={s.cardTitle}>Kisatavoite</Text>
                  <View style={s.raceBox}>
                    <View>
                      <Text variant="heading" color={color.primaryInk}>
                        {goal.target_distance}m {STROKES[goal.target_stroke as keyof typeof STROKES]?.label ?? goal.target_stroke}
                      </Text>
                      <Text variant="caption" color={color.primary}>Tavoitelaji</Text>
                    </View>
                    {goal.target_time_ms && (
                      <View style={s.raceTimeWrap}>
                        <Text variant="statValue" color={color.primaryInk}>{msToTimeString(goal.target_time_ms)}</Text>
                        <Text variant="caption" color={color.primary}>tavoiteaika</Text>
                      </View>
                    )}
                  </View>
                </Card>
              )}
              <View style={s.bottomSpacer} />
            </ScrollView>
          );
        }}
      </ScreenState>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: space.lg, gap: space.lg },
  cardTitle: { marginBottom: space.md },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: space.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: color.border },
  zoneBar: { flexDirection: "row", height: 12, borderRadius: radius.sm, overflow: "hidden", marginBottom: space.md },
  zoneRow: { flexDirection: "row", alignItems: "center", paddingVertical: space.sm, gap: space.sm },
  zoneDot: { width: 12, height: 12, borderRadius: radius.sm },
  zoneLabel: { flex: 1 },
  raceBox: {
    backgroundColor: color.primaryWash,
    borderRadius: radius.md,
    padding: space.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  raceTimeWrap: { alignItems: "flex-end" },
  bottomSpacer: { height: space.xxxl },
});
