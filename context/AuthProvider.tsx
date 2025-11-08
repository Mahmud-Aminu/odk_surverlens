import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AuthContext, AuthCredential } from "./AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthCredential | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedSupervisor = await AsyncStorage.getItem("supervisor");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } else if (storedSupervisor) {
          const parsed = JSON.parse(storedSupervisor);
          setUser(parsed);
        }
      } catch (err) {
        console.error("initializeAuth error", err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
