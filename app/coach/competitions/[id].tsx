import { useState } from "react";
import { View, ScrollView, Modal, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus, X } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Text } from "@/components/ui/Text";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenState } from "@/components/ui/ScreenState";
import { useCompetitionDetail, useSaveCompetitionResult } from "@/lib/queries/competitions";
import { useSeasonSummary } from "@/lib/queries/swimmers";
import { groupResultsBySwimmer } from "@/features/competition/competitions.lib";
import { useCoachContext } from "@/hooks/useCoachContext";
import { timeStringToMs, msToTimeString } from "@/lib/utils/time";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";
import { color, radius, space } from "@/constants/theme";

const STROKE_LIST = Object.entries(STROKES) as [SwimStroke, { label: string; short: string }][];

interface ResultEntry {
  swimmerId: string;
  swimmerName: string;
  stroke: SwimStroke;
  distance: RaceDistance;
  timeString: string;
  placeOverall?: string;
}

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clubId } = useCoachContext();
  const year = new Date().getFullYear();

  const competitionQ = useCompetitionDetail(id);
  const swimmersQ = useSeasonSummary(clubId ?? undefined, year);
  const saveResultMutation = useSaveCompetitionResult();

  const swimmers = swimmersQ.data ?? [];

  const [modalVisible, setModalVisible] = useState(false);
  const [entry, setEntry] = useState<Partial<ResultEntry>>({ stroke: "vapaa", distance: "100", timeString: "" });
  const [saveError, setSaveError] = useState("");

  function openModal(swimmerId?: string, swimmerName?: string) {
    setEntry({ swimmerId, swimmerName, stroke: "vapaa", distance: "100", timeString: "", placeOverall: "" });
    setSaveError("");
    setModalVisible(true);
  }

  async function saveResult() {
    if (!entry.swimmerId || !entry.timeString?.trim()) {
      setSaveError("Täytä kaikki pakolliset kentät"); return;
    }
    const timeMs = timeStringToMs(entry.timeString);
    if (timeMs <= 0) { setSaveError("Tarkista aika-formaatti (esim. 1:02.45)"); return; }
    const competition = competitionQ.data;
    if (!competition) return;

    setSaveError("");
    try {
      await saveResultMutation.mutateAsync({
        competitionId: id!,
        competitionDate: competition.competition_date,
        swimmerId: entry.swimmerId,
        stroke: entry.stroke!,
        distance: entry.distance!,
        resultTimeMs: timeMs,
        placeOverall: entry.placeOverall ? parseInt(entry.placeOverall) : undefined,
      });
      setModalVisible(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Tallennus epäonnistui");
    }
  }

  return (
    <Screen>
      <ScreenState query={competitionQ} errorText="Kilpailua ei löytynyt.">
        {(competition) => {
          const results = competition.competition_results ?? [];
          const bySwimmer = groupResultsBySwimmer(results);
          return (
            <>
              <Header
                onBack={() => router.back()}
                title={competition.name}
                subtitle={
                  competition.competition_date + (competition.location ? " · " + competition.location : "")
                }
                right={
                  <Button
                    label="Tulos"
                    variant="secondary"
                    icon={<Plus size={16} color={color.primary} strokeWidth={2.5} />}
                    onPress={() => openModal()}
                  />
                }
              />

              <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
                {swimmers.length > 0 && (
                  <View style={s.quickSection}>
                    <Text variant="label">Lisää tulos uimarille</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={s.chipRow}>
                        {swimmers.map((sw) => (
                          <Chip
                            key={sw.swimmer_id}
                            label={sw.full_name}
                            onPress={() => openModal(sw.swimmer_id, sw.full_name)}
                          />
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {bySwimmer.length === 0 ? (
                  <EmptyState icon={Plus} text="Ei tuloksia vielä. Lisää ensimmäinen tulos yllä." />
                ) : (
                  bySwimmer.map(({ swimmerId: sid, name, results: sResults }) => (
                    <Card key={sid} style={s.card}>
                      <Text variant="heading" style={s.cardName}>{name}</Text>
                      {sResults.map((r) => {
                        const isPR = r.is_personal_best;
                        const label = r.distance + "m " + (STROKES[r.stroke as SwimStroke]?.short ?? r.stroke);
                        return (
                          <View key={r.id} style={s.resultRow}>
                            <Text variant="body" color={color.inkMuted} style={s.resultLabel}>{label}</Text>
                            {r.place_overall ? (
                              <Text variant="caption" style={s.placeText}>#{r.place_overall}</Text>
                            ) : null}
                            <Text variant="mono" color={isPR ? color.good : color.primary}>
                              {msToTimeString(r.result_time_ms)}
                            </Text>
                            {isPR ? <Text variant="label" color={color.good} style={s.prBadge}>PR</Text> : null}
                          </View>
                        );
                      })}
                      <Button
                        label="Lisää suoritus"
                        variant="ghost"
                        onPress={() => openModal(sid, name)}
                        style={s.addResultBtn}
                      />
                    </Card>
                  ))
                )}
                <View style={s.bottomSpacer} />
              </ScrollView>

              <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
              >
                <Screen background={color.surface}>
                  <ScrollView style={s.modal} keyboardShouldPersistTaps="handled">
                    <View style={s.modalContent}>
                      <View style={s.modalHeader}>
                        <Text variant="title">Lisää tulos</Text>
                        <Button
                          label=""
                          variant="ghost"
                          icon={<X size={20} color={color.inkMuted} />}
                          onPress={() => setModalVisible(false)}
                          style={s.closeBtn}
                        />
                      </View>

                      {!entry.swimmerId ? (
                        <View style={s.field}>
                          <Text variant="label">Uimari</Text>
                          <ScrollView style={s.swimmerList} contentContainerStyle={s.swimmerListContent}>
                            {swimmers.map((sw) => (
                              <Chip
                                key={sw.swimmer_id}
                                label={sw.full_name}
                                onPress={() => setEntry((e) => ({ ...e, swimmerId: sw.swimmer_id, swimmerName: sw.full_name }))}
                              />
                            ))}
                          </ScrollView>
                        </View>
                      ) : (
                        <View style={s.selectedSwimmer}>
                          <Text variant="bodyStrong" color={color.primaryInk}>{entry.swimmerName}</Text>
                          <Button
                            label="vaihda"
                            variant="ghost"
                            onPress={() => setEntry((e) => ({ ...e, swimmerId: undefined, swimmerName: undefined }))}
                            style={s.changeBtn}
                          />
                        </View>
                      )}

                      <View style={s.field}>
                        <Text variant="label">Laji</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={s.chipRow}>
                            {STROKE_LIST.map(([str, info]) => (
                              <Chip
                                key={str}
                                label={info.label}
                                active={entry.stroke === str}
                                onPress={() => setEntry((e) => ({ ...e, stroke: str }))}
                              />
                            ))}
                          </View>
                        </ScrollView>
                      </View>

                      <View style={s.field}>
                        <Text variant="label">Matka</Text>
                        <View style={s.distRow}>
                          {RACE_DISTANCES.map((d) => (
                            <Chip
                              key={d}
                              label={`${d}m`}
                              active={entry.distance === d}
                              onPress={() => setEntry((e) => ({ ...e, distance: d }))}
                            />
                          ))}
                        </View>
                      </View>

                      <Field
                        label="Aika *"
                        placeholder="esim. 2:05.34 tai 58.22"
                        value={entry.timeString}
                        onChangeText={(v) => setEntry((e) => ({ ...e, timeString: v }))}
                        keyboardType="numeric"
                        autoFocus
                        style={s.modalInput}
                      />

                      <Field
                        label="Sijoitus (valinnainen)"
                        placeholder="esim. 3"
                        value={entry.placeOverall}
                        onChangeText={(v) => setEntry((e) => ({ ...e, placeOverall: v }))}
                        keyboardType="number-pad"
                        style={s.modalInput}
                      />

                      {saveError ? (
                        <Text variant="caption" color={color.accent}>{saveError}</Text>
                      ) : null}

                      <Button
                        label="Tallenna tulos"
                        onPress={saveResult}
                        loading={saveResultMutation.isPending}
                        disabled={!entry.swimmerId || !entry.timeString}
                      />
                    </View>
                  </ScrollView>
                </Screen>
              </Modal>
            </>
          );
        }}
      </ScreenState>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: space.lg, paddingTop: space.lg },
  quickSection: { gap: space.sm, marginBottom: space.lg },
  chipRow: { flexDirection: "row", gap: space.sm },
  card: { marginBottom: space.md },
  cardName: { marginBottom: space.md },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border,
  },
  resultLabel: { flex: 1 },
  placeText: { marginRight: space.md },
  prBadge: { marginLeft: space.xs },
  addResultBtn: { marginTop: space.sm },
  bottomSpacer: { height: space.xxxl },
  modal: { flex: 1 },
  modalContent: { paddingHorizontal: space.xxl, paddingTop: space.xxxl, paddingBottom: space.xxxl, gap: space.lg },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closeBtn: { paddingVertical: space.xs, paddingHorizontal: space.xs },
  field: { gap: space.sm },
  swimmerList: { maxHeight: 180 },
  swimmerListContent: { gap: space.sm, alignItems: "flex-start" },
  selectedSwimmer: {
    backgroundColor: color.primaryWash,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  changeBtn: { paddingVertical: space.xs, paddingHorizontal: space.sm },
  distRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  modalInput: { marginBottom: 0 },
});
