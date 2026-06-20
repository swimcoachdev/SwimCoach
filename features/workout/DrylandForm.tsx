import { useState } from "react";
import { View, Switch, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { color, space, radius } from "@/constants/theme";
import type { DrylandEntry, DrylandCategory } from "@/types/workout";
import { DRYLAND_CATEGORIES } from "@/types/workout";

interface Props {
  value: DrylandEntry | null;
  onChange: (d: DrylandEntry | null) => void;
}

export function DrylandForm({ value, onChange }: Props) {
  const [enabled, setEnabled] = useState(!!value);

  function toggle(on: boolean) {
    setEnabled(on);
    if (!on) { onChange(null); return; }
    onChange({ duration_min: 60, category: "voima" });
  }

  return (
    <View style={s.box}>
      <View style={s.header}>
        <View>
          <Text variant="bodyStrong" style={s.title}>Kuivaharjoittelu</Text>
          <Text variant="caption" color={color.inkFaint} style={s.subtitle}>Sali, liikkuvuus, koordinaatio</Text>
        </View>
        <Switch value={enabled} onValueChange={toggle} trackColor={{ true: color.primary }} />
      </View>

      {enabled && value && (
        <>
          <Field
            label="Kesto (min)"
            style={s.input}
            value={String(value.duration_min)}
            onChangeText={(v) => onChange({ ...value, duration_min: parseInt(v) || 0 })}
            keyboardType="number-pad"
            placeholder="60"
          />

          <Text variant="label" style={s.label}>Tyyppi</Text>
          <View style={s.chips}>
            {(Object.keys(DRYLAND_CATEGORIES) as DrylandCategory[]).map((cat) => (
              <Chip
                key={cat}
                label={DRYLAND_CATEGORIES[cat]}
                active={value.category === cat}
                onPress={() => onChange({ ...value, category: cat })}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: { backgroundColor: color.bg, borderRadius: radius.lg, padding: space.lg, marginBottom: space.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  title: { fontSize: 15 },
  subtitle: { marginTop: 2 },
  label: { marginBottom: 6 },
  input: { marginBottom: space.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
});
