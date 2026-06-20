import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, TextInput, ActivityIndicator, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SetBuilder } from "@/features/workout/SetBuilder";
import { DrylandForm } from "@/features/workout/DrylandForm";
import { AttendanceList } from "@/features/workout/AttendanceList";
import { useNewWorkoutStore } from "@/features/workout/useNewWorkoutStore";
import { useAuth } from "@/hooks/useAuth";
import { getClubGroups, getGroupMembers } from "@/lib/queries/groups";
import { createWorkout, addPoolSets } from "@/lib/queries/workouts";
import { supabase } from "@/lib/supabase";

type Step = "sets" | "dryland" | "attendance" | "confirm";
const STEPS: { key: Step; label: string }[] = [
  { key: "sets",       label: "Setit" },
  { key: "dryland",    label: "Kuiva" },
  { key: "attendance", label: "Läsnäolo" },
  { key: "confirm",    label: "Tallenna" },
];

export default function NewWorkoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useNewWorkoutStore();

  const [step, setStep] = useState<Step>("sets");
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [clubId, setClubId] = useState("");
  const [coachId, setCoachId] = useState("");

  const totalPoolM = store.sets.reduce((s, e) => s + e.repetitions * e.distance_m, 0);
  const stepIdx = STEPS.findIndex(s => s.key === step);

  useEffect(() => {
    async function init() {
      if (!user) return;
      const { data: u } = await supabase.from("users").select("club_id").eq("id", user.id).single();
      if (!u) return;
      setClubId(u.club_id);
      const { data: c } = await supabase.from("coaches").select("id").eq("user_id", user.id).single();
      if (c) setCoachId(c.id);
      const { data: g } = await getClubGroups(u.club_id);
      if (g) setGroups(g);
    }
    init();
  }, [user]);

  async function selectGroup(gid: string) {
    store.setGroupId(gid);
    const { data } = await getGroupMembers(gid);
    if (data) {
      store.setAttendees(
        data.map((m: any) => ({
          swimmer_id: m.swimmer_id,
          full_name: m.swimmers?.full_name ?? "Tuntematon",
          present: true,
        }))
      );
    }
  }

  async function save() {
    if (store.sets.length === 0) { setSaveError("Lisää vähintään yksi setti."); return; }
    setSaveError("");
    setSaving(true);
    try {
      const { data: workout, error } = await createWorkout({
        club_id: clubId,
        coach_id: coachId || undefined,
        group_id: store.group_id || undefined,
        workout_date: store.date,
        workout_type: store.dryland ? (totalPoolM > 0 ? "yhdistelma" : "kuiva") : "uinti",
        title: store.notes || undefined,
      });
      if (error || !workout) throw error;

      await addPoolSets(store.sets.map((s, i) => ({
        workout_id: workout.id, set_order: i + 1,
        repetitions: s.repetitions, distance_m: s.distance_m,
        stroke: s.stroke, intensity_zone: s.intensity_zone,
        description: s.description,
      })));

      if (store.dryland) {
        await supabase.from("dryland_sessions").insert({
          workout_id: workout.id, duration_min: store.dryland.duration_min,
          category: store.dryland.category, description: store.dryland.description,
        });
      }

      const present = store.attendees.filter(a => a.present);
      if (present.length > 0) {
        await supabase.from("workout_attendance").insert(
          present.map(a => ({
            workout_id: workout.id, swimmer_id: a.swimmer_id,
            actual_pool_m: a.actual_pool_m ?? totalPoolM,
          }))
        );
      }

      store.reset();
      router.replace("/coach");
    } catch (e: any) {
      setSaveError(e?.message ?? "Tallennus epäonnistui.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.cancelBtn}>← Peruuta</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Uusi harjoitus</Text>
          <Text style={s.headerMeta}>{totalPoolM > 0 ? `${totalPoolM}m` : ""}</Text>
        </View>
        {/* Step indicator */}
        <View style={s.stepRow}>
          {STEPS.map((st, i) => (
            <TouchableOpacity
              key={st.key}
              style={s.stepItem}
              onPress={() => i <= stepIdx + 1 && setStep(st.key)}
            >
              <View style={[
                s.stepBar,
                st.key === step ? s.stepBarActive : i < stepIdx ? s.stepBarDone : s.stepBarInactive,
              ]} />
              <Text style={[s.stepLabel, st.key === step && s.stepLabelActive]}>
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        {/* VAIHE 1: Setit */}
        {step === "sets" && (
          <>
            <TextInput
              style={s.dateInput}
              value={store.date}
              onChangeText={store.setDate}
              placeholder="vvvv-kk-pp"
              placeholderTextColor="#94a3b8"
            />
            {groups.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={s.chipRow}>
                  {groups.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={[s.chip, store.group_id === g.id && s.chipActive]}
                      onPress={() => selectGroup(g.id)}
                    >
                      <Text style={[s.chipText, store.group_id === g.id && s.chipTextActive]}>
                        {g.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
            <SetBuilder sets={store.sets} onChange={store.setSets} />
          </>
        )}

        {/* VAIHE 2: Kuivaharjoittelu */}
        {step === "dryland" && (
          <>
            <Text style={s.stepHint}>Oliko harjoituksessa kuivaosuus?</Text>
            <DrylandForm value={store.dryland} onChange={store.setDryland} />
          </>
        )}

        {/* VAIHE 3: Läsnäolo */}
        {step === "attendance" && (
          <>
            <Text style={s.stepHint}>
              Merkitse ketkä olivat paikalla. Napauta nimeä muuttaaksesi metrimäärää.
            </Text>
            <AttendanceList
              attendees={store.attendees}
              totalPoolM={totalPoolM}
              onToggle={store.toggleAttendee}
              onOverride={store.setOverrideM}
            />
          </>
        )}

        {/* VAIHE 4: Yhteenveto */}
        {step === "confirm" && (
          <View>
            <Text style={s.confirmTitle}>Yhteenveto</Text>

            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Päivä</Text>
              <Text style={s.summaryValue}>{store.date}</Text>
            </View>

            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Setit ({store.sets.length} kpl)</Text>
              {store.sets.map((st, i) => (
                <Text key={st.id} style={s.setRow}>
                  {st.repetitions}×{st.distance_m}m {st.stroke} — {st.intensity_zone.toUpperCase()}
                </Text>
              ))}
              <Text style={s.totalM}>{totalPoolM}m yhteensä</Text>
            </View>

            {store.dryland && (
              <View style={s.summaryCard}>
                <Text style={s.summaryLabel}>Kuivaharjoittelu</Text>
                <Text style={s.summaryValue}>{store.dryland.duration_min} min · {store.dryland.category}</Text>
              </View>
            )}

            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Läsnä</Text>
              <Text style={s.summaryValue}>
                {store.attendees.filter(a => a.present).map(a => a.full_name).join(", ") || "—"}
              </Text>
            </View>

            <TextInput
              style={[s.dateInput, { height: 80, textAlignVertical: "top" }]}
              placeholder="Muistiinpanot (valinnainen)"
              placeholderTextColor="#94a3b8"
              value={store.notes}
              onChangeText={store.setNotes}
              multiline
            />

            {saveError ? (
              <View style={s.errorBox}><Text style={s.errorText}>{saveError}</Text></View>
            ) : null}
            <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
              {saving
                ? <ActivityIndicator color="white" />
                : <Text style={s.saveBtnText}>💾 Tallenna harjoitus</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Seuraava-nappi */}
        {step !== "confirm" && (
          <TouchableOpacity
            style={s.nextBtn}
            onPress={() => {
              const next = STEPS[stepIdx + 1];
              if (next) setStep(next.key);
            }}
          >
            <Text style={s.nextBtnText}>
              {stepIdx < STEPS.length - 2 ? "Seuraava →" : "Tarkista →"}
            </Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  cancelBtn: { fontSize: 15, color: "#0EA5E9" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  headerMeta: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
  stepRow: { flexDirection: "row", gap: 8 },
  stepItem: { flex: 1, alignItems: "center" },
  stepBar: { height: 4, width: "100%", borderRadius: 2, marginBottom: 4 },
  stepBarActive: { backgroundColor: "#0EA5E9" },
  stepBarDone: { backgroundColor: "#0EA5E9", opacity: 0.35 },
  stepBarInactive: { backgroundColor: "#e2e8f0" },
  stepLabel: { fontSize: 11, color: "#94a3b8" },
  stepLabelActive: { color: "#0EA5E9", fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  dateInput: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 14,
  },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  chipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  chipText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  chipTextActive: { color: "#ffffff" },
  stepHint: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  confirmTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16 },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: "600", color: "#111827" },
  setRow: { fontSize: 13, color: "#374151", marginBottom: 2 },
  totalM: { fontSize: 15, fontWeight: "700", color: "#0EA5E9", marginTop: 8 },
  nextBtn: {
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
  },
  nextBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
  saveBtn: {
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 16,
  },
  saveBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
  errorBox: { backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: "#DC2626", fontSize: 13 },
});
