// === Copilot Refactor Instructions ===
// Goal: Split this monolithic ODK Dashboard component into clean, reusable components.
// 1. Create a folder at: src/components/odk/
// 2. Move the following UI sections into separate files under that folder:
//
//    • Header.tsx — contains the top navigation bar (ODK Collect title, info/settings icons, and theme logic).
//    • InfoBar.tsx — contains the blue info alert bar that shows app version details.
//    • ProjectCard.tsx — displays the current project with the “Change” button.
//    • MenuGrid.tsx — renders the main grid of menu buttons (Fill Blank Form, Edit Saved Form, etc.).
//    • HelpCard.tsx — renders the “Get Help” section at the bottom of the dashboard.
//    • FormEntry.tsx — renders the full form entry screen (inputs, save draft, finalize).
//    • SettingsScreen.tsx — handles theme switching and settings categories.
//    • Footer.tsx — displays “Powered by Open Data Kit” and version number.
//
// 3. Leave only the dashboard page logic (state handling, navigation between sections, and main layout) in this file.
// 4. Replace inline sections with imports from the new components. Example:
//      <Header ... /> <InfoBar ... /> <ProjectCard ... /> <MenuGrid ... /> etc.
// 5. Keep all state logic, form handling functions, and theme handling hooks inside this main Dashboard file.

import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import Footer from "@/components/home/Footer";

import Header from "@/components/home/Header";
import MenuGrid from "@/components/home/MenuGrid";

import { AppContainer } from "@/components";
import RecentSubmit from "@/components/home/RecentSubmit";
import SettingsModal from "@/components/setting/SettingsModal";
import "@/global.css";
import useTheme from "@/theme";
import { useRouter } from "expo-router";

// This file uses NativeWind/Tailwind classes (className) for layout and theming.
export default function ODKDashboard() {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const route = useRouter();
  const { mode } = useTheme();

  const isDark = mode === "dark";

  const [currentProject, setCurrentProject] = useState({
    name: "Health Survey",
    subtitle: "Collect health data",
  });

  return (
    <AppContainer className="flex-1">
      {/* Header (kept as component) */}
      <Header
        project={`${currentProject.name} - ${currentProject.subtitle}`}
        onInfoPress={() => route.push(`/${"help"}` as never)}
        onSettingsPress={() => setOpenSettingsModal((prev) => !prev)}
        goBack={() => route.replace("/(tabs)")}
      />

      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
          padding: 25,
          paddingBottom: 50,
        }}
      >
        <>
          <View className="mb-4 w-full">
            <MenuGrid />
          </View>
          <RecentSubmit />
          {/* <HelpCard onHelp={() => route.push(`/${"help"}` as never)} /> */}
        </>

        <Footer />
      </ScrollView>
      {openSettingsModal && (
        <SettingsModal
          openSettings={() => {
            route.push("/settings");
            setOpenSettingsModal((prev) => !prev);
          }}
          onClose={() => setOpenSettingsModal((prev) => !prev)}
          setOpenEditFacility={() => console.log("openening user modal")}
          setOpenEditUserModal={() => console.log("openening facility modal")}
        />
      )}
    </AppContainer>
  );
}
