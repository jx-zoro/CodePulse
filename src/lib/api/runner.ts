import { CollectionFolder, ApiRequest, ApiResponse } from "./types";
import { executeRequest } from "./executor";
import { resolveVariables, resolveObject } from "./resolver";
import { useEnvironmentStore } from "../store/useEnvironmentStore";
import { analyzeResponse } from "./analyzer";
import { useTestEngineStore } from "../store/useTestEngineStore";
import { runTests } from "./assertion-engine";
import { processExtractions } from "./variable-extractor";

export interface RunnerProgress {
  total: number;
  completed: number;
  currentRequest: string;
  results: {
    request: ApiRequest;
    response: ApiResponse | null;
    error?: string;
    passed: boolean;
    testPassed: number;
    testFailed: number;
  }[];
}

export type RunnerCallback = (progress: RunnerProgress) => void;

/**
 * Recursively extracts all requests from a folder and its subfolders in order.
 */
export const extractRequests = (folder: CollectionFolder): ApiRequest[] => {
  let reqs = [...folder.requests];
  for (const sub of folder.folders) {
    reqs = reqs.concat(extractRequests(sub));
  }
  return reqs;
};

/**
 * Runs a sequence of requests. 
 * This is the foundation for Phase 4 (Chaining and Automation).
 */
export const runCollection = async (
  folder: CollectionFolder, 
  onProgress: RunnerCallback
): Promise<RunnerProgress> => {
  const requests = extractRequests(folder);
  const progress: RunnerProgress = {
    total: requests.length,
    completed: 0,
    currentRequest: "",
    results: []
  };

  const envStore = useEnvironmentStore.getState();
  const activeEnv = envStore.activeEnvironmentId 
    ? envStore.environments.find(e => e.id === envStore.activeEnvironmentId) 
    : null;
  const variables = activeEnv ? [activeEnv.variables] : [];

  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    progress.currentRequest = req.name || req.url;
    onProgress({ ...progress });

    // Apply environment variables
    const requestToRun: ApiRequest = {
      ...req,
      url: resolveVariables(req.url, variables).resolved,
      headers: req.headers.map(h => ({ ...h, key: resolveVariables(h.key, variables).resolved, value: resolveVariables(h.value, variables).resolved })),
      params: req.params.map(p => ({ ...p, key: resolveVariables(p.key, variables).resolved, value: resolveVariables(p.value, variables).resolved })),
      body: resolveVariables(req.body, variables).resolved,
    };

        try {
      const response = await executeRequest(requestToRun);
      const { score, insights } = analyzeResponse(response);
      response.insights = insights;

      const isSuccess = response.status >= 200 && response.status < 300;
      
      let testPassed = 0;
      let testFailed = 0;

      // Run tests
      const { getTestCaseForRequest, getExtractedVariablesForRequest } = useTestEngineStore.getState();
      const tc = getTestCaseForRequest(req.id || "default");
      if (tc && tc.assertions.length > 0) {
        const result = runTests(tc, response);
        testPassed = result.passed;
        testFailed = result.failed;
      }
      
      // Process extractions
      const extractions = getExtractedVariablesForRequest(req.id || "default");
      if (extractions.length > 0) {
        processExtractions(extractions, response, envStore.activeEnvironmentId || undefined);
      }

      progress.results.push({
        request: req,
        response,
        passed: isSuccess && testFailed === 0,
        testPassed,
        testFailed
      });
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Unknown error";
      progress.results.push({
        request: req,
        response: null,
        error: errorMsg,
        testPassed: 0,
        testFailed: 1,
        passed: false
      });
    }

    progress.completed++;
    onProgress({ ...progress });
  }

  progress.currentRequest = "Finished";
  onProgress({ ...progress });

  return progress;
};

