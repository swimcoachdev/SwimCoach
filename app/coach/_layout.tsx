import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { LayoutGrid, Users, Plus, Trophy, Sparkles } from "lucide-react-native";
import { TabIcon } from "@/components/ui/TabIcon";
import { color } from "@/constants/theme";

const HIDDEN = { href: null } as const;

export default function CoachLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: color.border,
          backgroundColor: color.surface,
        },
      }}
    >
      <Tabs.Screen name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={LayoutGrid} label="Ryhmä" focused={focused} /> }} />
      <Tabs.Screen name="swimmers"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Users} label="Uimarit" focused={focused} /> }} />
      <Tabs.Screen name="workout/new"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Plus} label="Harjoitus" focused={focused} /> }} />
      <Tabs.Screen name="competitions"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Trophy} label="Kisat" focused={focused} /> }} />
      <Tabs.Screen name="copilot"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Sparkles} label="AI" focused={focused} /> }} />

      {/* Piilotetut screenit — ei näy tab-barissa */}
      <Tabs.Screen name="workout/[id]"      options={HIDDEN} />
      <Tabs.Screen name="swimmers/[id]"     options={HIDDEN} />
      <Tabs.Screen name="competitions/new"  options={HIDDEN} />
      <Tabs.Screen name="competitions/[id]" options={HIDDEN} />
    </Tabs>
  );
}
