import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, StyleSheet
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCompetitionDetail, useSaveCompetitionResult } from "@/lib/queries/competitions";
import { useSeasonSummary } from "@/lib/queries/swimmers";
import { groupResultsBySwimmer } from "@/features/competition/competitions.lib";
import { useCoachContext } from "@/hooks/useCoachContext";
import { timeStringToMs, msToTimeString } from "@/lib/utils/time";
import { STROKES, RACE_DISTANCES, type SwimStroke, type RaceDistance } from "@/constants/strokes";

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

  const competition = competitionQ.data;
  const swimmers = swimmersQ.data ?? [];

  const [modalVisible, setModalVisible] = useState(false);
  const [entry, setEntry] = useState<Partial<ResultEntry>>({ stroke: "vapaa", distance: 100, timeString: "" });
  const [saveError, setSaveError] = useState("");

  function openModal(swimmerId?: string, swimmerName?: string) {
    setEntry({ swimmerId, swimmerName, stroke: "vapaa", distance: 100, timeString: "", placeOverall: "" });
    setSaveError("");
    setModalVisible(true);
  }

  async function saveResult() {
    if (!entry.swimmerId || !entry.timeString?.trim()) {
      setSaveError("Täytä kaikki pakolliset kentät"); return;
    }
    const timeMs = timeStringToMs(entry.timeString);
    if (timeMs <= 0) { setSaveError("Tarkista aika-formaatti (esim. 1:02.45)"); return; }
    if (!competition) return;

    setSaveError("");
    try {
      await saveResultMutation.mutateAsync({
        competitionId: id!,
        competitionDate: competition.competition_date,
        swimmerId: entry.swimmerId,
        stroke: entry.stroke!,
        distance: String(entry.distance),
        resultTimeMs: timeMs,
        placeOverall: entry.placeOverall ? parseInt(entry.placeOverall) : undefined,
      });
      setModalVisible(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Tallennus epäonnistui");
    }
  }

  if (competitionQ.isLoading || !competition) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );

  const results = competition.competition_results ?? [];
  const bySwimmer = groupResultsBySwimmer(results);

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Kilpailut</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={s.headerInfo}>
            <Text style={s.headerTitle}>{competition?.name}</Text>
            <Text style={s.headerMeta}>
              {competition?.competition_date}
              {competition?.location ? " · " + competition.location : ""}
            </Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => openModal()}>
            <Text style={s.addBtnText}>+ Tulos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll}>
        {/* Pikavalinnat */}
        {swimmers.length > 0 && (
          <View style={s.quickSection}>
            <Text style={s.sectionLabel}>LISÄÄ TULOS UIMARILLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.chipRow}>
                {swimmers.map(sw => (
                  <TouchableOpacity
                    key={sw.swimmer_id}
                    style={s.swimmerChip}
                    onPress={() => openModal(sw.swimmer_id, sw.full_name)}
                  >
                    <Text style={s.swimmerChipText}>{sw.full_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Tulokset */}
        {bySwimmer.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📋</Text>
            <Text style={s.emptyText}>Ei tuloksia vielä. Lisää ensimmäinen tulos yllä.</Text>
          </View>
        ) : (
          bySwimmer.map(({ swimmerId: sid, name, results: sResults }) => (
            <View key={sid} style={s.card}>
              <Text style={s.cardName}>{name}</Text>
              {sResults.map((r) => {
                const isPR = r.is_personal_best;
                const label = r.distance + "m " + (STROKES[r.stroke as SwimStroke]?.short ?? r.stroke);
                return (
                  <View key={r.id} style={s.resultRow}>
                    <Text style={s.resultLabel}>{label}</Text>
                    {r.place_overall && (
                      <Text style={s.placeText}>#{r.place_overall}</Text>
                    )}
                    <Text style={[s.timeText, isPR && s.timeTextPR]}>
                      {msToTimeString(r.result_time_ms)}
                    </Text>
                    {isPR && <Text style={s.prBadge}>PR</Text>}
                  </View>
                );
              })}
              <TouchableOpacity style={s.addResultBtn} onPress={() => openModal(sid, name)}>
                <Text style={s.addResultText}>+ Lisää suoritus</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={s.modal} keyboardShouldPersistTaps="handled">
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Lisää tulos</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {!entry.swimmerId ? (
              <>
                <Text style={s.fieldLabel}>Uimari</Text>
                <ScrollView style={{ maxHeight: 180 }}>
                  {swimmers.map(sw => (
                    <TouchableOpacity
                      key={sw.swimmer_id}
                      style={s.swimmerRow}
                      onPress={() => setEntry(e => ({ ...e, swimmerId: sw.swimmer_id, swimmerName: sw.full_name }))}
                    >
                      <Text style={s.swimmerRowText}>{sw.full_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <View style={s.selectedSwimmer}>
                <Text style={s.selectedName}>{entry.swimmerName}</Text>
                <TouchableOpacity onPress={() => setEntry(e => ({ ...e, swimmerId: undefined, swimmerName: undefined }))}>
                  <Text style={s.changeText}>vaihda</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={s.fieldLabel}>Laji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
              <View style={s.chipRow}>
                {STROKE_LIST.map(([str, info]) => (
                  <TouchableOpacity
                    key={str}
                    onPress={() => setEntry(e => ({ ...e, stroke: str }))}
                    style={[s.chip, entry.stroke === str && s.chipActive]}
                  >
                    <Text style={[s.chipText, entry.stroke === str && s.chipTextActive]}>{info.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={s.fieldLabel}>Matka</Text>
            <View style={s.distRow}>
              {RACE_DISTANCES.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setEntry(e => ({ ...e, distance: d }))}
                  style={[s.chip, entry.distance === d && s.chipActive]}
                >
                  <Text style={[s.chipText, entry.distance === d && s.chipTextActive]}>{d}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>Aika *</Text>
            <TextInput
              style={s.textInput}
              placeholder="esim. 2:05.34 tai 58.22"
              value={entry.timeString}
              onChangeText={v => setEntry(e => ({ ...e, timeString: v }))}
              keyboardType="numeric"
              autoFocus
            />

            <Text style={s.fieldLabel}>Sijoitus (valinnainen)</Text>
            <TextInput
              style={[s.textInput, { marginBottom: 8 }]}
              placeholder="esim. 3"
              value={entry.placeOverall}
              onChangeText={v => setEntry(e => ({ ...e, placeOverall: v }))}
              keyboardType="number-pad"
            />

            {saveError ? <Text style={s.errorText}>{saveError}</Text> : null}

            <TouchableOpacity
              style={[s.saveBtn, (!entry.swimmerId || !entry.timeString) && s.saveBtnDisabled]}
              onPress={saveResult}
              disabled={saveResultMutation.isPending || !entry.swimmerId || !entry.timeString}
            >
              {saveResultMutation.isPending
                ? <ActivityIndicator color="#fff" />
                : <Text style={[s.saveBtnText, (!entry.swimmerId || !entry.timeString) && s.saveBtnTextDisabled]}>
                    Tallenna tulos
                  </Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  backBtn: { marginBottom: 8 },
  backText: { color: "#0EA5E9", fontSize: 14 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  headerInfo: { flex: 1, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerMeta: { color: "#9CA3AF", fontSize: 14, marginTop: 2 },
  addBtn: { backgroundColor: "#0EA5E9", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  quickSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 8, fontWeight: "500" },
  chipRow: { flexDirection: "row", gap: 8 },
  swimmerChip: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  swimmerChipText: { fontSize: 14, fontWeight: "500", color: "#374151" },
  empty: { backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: "#9CA3AF", fontSize: 14, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardName: { fontWeight: "600", fontSize: 16, marginBottom: 12 },
  resultRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  resultLabel: { flex: 1, fontSize: 14, color: "#374151" },
  placeText: { fontSize: 12, color: "#9CA3AF", marginRight: 12 },
  timeText: { fontWeight: "700", fontSize: 14, color: "#0EA5E9" },
  timeTextPR: { color: "#22C55E" },
  prBadge: { fontSize: 12, color: "#86EFAC", marginLeft: 4 },
  addResultBtn: { marginTop: 8, paddingVertical: 6, alignItems: "center" },
  addResultText: { color: "#0EA5E9", fontSize: 14 },
  modal: { flex: 1, backgroundColor: "#fff" },
  modalContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  closeBtn: { color: "#9CA3AF", fontSize: 18 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginTop: 4 },
  swimmerRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  swimmerRowText: { fontSize: 16, color: "#374151" },
  selectedSwimmer: { backgroundColor: "#EFF6FF", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectedName: { fontWeight: "600", color: "#1D4ED8" },
  changeText: { color: "#93C5FD", fontSize: 14 },
  chipScroll: { marginBottom: 16 },
  distRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  chipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  chipText: { fontWeight: "500", fontSize: 14, color: "#374151" },
  chipTextActive: { color: "#fff" },
  textInput: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: "#fff", marginBottom: 16 },
  errorText: { color: "#EF4444", fontSize: 14, marginBottom: 12 },
  saveBtn: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  saveBtnDisabled: { backgroundColor: "#E5E7EB" },
  saveBtnText: { fontWeight: "700", fontSize: 16, color: "#fff" },
  saveBtnTextDisabled: { color: "#9CA3AF" },
});
