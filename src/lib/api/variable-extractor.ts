import { ApiResponse, ExtractedVariable } from "./types";
import { useEnvironmentStore } from "../store/useEnvironmentStore";

export const extractVariable = (
  extractedVar: ExtractedVariable,
  response: ApiResponse
): string | null => {
  let value: string | null = null;

  try {
    switch (extractedVar.source) {
      case "jsonPath": {
        const bodyJson = JSON.parse(response.body);
        const path = (extractedVar.target || "").replace(/^\$\.?/, "");
        const keys = path.split(".").filter(Boolean);
        
        let current = bodyJson;
        for (const key of keys) {
          const arrayMatch = key.match(/^([^\[]+)\[(\d+)\]$/);
          if (arrayMatch) {
            const [, prop, index] = arrayMatch;
            if (current && typeof current === 'object' && prop in current && Array.isArray(current[prop]) && current[prop].length > Number(index)) {
              current = current[prop][Number(index)];
            } else {
              current = null;
              break;
            }
          } else if (current && typeof current === 'object' && key in current) {
            current = current[key];
          } else {
            current = null;
            break;
          }
        }
        value = current !== null && current !== undefined ? String(current) : null;
        break;
      }
      case "header": {
        const headerName = (extractedVar.target || "").toLowerCase();
        const actualKey = Object.keys(response.headers).find(k => k.toLowerCase() === headerName);
        value = actualKey ? response.headers[actualKey] : null;
        break;
      }
      case "regex": {
        const regex = new RegExp(extractedVar.target || "");
        const match = response.body.match(regex);
        value = match && match[1] ? match[1] : (match ? match[0] : null);
        break;
      }
      case "statusCode":
        value = String(response.status);
        break;
      case "responseTime":
        value = String(response.metrics.totalTime);
        break;
    }
  } catch (e) {
    console.error("Variable extraction failed:", e);
  }

  return value;
};

export const processExtractions = (
  extractions: ExtractedVariable[],
  response: ApiResponse,
  environmentId?: string
) => {
  if (!environmentId) return;

  const { addVariable, updateVariable, environments } = useEnvironmentStore.getState();
  const env = environments.find(e => e.id === environmentId);
  if (!env) return;

  const activeExtractions = extractions.filter(e => e.enabled);
  
  for (const extraction of activeExtractions) {
    const value = extractVariable(extraction, response);
    if (value !== null) {
      // Check if variable already exists in the environment
      const existing = env.variables.find(v => v.key === extraction.variableName);
      if (existing) {
        updateVariable(env.id, existing.id, { value });
      } else {
        addVariable(env.id, {
          id: crypto.randomUUID(),
          key: extraction.variableName,
          value,
          type: "default",
          enabled: true
        });
      }
    }
  }
};
