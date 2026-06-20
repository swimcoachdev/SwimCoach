import { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Waves } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/queries/auth";
import { color, space } from "@/constants/theme";

/** Seed coach account (see seed.sql / CLAUDE.md). Dev-only shortcut. */
const DEV_CREDENTIALS = { email: "coach@swimcoach.test", password: "swimcoach" };

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(creds?: { email: string; password: string }) {
    setLoading(true);
    const { error } = await signIn(creds?.email ?? email, creds?.password ?? password);
    if (error) Alert.alert("Virhe kirjautumisessa", error.message);
    setLoading(false);
  }

  function devLogin() {
    setEmail(DEV_CREDENTIALS.email);
    setPassword(DEV_CREDENTIALS.password);
    submit(DEV_CREDENTIALS);
  }

  return (
    <Screen insetTop insetBottom center background={color.surface} style={s.root}>
      <View style={s.logoWrap}>
        <Waves size={48} color={color.primary} strokeWidth={2} />
        <Text variant="title" color={color.primary}>SwimCoach</Text>
        <Text variant="body" color={color.inkMuted}>Kirjaudu sisään</Text>
      </View>

      <View style={s.form}>
        <Field
          placeholder="Sähköposti"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field placeholder="Salasana" value={password} onChangeText={setPassword} secureTextEntry />
        <Button label="Kirjaudu sisään" onPress={() => submit()} loading={loading} />
        {__DEV__ && (
          <Button label="Dev-kirjautuminen" variant="ghost" onPress={devLogin} disabled={loading} />
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  root: { paddingHorizontal: space.xxl, gap: space.huge },
  logoWrap: { alignItems: "center", gap: space.xs },
  form: { alignSelf: "stretch", gap: space.md },
});
