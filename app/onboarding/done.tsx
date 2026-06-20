import { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AlertTriangle, Target } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { PaceClock } from "@/components/ui/PaceClock";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useSaveOnboarding } from "@/lib/queries/onboarding";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { color, space } from "@/constants/theme";

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
    <Screen insetTop insetBottom center background={color.surface} style={s.root}>
      {status === "saving" && (
        <>
          <PaceClock size={48} />
          <Text variant="body" color={color.inkMuted}>Tallennetaan tietojasi...</Text>
        </>
      )}
      {status === "done" && (
        <View style={s.block}>
          <Target size={60} color={color.primary} strokeWidth={2} />
          <Text variant="title">Kaikki valmista!</Text>
          <Text variant="body" color={color.inkMuted} style={s.center}>
            Lähtötasosi ja tavoitteesi on tallennettu. Hyvää kautta!
          </Text>
        </View>
      )}
      {status === "error" && (
        <View style={s.block}>
          <AlertTriangle size={60} color={color.accent} strokeWidth={2} />
          <Text variant="heading">Tallennus epäonnistui</Text>
          <Text variant="caption" color={color.inkFaint} style={s.center}>
            Tarkista nettiyhteys ja yritä uudelleen.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  root: { paddingHorizontal: space.xxl },
  block: { alignItems: "center", gap: space.sm },
  center: { textAlign: "center" },
});
