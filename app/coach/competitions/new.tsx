import { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Field } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useCreateCompetition } from "@/lib/queries/competitions";
import { color, radius, space } from "@/constants/theme";

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
    <Screen background={color.surface}>
      <Header title="Uusi kilpailu" onBack={() => router.back()} surface={false} />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Field
          label="Kilpailun nimi *"
          placeholder="esim. SM-kisat 2026"
          value={name}
          onChangeText={setName}
        />

        <Field
          label="Päivämäärä *"
          placeholder="vvvv-kk-pp"
          value={date}
          onChangeText={setDate}
          keyboardType="numeric"
        />

        <Field
          label="Paikka"
          placeholder="esim. Helsinki"
          value={location}
          onChangeText={setLocation}
        />

        <View style={s.field}>
          <Text variant="label">Taso</Text>
          <View style={s.levelRow}>
            {LEVELS.map((l) => (
              <Chip key={l} label={l} active={level === l} onPress={() => setLevel(l)} />
            ))}
          </View>
        </View>

        {error ? (
          <View style={s.errorBox}>
            <Text variant="caption" color={color.risk}>{error}</Text>
          </View>
        ) : null}

        <Button
          label={createCompetition.isPending ? "Luodaan..." : "Luo kilpailu → syötä tulokset"}
          onPress={save}
          loading={createCompetition.isPending}
        />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: space.xxl, paddingTop: space.lg, paddingBottom: space.huge, gap: space.lg },
  field: { gap: space.sm },
  levelRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  errorBox: { backgroundColor: color.riskWash, borderRadius: radius.sm, padding: space.md },
});
