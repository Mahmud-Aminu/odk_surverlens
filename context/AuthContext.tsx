import { auth, db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const FACILITY_CACHE_KEY = "@surveilPro_facility";

export interface UserCredential {
    id: string;
    email: string;
}

export type AuthContextType = {
    user: UserCredential | null;
    facility: any | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserCredential | null>(null);
    const [facility, setFacility] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On app open: restore user from Firebase Auth persistence
    // and load facility from AsyncStorage cache (no network needed)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({ id: currentUser.uid, email: currentUser.email || "" });

                // Load facility from cache (offline-first)
                try {
                    const cached = await AsyncStorage.getItem(FACILITY_CACHE_KEY);
                    if (cached) {
                        setFacility(JSON.parse(cached));
                    }
                } catch (err) {
                    console.error("Error loading cached facility:", err);
                }
            } else {
                setUser(null);
                setFacility(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const uid = credential.user.uid;

            // Fetch facility from Firestore (only happens during login)
            const facilityDocRef = doc(db, "facilities", uid);
            const facilityDoc = await getDoc(facilityDocRef);

            if (facilityDoc.exists()) {
                const facilityData = facilityDoc.data();
                setFacility(facilityData);
                // Cache for offline use
                await AsyncStorage.setItem(FACILITY_CACHE_KEY, JSON.stringify(facilityData));
            } else {
                console.warn("Facility document not found for user:", uid);
                setFacility(null);
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setIsLoading(false);
            throw err;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            // Clear cached facility on logout
            await AsyncStorage.removeItem(FACILITY_CACHE_KEY);
            setFacility(null);
        } catch (err) {
            console.error("Logout Error:", err);
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, facility, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
