import { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { SetBuilder } from "@/features/workout/SetBuilder";
import { DrylandForm } from "@/features/workout/DrylandForm";
import { AttendanceList } from "@/features/workout/AttendanceList";
import { useNewWorkoutStore } from "@/features/workout/useNewWorkoutStore";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useClubGroups, getGroupMembers } from "@/lib/queries/groups";
import { useSaveWorkout } from "@/lib/queries/workouts";
import { color, space, radius } from "@/constants/theme";

type Step = "sets" | "dryland" | "attendance" | "confirm";
const STEPS: { key: Step; label: string }[] = [
  { key: "sets",       label: "Setit" },
  { key: "dryland",    label: "Kuiva" },
  { key: "attendance", label: "Läsnäolo" },
  { key: "confirm",    label: "Tallenna" },
];

export default function NewWorkoutScreen() {
  const router = useRouter();
  const { clubId, coachId } = useCoachContext();
  const store = useNewWorkoutStore();
  const saveWorkout = useSaveWorkout();

  const [step, setStep] = useState<Step>("sets");
  const [saveError, setSaveError] = useState("");

  const groupsQ = useClubGroups(clubId ?? undefined);
  const groups = groupsQ.data ?? [];
  const totalPoolM = store.sets.reduce((s, e) => s + e.repetitions * e.distance_m, 0);
  const stepIdx = STEPS.findIndex(s => s.key === step);

  async function selectGroup(gid: string) {
    store.setGroupId(gid);
    const { data } = await getGroupMembers(gid);
    if (data) {
      const members = data as { swimmer_id: string; swimmers: { full_name: string } | null }[];
      store.setAttendees(
        members.map((m) => ({
          swimmer_id: m.swimmer_id,
          full_name: m.swimmers?.full_name ?? "Tuntematon",
          present: true,
        })),
      );
    }
  }

  async function save() {
    if (store.sets.length === 0) { setSaveError("Lisää vähintään yksi setti."); return; }
    if (!clubId) { setSaveError("Seuraa ei löytynyt."); return; }
    setSaveError("");
    try {
      await saveWorkout.mutateAsync({
        workout: {
          club_id: clubId,
          coach_id: coachId ?? undefined,
          group_id: store.group_id || undefined,
          workout_date: store.date,
          workout_type: store.dryland ? (totalPoolM > 0 ? "yhdistelma" : "kuiva") : "uinti",
          title: store.notes || undefined,
        },
        sets: store.sets.map((s, i) => ({
          set_order: i + 1,
          repetitions: s.repetitions,
          distance_m: s.distance_m,
          stroke: s.stroke,
          intensity_zone: s.intensity_zone,
          description: s.description,
        })),
        dryland: store.dryland
          ? {
              duration_min: store.dryland.duration_min,
              category: store.dryland.category,
              description: store.dryland.description,
            }
          : undefined,
        attendance: store.attendees
          .filter((a) => a.present)
          .map((a) => ({ swimmer_id: a.swimmer_id, actual_pool_m: a.actual_pool_m ?? totalPoolM })),
      });
      store.reset();
      router.replace("/coach");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Tallennus epäonnistui.");
    }
  }

  return (
    <Screen background={color.surface}>
      <Header
        onBack={() => router.back()}
        title="Uusi harjoitus"
        right={totalPoolM > 0 ? <Text variant="caption" color={color.inkFaint}>{totalPoolM}m</Text> : undefined}
      >
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
              <Text variant="caption" color={st.key === step ? color.primary : color.inkFaint}>
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Header>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        {/* VAIHE 1: Setit */}
        {step === "sets" && (
          <>
            <Field
              style={s.fieldGap}
              value={store.date}
              onChangeText={store.setDate}
              placeholder="vvvv-kk-pp"
            />
            {groups.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.fieldGap}>
                <View style={s.chipRow}>
                  {groups.map(g => (
                    <Chip
                      key={g.id}
                      label={g.name}
                      active={store.group_id === g.id}
                      onPress={() => selectGroup(g.id)}
                    />
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
            <Text variant="body" color={color.inkMuted} style={s.stepHint}>Oliko harjoituksessa kuivaosuus?</Text>
            <DrylandForm value={store.dryland} onChange={store.setDryland} />
          </>
        )}

        {/* VAIHE 3: Läsnäolo */}
        {step === "attendance" && (
          <>
            <Text variant="body" color={color.inkMuted} style={s.stepHint}>
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
            <Text variant="heading" style={s.confirmTitle}>Yhteenveto</Text>

            <Card style={s.summaryCard}>
              <Text variant="label">Päivä</Text>
              <Text variant="bodyStrong">{store.date}</Text>
            </Card>

            <Card style={s.summaryCard}>
              <Text variant="label">Setit ({store.sets.length} kpl)</Text>
              {store.sets.map((st) => (
                <Text key={st.id} variant="caption" color={color.inkMuted} style={s.setRow}>
                  {st.repetitions}×{st.distance_m}m {st.stroke} — {st.intensity_zone.toUpperCase()}
                </Text>
              ))}
              <Text variant="bodyStrong" color={color.primary} style={s.totalM}>{totalPoolM}m yhteensä</Text>
            </Card>

            {store.dryland && (
              <Card style={s.summaryCard}>
                <Text variant="label">Kuivaharjoittelu</Text>
                <Text variant="bodyStrong">{store.dryland.duration_min} min · {store.dryland.category}</Text>
              </Card>
            )}

            <Card style={s.summaryCard}>
              <Text variant="label">Läsnä</Text>
              <Text variant="bodyStrong">
                {store.attendees.filter(a => a.present).map(a => a.full_name).join(", ") || "—"}
              </Text>
            </Card>

            <Field
              style={s.notesInput}
              placeholder="Muistiinpanot (valinnainen)"
              value={store.notes}
              onChangeText={store.setNotes}
              multiline
            />

            {saveError ? (
              <View style={s.errorBox}><Text variant="caption" color={color.risk}>{saveError}</Text></View>
            ) : null}
            <Button
              label="Tallenna harjoitus"
              onPress={save}
              loading={saveWorkout.isPending}
              style={s.saveBtn}
            />
          </View>
        )}

        {/* Seuraava-nappi */}
        {step !== "confirm" && (
          <Button
            label={stepIdx < STEPS.length - 2 ? "Seuraava →" : "Tarkista →"}
            onPress={() => {
              const next = STEPS[stepIdx + 1];
              if (next) setStep(next.key);
            }}
            style={s.nextBtn}
          />
        )}
        <View style={s.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  stepRow: { flexDirection: "row", gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.md },
  stepItem: { flex: 1, alignItems: "center", gap: space.xs },
  stepBar: { height: 4, width: "100%", borderRadius: 2 },
  stepBarActive: { backgroundColor: color.primary },
  stepBarDone: { backgroundColor: color.primary, opacity: 0.35 },
  stepBarInactive: { backgroundColor: color.border },
  scroll: { flex: 1 },
  scrollContent: { padding: space.lg },
  fieldGap: { marginBottom: space.md },
  chipRow: { flexDirection: "row", gap: space.sm },
  stepHint: { marginBottom: space.lg },
  confirmTitle: { marginBottom: space.lg },
  summaryCard: { marginBottom: space.md, gap: space.xs },
  setRow: { marginBottom: 2 },
  totalM: { marginTop: space.sm },
  notesInput: { height: 80, textAlignVertical: "top", marginBottom: space.md },
  errorBox: { backgroundColor: color.riskWash, borderRadius: radius.sm, padding: space.md, marginBottom: space.md },
  saveBtn: { marginBottom: space.lg },
  nextBtn: { marginTop: space.lg },
  bottomSpacer: { height: space.xxxl },
});
