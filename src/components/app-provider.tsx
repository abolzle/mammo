"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadContent, type LoadedContent } from "@/lib/content/load";
import { ensureProfile, saveProfile } from "@/lib/db";
import type { Profile } from "@/lib/schemas/learner";
import { registerServiceWorker } from "@/lib/offline";

type AppState = {
  ready: boolean;
  error: string | null;
  content: LoadedContent | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (p: Profile) => Promise<void>;
};

const Ctx = createContext<AppState>({
  ready: false,
  error: null,
  content: null,
  profile: null,
  refreshProfile: async () => {},
  updateProfile: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<LoadedContent | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void registerServiceWorker();
    let cancelled = false;
    Promise.all([loadContent(), ensureProfile()])
      .then(([c, p]) => {
        if (cancelled) return;
        setContent(c);
        setProfile(p);
        setReady(true);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        console.error(e);
        setError("Mammo could not load the study library. Check your connection, then refresh the page and try again.");
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      error,
      content,
      profile,
      refreshProfile: async () => setProfile(await ensureProfile()),
      updateProfile: async (p) => {
        await saveProfile(p);
        setProfile(p);
      },
    }),
    [ready, error, content, profile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  return useContext(Ctx);
}
