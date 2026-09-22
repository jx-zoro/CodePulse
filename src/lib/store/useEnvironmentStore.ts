import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Environment, Variable } from "../api/types";

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  addEnvironment: (env: Environment) => void;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string | null) => void;
  
  // Helpers for variables
  addVariable: (envId: string, variable: Variable) => void;
  updateVariable: (envId: string, variableId: string, updates: Partial<Variable>) => void;
  removeVariable: (envId: string, variableId: string) => void;
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set) => ({
      environments: [],
      activeEnvironmentId: null,
      
      addEnvironment: (env) =>
        set((state) => ({ environments: [...state.environments, env] })),
        
      updateEnvironment: (id, updates) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
        
      removeEnvironment: (id) =>
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironmentId:
            state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        })),
        
      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
      
      addVariable: (envId, variable) => 
        set((state) => ({
          environments: state.environments.map((e) => 
            e.id === envId ? { ...e, variables: [...e.variables, variable] } : e
          )
        })),
        
      updateVariable: (envId, variableId, updates) =>
        set((state) => ({
          environments: state.environments.map((e) => 
            e.id === envId ? {
              ...e,
              variables: e.variables.map(v => v.id === variableId ? { ...v, ...updates } : v)
            } : e
          )
        })),
        
      removeVariable: (envId, variableId) =>
        set((state) => ({
          environments: state.environments.map((e) => 
            e.id === envId ? {
              ...e,
              variables: e.variables.filter(v => v.id !== variableId)
            } : e
          )
        })),
    }),
    {
      name: "codepulse-environments-v2",
    }
  )
);
