import SignatureModal from "@/components/user/SignatureModal";
import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

const { width } = Dimensions.get("window");

const facilitiesList = [
  {
    hname: "Rafin Dadi Maternal and Child Health Clinic",
    address: "Asibitin M. Barau, Rafindadi",
  },
  {
    hname: "Hajiya Murja Mangal Health Clinic",
    address: "Asibitin M. Barau, Rafindadi",
  },
  {
    hname: "K. Dara Clinic",
    address: "Asibitin M. Barau, Rafindadi",
  },
  {
    hname: "Katsina Government House Clinic",
    address: "Asibitin M. Barau, Rafindadi",
  },
  {
    hname: "Makudawa Health Clinic",
    address: "Asibitin M. Barau, Rafindadi",
  },
];

const UserAndFacilityModal = ({
  currentRoute,
  setEditForm,
  setOpenEditFacility,
  setOpenEditUserModal,
}: {
  currentRoute: string;
  setEditForm: () => void;
  setOpenEditUserModal: () => void;
  setOpenEditFacility: () => void;
}) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    sign: "",
    hospital: { hname: "", haddrs: "" },
  });
  const [search, setSearch] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [filteredFacilities, setFilteredFacilities] = useState(facilitiesList);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openSignModal, setOpenSignModal] = useState(false);

  const route = useRouter();

  const { mode } = useTheme();

  const STEP_COUNT = facilitiesList.length;

  const filtered = facilitiesList.filter((f) =>
    f.hname.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setFilteredFacilities(filtered);
  }, [search, filtered]);

  const handleNext = () => {
    if (step < STEP_COUNT - 1) {
      setStep(step + 1);
    }
    console.log(step);
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    await AsyncStorage.setItem("userData", JSON.stringify(formData));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      route.push("/(tabs)/");
    }, 3000);
  };

  const textColor = mode === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <Modal className="flex-1 py-32 items-center">
      {showSuccess ? (
        <AppCard className="flex flex-col items-center w-full">
          <LottieView
            source={require("../../../assets/lottie/Success.json")}
            autoPlay
            loop={false}
            style={{ width: width * 0.6, height: width * 0.6 }}
          />
          <Text className="text-green-600 text-xl font-semibold mt-4">
            Data saved successfully!
          </Text>
        </AppCard>
      ) : (
        <>
          {/* steps */}
          <View className="flex-1 flex-col w-full mt-4 px-2">
            {/* Step 1 */}
            {currentRoute === "user" && (
              <View className="px-6 justify-center items-center space-y-6 w-full">
                {/* Name */}
                <View className="w-full">
                  <AppText
                    //  style={{ color: textColor }}
                    className="block text-sm font-medium mb-2"
                  >
                    SPF Name
                  </AppText>
                  <View className="relative">
                    <View className="absolute left-4 top-1/2 transform -translate-y-1/2 ">
                      <Feather
                        name="user"
                        size={hp(3)}
                        color={mode === "dark" ? "#9ca3af" : "#4b5563"}
                      />
                    </View>

                    <TextInput
                      value={formData.name}
                      onChangeText={(t) =>
                        setFormData({ ...formData, name: t })
                      }
                      placeholderTextColor={
                        mode === "dark" ? "#9ca3af" : "#4b5563"
                      }
                      placeholder="Survey Focal Person Name"
                      className={`w-full pl-12 text-lg pr-12 py-5 rounded-xl ${textColor} border border-[#0a7ea4] focus:border-blue-500 focus:outline-none transition-colors`}
                    />
                  </View>
                </View>
                {/* Signature-btn */}
                <View className="w-full mt-5">
                  <TouchableOpacity
                    onPress={() => setOpenSignModal((prev) => !prev)}
                    className={`flex flex-row justify-center gap-5 items-center w-full px-12 py-5 rounded-xl ${textColor} border border-[#0a7ea4] focus:border-blue-500 focus:outline-none transition-colors`}
                  >
                    <Feather
                      name="tag"
                      size={hp(3)}
                      color={mode === "dark" ? "#9ca3af" : "#4b5563"}
                    />
                    <AppText>Sign (Optional)</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* Step 2 */}
            {currentRoute === "facility" && (
              <View className="px-6 justify-center items-center space-y-6 w-full">
                <View className="w-full">
                  <AppText
                    //  style={{ color: textColor }}
                    className="block text-sm font-medium mb-2"
                  >
                    Choose health facility
                  </AppText>
                  <View className="relative">
                    <View className="absolute left-4 top-1/2 transform -translate-y-1/2 ">
                      <Feather
                        name="search"
                        size={hp(3)}
                        color={mode === "dark" ? "#9ca3af" : "#4b5563"}
                      />
                    </View>

                    <TextInput
                      value={
                        formData.hospital.hname
                          ? formData.hospital.hname
                          : search
                      }
                      onChangeText={(t) => {
                        setSearch(t);
                        setShowSuggestion((prev) => !prev);
                      }}
                      placeholder={"search"}
                      placeholderTextColor={
                        mode === "dark" ? "#9ca3af" : "#4b5563"
                      }
                      className={`w-full pl-12 pr-12 py-5 rounded-xl ${textColor} border border-[#0a7ea4] focus:border-blue-500 focus:outline-none transition-colors`}
                    />
                  </View>
                  {showSuggestion && (
                    <Pressable
                      onPress={() => setShowSuggestion((prev) => !prev)}
                    >
                      <AppCard className="rounded-xl p-4">
                        <FlatList
                          data={filteredFacilities}
                          keyExtractor={(item) => item.hname}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              onPress={() => {
                                setFormData({
                                  ...formData,
                                  hospital: {
                                    hname: item.hname,
                                    haddrs: item.address,
                                  },
                                });
                                setShowSuggestion(false);
                              }}
                              className={`p-3 ${
                                formData.hospital.hname === item.hname
                                  ? "border-blue-600 bg-[#0a7ea4]"
                                  : "border-gray-200"
                              }`}
                            >
                              <AppText className="font-semibold">
                                {item.hname}
                              </AppText>
                            </TouchableOpacity>
                          )}
                          style={{ maxHeight: 160 }}
                        />
                      </AppCard>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>
          {/* bottom navigation tab */}
          <View className="absolute bottom-32 left-0 right-0 px-8 w-full">
            {step === 0 && (
              <View className="items-end">
                <TouchableOpacity
                  className={`py-3 w-2/6 rounded-xl ${
                    formData.name ? "bg-[#0a7ea4]" : "border border-[#0a7ea4]"
                  }`}
                  disabled={!formData.name}
                  onPress={handleNext}
                >
                  <AppText className="text-center font-semibold">Next</AppText>
                </TouchableOpacity>
              </View>
            )}
            {step === 1 && (
              <View className="flex flex-row items-center justify-between w-full">
                <TouchableOpacity
                  className="py-3 w-2/6 rounded-xl bg-[#0a7ea4]"
                  onPress={handleBack}
                >
                  <AppText className="text-center font-semibold">Back</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-3 w-2/6 rounded-xl ${
                    formData.hospital.hname
                      ? "bg-[#0a7ea4]"
                      : "border border-[#0a7ea4]"
                  }`}
                  disabled={!formData.hospital.hname}
                  onPress={handleNext}
                >
                  <AppText className="text-white text-center font-semibold">
                    Next
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
            {step === 2 && (
              <View className="flex flex-row items-center justify-between w-full ">
                <TouchableOpacity
                  className="py-3 w-2/6 rounded-xl bg-[#0a7ea4]"
                  onPress={handleBack}
                >
                  <AppText className="text-white text-center font-semibold">
                    Back
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-3 w-2/6 rounded-xl flex-row justify-center ${
                    formData.hospital.hname
                      ? "bg-[#0a7ea4]"
                      : "border border-[#0a7ea4]"
                  }`}
                  disabled={!formData.hospital.hname || isSaving}
                  onPress={handleSave}
                >
                  {isSaving ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <Text className="text-white font-semibold ml-2">
                        Saving...
                      </Text>
                    </>
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      Finish
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}

      {openSignModal && (
        <SignatureModal
          formData={formData}
          onClose={() => setOpenSignModal((prev) => !prev)}
        />
      )}
    </Modal>
  );
};

export default UserAndFacilityModal;
