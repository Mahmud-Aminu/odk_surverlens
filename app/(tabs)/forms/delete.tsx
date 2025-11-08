import { AppButton, AppContainer, AppText } from "@/components";
import { DynamicHeader } from "@/components/home/Header";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useForm } from "../../../context/FormContext";

const DeleteFormScreen = () => {
  const [currentRoute, setCurrentRoute] = useState<string>("blank");
  const route = useRouter();
  const {
    finalizedForms,
    downloadedForms,
    setFinalizedForms,
    setDownloadedForms,
  } = useForm();
  const mockData = [
    { id: 1, title: "Imeddiate AFP case notification form" },
    { id: 5, title: "Imeddiate AFP case notification form" },
    { id: 4, title: "Imeddiate AFP case notification form" },
    { id: 3, title: "Imeddiate AFP case notification form" },
    { id: 2, title: "Imeddiate AFP case notification form" },
  ];
  return (
    <AppContainer className="flex-1">
      <DynamicHeader
        currentRoute={"Delete form"}
        goBack={() => route.replace("/(tabs)")}
        onInfoPress={() => route.push(`/${"help"}` as never)}
        onSettingsPress={() => route.push("/settings")}
      />
      <View className="flex flex-row items-center justify-around pt-6 border-b">
        <Pressable
          onPress={() => setCurrentRoute("save")}
          className={`${currentRoute === "save" && "border-b-2 border-[#0a7ea4]"}`}
        >
          <AppText type="subheading">Save Form </AppText>
        </Pressable>
        <Pressable
          onPress={() => setCurrentRoute("blank")}
          className={` ${currentRoute === "blank" && "border-b-2 border-[#0a7ea4]"}`}
        >
          <AppText type="subheading">Blank Form </AppText>
        </Pressable>
      </View>
      {finalizedForms.length === 0 && currentRoute === "save" ? (
        <View className="items-center my-auto">
          <Feather
            name="download"
            size={hp(15)}
            className="text-gray-700 font-bold"
          />
          <AppText className=" text-center py-2">
            No available finalize forms to delete.
          </AppText>
          <AppText className=" text-center py-2">
            Finalize forms to delete.
          </AppText>
        </View>
      ) : (
        <View className="space-y-3">
          {currentRoute === "save" &&
            finalizedForms.map((final, i) => (
              <View
                key={i}
                className="p-4 border ${borderClass} rounded-lg flex justify-between items-center"
              >
                <View>
                  <AppText className="font-medium">
                    {final.form.id} - Finalized
                  </AppText>
                  <AppText className="text-sm">
                    Finalized: {final.finalizedDate}
                  </AppText>
                </View>
                <AppButton
                  onPress={() => {
                    setFinalizedForms(
                      finalizedForms.filter((_, index) => index !== i)
                    );
                    alert("Finalized form deleted");
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm"
                >
                  Delete
                </AppButton>
              </View>
            ))}
        </View>
      )}
      {downloadedForms.length === 0 && currentRoute === "blank" ? (
        <View className="items-center my-auto">
          <Feather
            name="download"
            size={hp(15)}
            className="text-gray-700 font-bold"
          />
          <AppText className=" text-center py-2">
            No available forms to delete.
          </AppText>
        </View>
      ) : (
        <View className="space-y-3 pt-4 px-4">
          {currentRoute === "blank" &&
            downloadedForms.map((form, i) => (
              <View
                key={i}
                className="p-4 border ${borderClass} rounded-lg flex flex-row justify-between items-center"
              >
                <View>
                  <AppText type="subheading">{form.id} - Draft</AppText>
                  <AppText className="text-sm">{form.title}</AppText>
                </View>
                <AppButton
                  onPress={() => {
                    setDownloadedForms(
                      downloadedForms.filter((_, index) => index !== i)
                    );
                    alert("Draft deleted");
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm"
                >
                  Delete
                </AppButton>
              </View>
            ))}
        </View>
      )}
    </AppContainer>
  );
};

export default DeleteFormScreen;
