import { useState, useRef, useCallback } from "react";
import {
  View, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet,
} from "react-native";
import { Send } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { askCopilot, COPILOT_SUGGESTIONS, type CopilotMessage } from "@/lib/ai/copilot";
import { color, space, radius } from "@/constants/theme";

export default function CopilotScreen() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const answer = await askCopilot(question);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      }]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Virhe: ${e.message ?? "Yhteysongelma. Yritä uudelleen."}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [input, loading]);

  const isEmpty = messages.length === 0;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Header title="AI Copilot" subtitle="● Online" />

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
        >
          {isEmpty && (
            <View>
              <Card style={styles.welcomeCard}>
                <Text variant="heading">Hei valmentaja 👋</Text>
                <Text variant="body" color={color.inkMuted}>
                  Voin analysoida ryhmäsi harjoittelua, kisatuloksia ja kehitystä.
                  Kysy mitä tahansa suomeksi.
                </Text>
              </Card>
              <Text variant="label" style={styles.suggestLabel}>KOKEILE NÄITÄ</Text>
              {COPILOT_SUGGESTIONS.map((s) => (
                <View key={s} style={styles.suggestRow}>
                  <Chip label={s} onPress={() => send(s)} />
                </View>
              ))}
            </View>
          )}

          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.msgRow, m.role === "user" ? styles.msgRowUser : styles.msgRowAssistant]}
            >
              {m.role === "assistant" && (
                <Text variant="caption" color={color.inkFaint} style={styles.msgMetaLabel}>Copilot</Text>
              )}
              <View style={[
                styles.bubble,
                m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
              ]}>
                <Text variant="body" color={m.role === "user" ? color.onPrimary : color.ink}>
                  {m.content}
                </Text>
              </View>
              <Text variant="caption" color={color.inkFaint} style={styles.msgTime}>
                {m.timestamp.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={styles.msgRowAssistant}>
              <Text variant="caption" color={color.inkFaint} style={styles.msgMetaLabel}>Copilot</Text>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.bubbleLoading]}>
                <ActivityIndicator size="small" color={color.primary} />
                <Text variant="body" color={color.inkMuted}>Analysoidaan...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputArea}>
          {!isEmpty && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
              <View style={styles.quickChips}>
                {COPILOT_SUGGESTIONS.slice(0, 3).map(s => (
                  <Chip
                    key={s}
                    label={s.length > 30 ? s.slice(0, 28) + "…" : s}
                    onPress={() => send(s)}
                  />
                ))}
              </View>
            </ScrollView>
          )}
          <View style={styles.inputRow}>
            <Field
              containerStyle={styles.textInput}
              style={styles.textInputBox}
              placeholder="Kysy ryhmästäsi..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send()}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <Button
              label="Lähetä"
              icon={<Send size={18} color={color.onPrimary} />}
              onPress={() => send()}
              disabled={!input.trim() || loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm },

  // Welcome
  welcomeCard: { marginBottom: space.xl, gap: space.xs },
  suggestLabel: { marginBottom: space.sm, marginLeft: space.xs },
  suggestRow: { alignItems: "flex-start", marginBottom: space.sm },

  // Messages
  msgRow: { marginBottom: space.md },
  msgRowUser: { alignItems: "flex-end" },
  msgRowAssistant: { alignItems: "flex-start" },
  msgMetaLabel: { marginBottom: space.xs },
  bubble: { borderRadius: radius.lg, paddingHorizontal: space.lg, paddingVertical: space.md, maxWidth: "85%" },
  bubbleUser: { backgroundColor: color.primary, borderTopRightRadius: space.xs },
  bubbleAssistant: {
    backgroundColor: color.surface,
    borderTopLeftRadius: space.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
  },
  bubbleLoading: { flexDirection: "row", alignItems: "center", gap: space.sm },
  msgTime: { marginTop: space.xs, marginHorizontal: space.xs },

  // Input
  inputArea: {
    backgroundColor: color.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  quickRow: { marginBottom: space.sm },
  quickChips: { flexDirection: "row", gap: space.sm },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: space.sm },
  textInput: { flex: 1 },
  textInputBox: { maxHeight: 100 },
});
