"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  getAuthClient,
  getGoogleProvider,
  type FirebaseUser,
} from "@/lib/firebase-client";

type AuthContextValue = {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let attempts = 0;
    const start = () => {
      const auth = getAuthClient();
      if (!auth) {
        attempts += 1;
        if (attempts > 10) {
          setLoading(false);
          return;
        }
        setTimeout(start, 200);
        return;
      }
      unsubscribe = auth.onAuthStateChanged((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    };
    start();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async () => {
        const auth = getAuthClient();
        const provider = getGoogleProvider();
        if (!auth || !provider) return;
        await auth.signInWithPopup(provider);
      },
      signOutUser: async () => {
        const auth = getAuthClient();
        if (!auth) return;
        await auth.signOut();
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
