import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isConfigured =
  !!import.meta.env.VITE_FIREBASE_API_KEY && !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

async function getFirebase() {
  return import("@/lib/firebase");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void getFirebase().then((fb) => {
      if (cancelled || !fb.auth) {
        setIsLoading(false);
        return;
      }

      setAuthTokenGetter(() => fb.auth?.currentUser?.getIdToken() ?? null);

      // Handle redirect result (Google sign-in via redirect flow)
      fb.getRedirectResult(fb.auth).catch(() => null);

      unsubscribe = fb.onAuthStateChanged(fb.auth, (u) => {
        setUser(u);
        setIsLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const fb = await getFirebase();
    if (!fb.auth) throw new Error("Firebase not configured");
    const { user: newUser } = await fb.createUserWithEmailAndPassword(fb.auth, email, password);
    await fb.updateProfile(newUser, { displayName: name });
    await fb.sendEmailVerification(newUser).catch(() => null);
    setUser({ ...newUser, displayName: name });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const fb = await getFirebase();
    if (!fb.auth) throw new Error("Firebase not configured");
    await fb.signInWithEmailAndPassword(fb.auth, email, password);
  };

  const signInWithGoogle = async () => {
    const fb = await getFirebase();
    if (!fb.auth || !fb.googleProvider) throw new Error("Firebase not configured");
    try {
      await fb.signInWithPopup(fb.auth, fb.googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/unauthorized-domain") {
        throw new Error(
          "This domain is not authorized in Firebase. Go to Firebase Console → Authentication → Settings → Authorized domains and add your site's domain."
        );
      }
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        await fb.signInWithRedirect(fb.auth, fb.googleProvider);
      } else {
        throw err;
      }
    }
  };

  const resetPassword = async (email: string) => {
    const fb = await getFirebase();
    if (!fb.auth) throw new Error("Firebase not configured");
    await fb.sendPasswordResetEmail(fb.auth, email);
  };

  const resendVerification = async () => {
    const fb = await getFirebase();
    if (!fb.auth?.currentUser) throw new Error("Not logged in");
    await fb.sendEmailVerification(fb.auth.currentUser);
  };

  const logout = async () => {
    const fb = await getFirebase();
    if (!fb.auth) return;
    await fb.signOut(fb.auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        resetPassword,
        resendVerification,
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
