import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { AppContainer } from "@/components";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import MenuGrid from "@/components/home/MenuGrid";
import RecentSubmit from "@/components/home/RecentSubmit";
import SettingsModal from "@/components/setting/SettingsModal";
// Wait, the file is components/user/UserAndFacility.tsx but default export is UserAndFacilityModal
// I should check if I need to rename the file or just import from there.
// The file is UserAndFacility.tsx.

import UserAndFacilityModalComponent from "@/components/user/UserAndFacility";
import "@/global.css";
import useTheme from "@/theme";
import { useRouter } from "expo-router";

// This file uses NativeWind/Tailwind classes (className) for layout and theming.
export default function ODKDashboard() {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  // State for User/Facility Modal
  const [userFacilityModalVisible, setUserFacilityModalVisible] = useState(false);
  const [userFacilityRoute, setUserFacilityRoute] = useState<"user" | "facility">("user");

  const route = useRouter();
  const { mode } = useTheme();

  const isDark = mode === "dark";

  const [currentProject, setCurrentProject] = useState({
    name: "SurveilPro",
    subtitle: "Collect health data",
  });

  const handleOpenUserModal = () => {
    setUserFacilityRoute("user");
    setUserFacilityModalVisible(true);
  };

  const handleOpenFacilityModal = () => {
    setUserFacilityRoute("facility");
    setUserFacilityModalVisible(true);
  };

  return (
    <AppContainer className="flex-1">
      <Header
        project={currentProject}
        onInfoPress={() => route.push(`/${"help"}` as never)}
        onSettingsPress={() => setOpenSettingsModal((prev) => !prev)}
        goBack={() => route.replace("/(tabs)")}
      />

      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
          padding: 20,
          paddingBottom: 50,
        }}
      >
        <View className="mb-4 w-full">
          <MenuGrid />
        </View>
        <RecentSubmit />

        <Footer />
      </ScrollView>

      {openSettingsModal && (
        <SettingsModal
          openSettings={() => {
            route.push("/settings");
            setOpenSettingsModal(false);
          }}
          onClose={() => setOpenSettingsModal(false)}
          setOpenEditUserModal={handleOpenUserModal}
          setOpenEditFacility={handleOpenFacilityModal}
        />
      )}

      {/* User & Facility Modal */}
      <UserAndFacilityModalComponent
        visible={userFacilityModalVisible}
        onClose={() => setUserFacilityModalVisible(false)}
        currentRoute={userFacilityRoute}
      />

    </AppContainer>
  );
}
