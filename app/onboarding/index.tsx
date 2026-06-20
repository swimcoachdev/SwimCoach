import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Waves } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { color, space } from "@/constants/theme";

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <Screen insetTop insetBottom center background={color.surface} style={s.root}>
      <View style={s.hero}>
        <Waves size={48} color={color.primary} strokeWidth={2} />
        <Text variant="display">Tervetuloa SwimCoachiin</Text>
        <Text variant="body" color={color.inkMuted}>
          Asetetaan ensin lähtötasosi ja vuositavoitteesi. Tämä kestää noin 2 minuuttia.
        </Text>
      </View>

      <View style={s.buttons}>
        <Button label="Aloitetaan →" onPress={() => router.push("/onboarding/baseline")} />
        <Button label="Ohita toistaiseksi" variant="ghost" onPress={() => router.replace("/swimmer")} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  root: { paddingHorizontal: space.xxl, gap: space.huge },
  hero: { alignSelf: "stretch", gap: space.md },
  buttons: { alignSelf: "stretch", gap: space.md },
});
