import SignatureModal from "@/components/user/SignatureModal";
import useTheme from "@/theme";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  TouchableOpacity,
  View
} from "react-native";
import AppButton from "../common/AppButton";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";
import AppTextInput from "../common/AppTextInput";

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
  visible,
  onClose
}: {
  currentRoute: string; // 'user' or 'facility'
  setEditForm?: () => void;
  setOpenEditUserModal?: () => void;
  setOpenEditFacility?: () => void;
  visible: boolean;
  onClose: () => void;
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

  const router = useRouter();
  const { mode } = useTheme();

  // Reset state when modal opens/closes or route changes
  useEffect(() => {
    if (visible) {
      setStep(0);
      setShowSuccess(false);
      // Load existing data if needed
      AsyncStorage.getItem("userData").then(data => {
        if (data) {
          setFormData(JSON.parse(data));
        }
      });
    }
  }, [visible, currentRoute]);

  const filtered = facilitiesList.filter((f) =>
    f.hname.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setFilteredFacilities(filtered);
  }, [search]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    await AsyncStorage.setItem("userData", JSON.stringify(formData));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <AppCard className="w-full max-w-md max-h-[80%] rounded-2xl" variant="elevated">

          {/* Header with Close Button */}
          <View className="flex-row justify-between items-center mb-4">
            <AppText className="font-bold text-lg capitalize">
              {currentRoute === "user" ? "User Profile" : "Facility Selection"}
            </AppText>
            <TouchableOpacity onPress={onClose} className='p-4'>
              <Feather name="x" size={24} color={mode === "dark" ? "#e5e7eb" : "#374151"} />
            </TouchableOpacity>
          </View>

          {showSuccess ? (
            <View className="items-center py-8">
              {/* Fallback icon if Lottie fails or isn't set up */}
              <View className="mb-4 bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                <Feather name="check" size={48} color="#10b981" />
              </View>
              <AppText className="text-green-600 dark:text-green-400 text-xl font-semibold mt-4 text-center">
                Data saved successfully!
              </AppText>
            </View>
          ) : (
            <>
              {/* Content based on Route and Step */}
              <View className="mb-6">

                {/* USER ROUTE */}
                {currentRoute === "user" && (
                  <View className="gap-4">
                    {/* Name Input */}
                    <View>
                      <AppTextInput
                        label="SPF Name"
                        placeholder="Enter Survey Focal Person Name"
                        value={formData.name}
                        onChangeText={(t) => setFormData({ ...formData, name: t })}
                        leftIcon={<Feather name="user" size={20} color="#9ca3af" />}
                      />
                    </View>

                    {/* Signature Button */}
                    <View>
                      <AppText className="mb-2 font-bold text-gray-700 dark:text-gray-300">Signature</AppText>
                      <TouchableOpacity
                        onPress={() => setOpenSignModal(true)}
                        className="flex-row items-center justify-center gap-3 p-4 border border-dashed border-blue-300 dark:border-blue-700 rounded-xl bg-blue-50 dark:bg-blue-900/10 active:bg-blue-100"
                      >
                        <Feather name="edit-2" size={20} color="#2563eb" />
                        <AppText className="text-blue-600 dark:text-blue-400 font-medium">
                          {formData.sign ? "Update Signature" : "Add Signature (Optional)"}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* FACILITY ROUTE */}
                {currentRoute === "facility" && (
                  <View className="gap-4">
                    <View className="z-10">
                      <AppTextInput
                        label="Search Facility"
                        placeholder="Search by name..."
                        value={search}
                        onChangeText={(t) => {
                          setSearch(t);
                          setShowSuggestion(true);
                        }}
                        onFocus={() => setShowSuggestion(true)}
                        leftIcon={<Feather name="search" size={20} color="#9ca3af" />}
                      />

                      {/* Selected Facility Display */}
                      {formData.hospital.hname ? (
                        <View className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <AppText className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Selected</AppText>
                          <AppText className="font-semibold">{formData.hospital.hname}</AppText>
                          <AppText className="text-xs text-gray-500">{formData.hospital.haddrs}</AppText>
                        </View>
                      ) : null}

                      {/* Suggestions List */}
                      {showSuggestion && search.length > 0 && (
                        <View className="absolute top-[80px] left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-hidden z-50">
                          <FlatList
                            data={filteredFacilities}
                            keyExtractor={(item) => item.hname}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                className="p-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                                onPress={() => {
                                  setFormData({
                                    ...formData,
                                    hospital: {
                                      hname: item.hname,
                                      haddrs: item.address,
                                    },
                                  });
                                  setSearch(""); // clear search logic or keep it? usually clear or set to name
                                  setShowSuggestion(false);
                                }}
                              >
                                <AppText className="font-semibold text-sm">{item.hname}</AppText>
                                <AppText className="text-xs text-gray-500">{item.address}</AppText>
                              </TouchableOpacity>
                            )}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )}

              </View>

              {/* Footer Actions */}
              <View className="flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                {/* 
                   Logic simplified: 
                   If User route: Next -> user details saved (or updated in state)
                   If Facility route: Select -> Save
                 */}

                {currentRoute === "user" ? (
                  <AppButton
                    className="flex-1"
                    variant="primary"
                    onPress={handleSave} // Simplified flow: just save user details directly
                    disabled={!formData.name}
                    isLoading={isSaving}
                  >
                    Save User Details
                  </AppButton>
                ) : (
                  // Facility Mode
                  <AppButton
                    className="flex-1"
                    variant="primary"
                    onPress={handleSave}
                    disabled={!formData.hospital.hname}
                    isLoading={isSaving}
                  >
                    Save Facility
                  </AppButton>
                )}
              </View>

            </>
          )}

        </AppCard>
      </View>

      {/* Nested Signature Modal */}
      {openSignModal && (
        <SignatureModal
          formData={formData}
          setFormData={setFormData} // Pass setter to update signature
          onClose={() => setOpenSignModal(false)}
        />
      )}
    </Modal>
  );
};

export default UserAndFacilityModal;
