import { useEffect } from "react";
import { Platform, View, Dimensions, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { SairaCondensed_600SemiBold, SairaCondensed_700Bold } from "@expo-google-fonts/saira-condensed";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import { SplineSansMono_500Medium } from "@expo-google-fonts/spline-sans-mono";
import { useAuth } from "@/hooks/useAuth";
import { color } from "@/constants/theme";

const screenW = Dimensions.get("window").width;
const MAX_W = screenW >= 1280 ? screenW * 0.85 : screenW >= 1024 ? screenW * 0.90 : screenW >= 640 ? 640 : 480;

export default function RootLayout() {
  const { session, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    SairaCondensed_600SemiBold,
    SairaCondensed_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    SplineSansMono_500Medium,
  });

  useEffect(() => {
    if (loading) return;
    const inAuth    = segments[0] === "auth";
    const inCoach   = segments[0] === "coach";
    const inSwimmer = segments[0] === "swimmer";
    const isCoach   = role === "coach" || role === "club_admin";

    if (!session && !inAuth) {
      router.replace("/auth/login");
    } else if (session && inAuth) {
      router.replace(isCoach ? "/coach" : "/swimmer");
    } else if (session && !inAuth) {
      if (isCoach && !inCoach) router.replace("/coach");
      if (!isCoach && role && !inSwimmer) router.replace("/swimmer");
    }
  }, [session, role, loading, segments]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.bg }}>
        <ActivityIndicator color={color.primary} />
      </View>
    );
  }

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="coach" />
      <Stack.Screen name="swimmer" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, backgroundColor: color.border, alignItems: "center" }}>
        <View style={{
          width: "100%",
          maxWidth: MAX_W,
          flex: 1,
          backgroundColor: color.bg,
          boxShadow: "0 0 40px rgba(11,42,58,0.10)",
        }}>
          {stack}
        </View>
      </View>
    );
  }

  return stack;
}
