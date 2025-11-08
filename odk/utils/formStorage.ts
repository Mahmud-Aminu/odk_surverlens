import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveDraft = async (formId: string, data: any) => {
  await AsyncStorage.setItem(`draft-${formId}`, JSON.stringify(data));
};

export const saveFinalized = async (formId: string, data: any) => {
  const timestamp = new Date().toISOString();
  await AsyncStorage.setItem(
    `finalized-${formId}-${timestamp}`,
    JSON.stringify(data)
  );
};
