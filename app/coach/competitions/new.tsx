import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useCreateCompetition } from "@/lib/queries/competitions";

const BRAND = "#0EA5E9";
const LEVELS = ["seura", "piiri", "SM", "kansainvälinen"];

export default function NewCompetitionScreen() {
  const router = useRouter();
  const { clubId } = useCoachContext();
  const createCompetition = useCreateCompetition();

  const [name, setName]         = useState("");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [level, setLevel]       = useState("seura");
  const [error, setError]       = useState("");

  async function save() {
    if (!name.trim()) { setError("Syötä kilpailun nimi."); return; }
    if (!clubId) { setError("Seura ei löydy."); return; }
    setError("");
    try {
      const created = await createCompetition.mutateAsync({
        club_id: clubId, name: name.trim(), competition_date: date,
        location: location.trim() || undefined, level,
      });
      router.replace(`/coach/competitions/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tallennus epäonnistui.");
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => router.back()} style={s.back}>
        <Text style={s.backText}>← Takaisin</Text>
      </TouchableOpacity>
      <Text style={s.title}>Uusi kilpailu</Text>

      <Text style={s.label}>Kilpailun nimi *</Text>
      <TextInput style={s.input} placeholder="esim. SM-kisat 2026" value={name} onChangeText={setName} />

      <Text style={s.label}>Päivämäärä *</Text>
      <TextInput style={s.input} placeholder="vvvv-kk-pp" value={date} onChangeText={setDate} keyboardType="numeric" />

      <Text style={s.label}>Paikka</Text>
      <TextInput style={s.input} placeholder="esim. Helsinki" value={location} onChangeText={setLocation} />

      <Text style={s.label}>Taso</Text>
      <View style={s.levelRow}>
        {LEVELS.map((l) => (
          <TouchableOpacity key={l} style={[s.levelBtn, level === l && s.levelBtnActive]} onPress={() => setLevel(l)}>
            <Text style={[s.levelBtnText, level === l && s.levelBtnTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

      <TouchableOpacity style={s.saveBtn} onPress={save} disabled={createCompetition.isPending}>
        <Text style={s.saveBtnText}>{createCompetition.isPending ? "Luodaan..." : "Luo kilpailu → syötä tulokset"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  back: { marginBottom: 16 },
  backText: { color: BRAND, fontSize: 14 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 15, color: "#0F172A", marginBottom: 20 },
  levelRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 32 },
  levelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "#fff" },
  levelBtnActive: { backgroundColor: BRAND, borderColor: BRAND },
  levelBtnText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  levelBtnTextActive: { color: "#fff" },
  errorBox: { backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: "#DC2626", fontSize: 13 },
  saveBtn: { backgroundColor: BRAND, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
