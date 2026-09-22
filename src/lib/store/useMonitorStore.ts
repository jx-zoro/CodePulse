import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Monitor } from "../api/types";

interface MonitorState {
  monitors: Monitor[];
  
  addMonitor: (monitor: Monitor) => void;
  updateMonitor: (id: string, updates: Partial<Monitor>) => void;
  removeMonitor: (id: string) => void;
  getMonitorForRequest: (requestId: string) => Monitor | undefined;
}

export const useMonitorStore = create<MonitorState>()(
  persist(
    (set, get) => ({
      monitors: [],

      addMonitor: (monitor) =>
        set((state) => ({ monitors: [...state.monitors, monitor] })),

      updateMonitor: (id, updates) =>
        set((state) => ({
          monitors: state.monitors.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          )
        })),

      removeMonitor: (id) =>
        set((state) => ({
          monitors: state.monitors.filter((m) => m.id !== id)
        })),

      getMonitorForRequest: (requestId) =>
        get().monitors.find(m => m.requestId === requestId)
    }),
    {
      name: "codepulse-monitors-v1",
    }
  )
);
