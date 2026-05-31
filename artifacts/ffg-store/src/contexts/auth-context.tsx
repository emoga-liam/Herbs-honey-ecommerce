import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error("Firebase not configured");
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: name });
    setUser({ ...newUser, displayName: name });
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error("Firebase not configured");
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured: isFirebaseConfigured,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
