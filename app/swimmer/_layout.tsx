import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { TrendingUp, Waves, Trophy, Target } from "lucide-react-native";
import { TabIcon } from "@/components/ui/TabIcon";
import { color } from "@/constants/theme";

export default function SwimmerLayout() {
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
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={TrendingUp} label="Kehitys" focused={focused} /> }} />
      <Tabs.Screen name="workouts"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Waves} label="Harjoitukset" focused={focused} /> }} />
      <Tabs.Screen name="competitions"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Trophy} label="Kisat" focused={focused} /> }} />
      <Tabs.Screen name="goals"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Target} label="Tavoitteet" focused={focused} /> }} />
    </Tabs>
  );
}
