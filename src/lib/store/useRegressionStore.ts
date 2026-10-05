import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RegressionAlert {
  id: string;
  endpointUrl: string;
  method: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  detectedAt: string;
  metrics: {
    name: string;
    before: string;
    after: string;
    deltaPercent?: number;
  }[];
  recentExecutionId?: string;
  baselineExecutionId?: string;
}

interface RegressionState {
  alerts: RegressionAlert[];
  addAlert: (alert: RegressionAlert) => void;
  updateAlertStatus: (id: string, status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED") => void;
  clearAlerts: () => void;
}

export const useRegressionStore = create<RegressionState>()(
  persist(
    (set) => ({
      alerts: [],
      addAlert: (alert) => set((state) => {
        // Prevent duplicate active alerts for the same endpoint/method
        const exists = state.alerts.find(a => a.endpointUrl === alert.endpointUrl && a.method === alert.method && a.status === "OPEN");
        if (exists) return state;
        return { alerts: [alert, ...state.alerts] };
      }),
      updateAlertStatus: (id, status) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, status } : a)
      })),
      clearAlerts: () => set({ alerts: [] }),
    }),
    {
      name: "codepulse-regression-storage",
    }
  )
);
