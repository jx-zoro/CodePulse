import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OpenAPISpec, OpenAPIEndpoint } from "../api/types";

interface OpenApiState {
  specs: OpenAPISpec[];
  endpoints: OpenAPIEndpoint[];
  
  addSpec: (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]) => void;
  removeSpec: (specId: string) => void;
  getEndpointsForSpec: (specId: string) => OpenAPIEndpoint[];
}

export const useOpenApiStore = create<OpenApiState>()(
  persist(
    (set, get) => ({
      specs: [],
      endpoints: [],

      addSpec: (spec, endpoints) =>
        set((state) => ({
          specs: [...state.specs, spec],
          endpoints: [...state.endpoints, ...endpoints]
        })),

      removeSpec: (specId) =>
        set((state) => ({
          specs: state.specs.filter(s => s.id !== specId),
          endpoints: state.endpoints.filter(e => e.specId !== specId)
        })),

      getEndpointsForSpec: (specId) =>
        get().endpoints.filter(e => e.specId === specId)
    }),
    {
      name: "codepulse-openapi-v1",
    }
  )
);
