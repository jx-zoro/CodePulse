import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PerformanceSample, PerformanceBaseline } from "../api/types";

interface PerformanceState {
  samples: PerformanceSample[];
  baselines: PerformanceBaseline[];
  
  addSample: (sample: PerformanceSample) => void;
  getSamplesForRequest: (requestId: string) => PerformanceSample[];
  
  calculateBaseline: (requestId: string) => void;
  getBaselineForRequest: (requestId: string) => PerformanceBaseline | undefined;
  
  clearHistory: (requestId?: string) => void;
}

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set, get) => ({
      samples: [],
      baselines: [],

      addSample: (sample) => {
        set((state) => {
          // Keep only last 100 samples per request to avoid huge storage
          const requestSamples = [...state.samples, sample].filter(s => s.requestId === sample.requestId);
          const otherSamples = state.samples.filter(s => s.requestId !== sample.requestId);
          
          if (requestSamples.length > 100) {
            requestSamples.shift();
          }
          
          return { samples: [...otherSamples, ...requestSamples] };
        });
        
        // Auto-recalculate baseline after every 10 samples
        const reqSamples = get().samples.filter(s => s.requestId === sample.requestId);
        if (reqSamples.length % 10 === 0 && reqSamples.length > 0) {
          get().calculateBaseline(sample.requestId);
        }
      },

      getSamplesForRequest: (requestId) => {
        return get().samples.filter(s => s.requestId === requestId);
      },

      calculateBaseline: (requestId) => {
        const samples = get().samples.filter(s => s.requestId === requestId);
        if (samples.length === 0) return;

        const sortedTimes = samples.map(s => s.totalTime).sort((a, b) => a - b);
        const count = sortedTimes.length;
        
        const p50 = sortedTimes[Math.floor(count * 0.50)] || 0;
        const p95 = sortedTimes[Math.floor(count * 0.95)] || 0;
        const p99 = sortedTimes[Math.floor(count * 0.99)] || 0;
        
        const sum = sortedTimes.reduce((acc, val) => acc + val, 0);
        const average = sum / count;
        
        const successCount = samples.filter(s => s.success).length;
        const successRate = successCount / count;
        const errorRate = 1 - successRate;

        const newBaseline: PerformanceBaseline = {
          requestId,
          p50,
          p95,
          p99,
          average,
          sampleCount: count,
          successRate,
          errorRate,
          lastCalculated: new Date().toISOString()
        };

        set((state) => ({
          baselines: [
            ...state.baselines.filter(b => b.requestId !== requestId),
            newBaseline
          ]
        }));
      },

      getBaselineForRequest: (requestId) => {
        return get().baselines.find(b => b.requestId === requestId);
      },
      
      clearHistory: (requestId) => {
        set((state) => ({
          samples: requestId ? state.samples.filter(s => s.requestId !== requestId) : [],
          baselines: requestId ? state.baselines.filter(b => b.requestId !== requestId) : [],
        }));
      }
    }),
    {
      name: "codepulse-performance-v1",
    }
  )
);
