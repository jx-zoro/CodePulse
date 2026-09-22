import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TestCase, Assertion, ExtractedVariable } from "../api/types";

interface TestEngineState {
  testCases: TestCase[];
  extractedVariables: ExtractedVariable[];
  
  // Actions
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  removeTestCase: (id: string) => void;
  getTestCaseForRequest: (requestId: string) => TestCase | undefined;
  
  addAssertion: (testCaseId: string, assertion: Assertion) => void;
  updateAssertion: (testCaseId: string, assertionId: string, updates: Partial<Assertion>) => void;
  removeAssertion: (testCaseId: string, assertionId: string) => void;
  
  addExtractedVariable: (extractedVar: ExtractedVariable) => void;
  updateExtractedVariable: (id: string, updates: Partial<ExtractedVariable>) => void;
  removeExtractedVariable: (id: string) => void;
  getExtractedVariablesForRequest: (requestId: string) => ExtractedVariable[];
}

export const useTestEngineStore = create<TestEngineState>()(
  persist(
    (set, get) => ({
      testCases: [],
      extractedVariables: [],

      addTestCase: (testCase) =>
        set((state) => ({ testCases: [...state.testCases, testCase] })),

      updateTestCase: (id, updates) =>
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === id ? { ...tc, ...updates, updatedAt: new Date().toISOString() } : tc
          ),
        })),

      removeTestCase: (id) =>
        set((state) => ({
          testCases: state.testCases.filter((tc) => tc.id !== id),
        })),

      getTestCaseForRequest: (requestId) =>
        get().testCases.find((tc) => tc.requestId === requestId),

      addAssertion: (testCaseId, assertion) =>
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === testCaseId
              ? { ...tc, assertions: [...tc.assertions, assertion], updatedAt: new Date().toISOString() }
              : tc
          ),
        })),

      updateAssertion: (testCaseId, assertionId, updates) =>
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === testCaseId
              ? {
                  ...tc,
                  assertions: tc.assertions.map((a) =>
                    a.id === assertionId ? { ...a, ...updates } : a
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : tc
          ),
        })),

      removeAssertion: (testCaseId, assertionId) =>
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === testCaseId
              ? {
                  ...tc,
                  assertions: tc.assertions.filter((a) => a.id !== assertionId),
                  updatedAt: new Date().toISOString(),
                }
              : tc
          ),
        })),

      addExtractedVariable: (extractedVar) =>
        set((state) => ({ extractedVariables: [...state.extractedVariables, extractedVar] })),

      updateExtractedVariable: (id, updates) =>
        set((state) => ({
          extractedVariables: state.extractedVariables.map((ev) =>
            ev.id === id ? { ...ev, ...updates } : ev
          ),
        })),

      removeExtractedVariable: (id) =>
        set((state) => ({
          extractedVariables: state.extractedVariables.filter((ev) => ev.id !== id),
        })),

      getExtractedVariablesForRequest: (requestId) =>
        get().extractedVariables.filter((ev) => ev.requestId === requestId),
    }),
    {
      name: "codepulse-test-engine-v1",
    }
  )
);
