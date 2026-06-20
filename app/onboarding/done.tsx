import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useSaveOnboarding } from "@/lib/queries/onboarding";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";

export default function OnboardingDone() {
  const router = useRouter();
  const { swimmerId, ready } = useSwimmerContext();
  const { data, reset } = useOnboardingStore();
  const saveOnboarding = useSaveOnboarding();
  const [status, setStatus] = useState<"saving" | "done" | "error">("saving");
  const started = useRef(false);

  // Fire the save exactly once, as soon as the swimmer context resolves.
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (!swimmerId) { setStatus("error"); return; }
    saveOnboarding
      .mutateAsync({ swimmerId, data })
      .then(() => {
        setStatus("done");
        reset();
        setTimeout(() => router.replace("/swimmer"), 1500);
      })
      .catch(() => setStatus("error"));
  }, [ready, swimmerId]);

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
