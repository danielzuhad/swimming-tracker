import { SplashScreen, Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Dumbbell, Home } from "lucide-react-native";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isLight = colorScheme === "light";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.grey,
        tabBarStyle: Platform.select({
          ios: {},
          android: isLight
            ? {
                height: 70,
                paddingBottom: 6,
                paddingTop: 6,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                backgroundColor: Colors.light.background,
                borderTopWidth: 0,
                elevation: 12,
                shadowColor: Colors.light.grey,
              }
            : {},
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "Programs",
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
