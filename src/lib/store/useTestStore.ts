import { create } from "zustand";
import { ApiRequest, ApiResponse, HttpMethod, AuthType, ApiHeader, QueryParameter } from "../api/types";

interface TestState {
  // Request State
  id?: string;
  name?: string;
  description?: string;
  collectionId?: string;
  folderId?: string;
  url: string;
  method: HttpMethod;
  headers: ApiHeader[];
  params: QueryParameter[];
  body: string;
  bodyType: "none" | "json" | "text" | "xml" | "form-url-encoded";
  authType: AuthType;
  authData: Record<string, string>;
  
  // Response State
  response: ApiResponse | null;
  isLoading: boolean;

  // Actions
  setId: (id?: string) => void;
  setName: (name?: string) => void;
  setDescription: (desc?: string) => void;
  setCollectionId: (id?: string) => void;
  setFolderId: (id?: string) => void;
  setUrl: (url: string) => void;
  setMethod: (method: HttpMethod) => void;
  setHeaders: (headers: ApiHeader[]) => void;
  setParams: (params: QueryParameter[]) => void;
  setBody: (body: string) => void;
  setBodyType: (type: "none" | "json" | "text" | "xml" | "form-url-encoded") => void;
  setAuthType: (type: AuthType) => void;
  setAuthData: (data: Record<string, string>) => void;
  
  setResponse: (response: ApiResponse | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  loadRequest: (request: ApiRequest) => void;
}

export const useTestStore = create<TestState>((set) => ({
  url: "https://httpbin.org/get",
  method: "GET",
  headers: [{ id: "1", key: "Accept", value: "application/json", enabled: true }],
  params: [],
  body: "",
  bodyType: "none",
  authType: "none",
  authData: {},

  response: null,
  isLoading: false,

  setId: (id) => set({ id }),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setCollectionId: (collectionId) => set({ collectionId }),
  setFolderId: (folderId) => set({ folderId }),
  setUrl: (url) => set({ url }),
  setMethod: (method) => set({ method }),
  setHeaders: (headers) => set({ headers }),
  setParams: (params) => set({ params }),
  setBody: (body) => set({ body }),
  setBodyType: (bodyType) => set({ bodyType }),
  setAuthType: (authType) => set({ authType }),
  setAuthData: (authData) => set({ authData }),
  
  setResponse: (response) => set({ response }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  loadRequest: (request) => set({
    id: request.id,
    name: request.name,
    description: request.description,
    collectionId: request.collectionId,
    folderId: request.folderId,
    url: request.url,
    method: request.method,
    headers: request.headers,
    params: request.params,
    body: request.body,
    bodyType: request.bodyType,
    authType: request.authType,
    authData: request.authData,
    response: null,
  }),
}));
