import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiTest } from "../api/types";

interface HistoryState {
  tests: ApiTest[];
  addTest: (test: ApiTest) => void;
  removeTest: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      tests: [],
      addTest: (test) =>
        set((state) => {
          // Keep only the last 100 tests to prevent localStorage bloat
          const newTests = [test, ...state.tests].slice(0, 100);
          return { tests: newTests };
        }),
      removeTest: (id) =>
        set((state) => ({ tests: state.tests.filter((t) => t.id !== id) })),
      clearHistory: () => set({ tests: [] }),
    }),
    {
      name: "codepulse-history",
    }
  )
);
