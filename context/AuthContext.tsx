import { createContext, useContext } from "react";

export interface AuthCredential {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: string;
  hospital?: string;
  hospital_address?: string;
  number: number;
}
export type AuthContextType = {
  user: AuthCredential | null;
  isLoading: boolean;
};

// The context provides the AuthContextType shape
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
