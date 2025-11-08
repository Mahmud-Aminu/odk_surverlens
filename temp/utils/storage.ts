// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("storage save error", err);
  }
};

export const loadData = async (key: string) => {
  try {
    const s = await AsyncStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch (err) {
    console.error("storage load error", err);
    return null;
  }
};
