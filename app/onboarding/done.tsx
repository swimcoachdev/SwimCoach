import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { upsertYearlyGoal } from "@/lib/queries/goals";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { timeStringToMs } from "@/lib/utils/time";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingDone() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, reset } = useOnboardingStore();
  const [status, setStatus] = useState<"saving" | "done" | "error">("saving");

  useEffect(() => { save(); }, []);

  async function save() {
    try {
      const { data: swimmer } = await supabase
        .from("swimmers")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!swimmer) throw new Error("Uimaria ei löydy");

      const year = new Date().getFullYear();

      await upsertYearlyGoal({
        swimmer_id: swimmer.id,
        season_year: year,
        target_pool_km: data.targetPoolKm ? parseFloat(data.targetPoolKm) : undefined,
        target_dryland_hours: data.targetDrylandHours ? parseFloat(data.targetDrylandHours) : undefined,
        target_workouts: data.targetWorkouts ? parseInt(data.targetWorkouts) : undefined,
        target_pct_pk: data.targetPctPk,
        target_pct_vk: data.targetPctVk,
        target_pct_mk: data.targetPctMk,
        target_pct_mak: data.targetPctMak,
        target_stroke: data.goalStroke,
        target_distance: String(data.goalDistance),
        target_time_ms: data.goalTimeString ? timeStringToMs(data.goalTimeString) : undefined,
      });

      if (data.baselines.length > 0) {
        await supabase.from("personal_records").upsert(
          data.baselines.map(b => ({
            swimmer_id: swimmer.id,
            stroke: b.stroke,
            distance: String(b.distance),
            best_time_ms: timeStringToMs(b.timeString),
            set_at: new Date().toISOString().split("T")[0],
            is_baseline: true,
          })),
          { onConflict: "swimmer_id,stroke,distance" }
        );
      }

      await supabase
        .from("swimmers")
        .update({ onboarding_done: true })
        .eq("id", swimmer.id);

      setStatus("done");
      reset();
      setTimeout(() => router.replace("/swimmer"), 1500);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  return (
    <View style={s.container}>
      {status === "saving" && (
        <>
          <ActivityIndicator size="large" color="#0EA5E9" style={s.spinner} />
          <Text style={s.text}>Tallennetaan tietojasi...</Text>
        </>
      )}
      {status === "done" && (
        <>
          <Text style={s.bigEmoji}>🎯</Text>
          <Text style={s.doneTitle}>Kaikki valmista!</Text>
          <Text style={s.doneText}>
            Lähtötasosi ja tavoitteesi on tallennettu. Hyvää kautta!
          </Text>
        </>
      )}
      {status === "error" && (
        <>
          <Text style={s.bigEmoji}>⚠️</Text>
          <Text style={s.errorTitle}>Tallennus epäonnistui</Text>
          <Text style={s.errorText}>Tarkista nettiyhteys ja yritä uudelleen.</Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  spinner: { marginBottom: 16 },
  text: { color: "#6B7280" },
  bigEmoji: { fontSize: 60, marginBottom: 24 },
  doneTitle: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 8 },
  doneText: { color: "#6B7280", textAlign: "center" },
  errorTitle: { color: "#374151", fontWeight: "600", marginBottom: 8 },
  errorText: { color: "#9CA3AF", fontSize: 14, textAlign: "center" },
});
