import { ApiResponse, ContractResult } from "./types";
import { useOpenApiStore } from "../store/useOpenApiStore";

export const validateContract = (
  requestId: string,
  url: string,
  method: string,
  response: ApiResponse
): ContractResult | null => {
  const { specs, endpoints } = useOpenApiStore.getState();
  
  if (specs.length === 0 || endpoints.length === 0) return null;

  let matchedEp = null;
  let matchedSpec = null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    for (const ep of endpoints) {
      if (ep.method.toLowerCase() === method.toLowerCase()) {
        const pathRegexString = ep.path.replace(/\{[^}]+\}/g, "[^/]+").replace(/\//g, "\\/");
        const pathRegex = new RegExp(`^${pathRegexString}$`);
        
        if (pathRegex.test(pathname) || pathname.includes(ep.path)) {
          matchedEp = ep;
          matchedSpec = specs.find(s => s.id === ep.specId);
          break;
        }
      }
    }
  } catch (e) {
    return null;
  }

  if (!matchedEp || !matchedSpec) return null;

  const result: ContractResult = {
    requestId,
    specId: matchedSpec.id,
    path: matchedEp.path,
    method: matchedEp.method,
    matches: true,
    differences: []
  };

  try {
    const specJson = JSON.parse(matchedSpec.content);
    const operation = specJson.paths[matchedEp.path]?.[matchedEp.method.toLowerCase()];
    
    if (!operation) {
      result.matches = false;
      result.differences.push(`Operation not found in specification.`);
      return result;
    }

    const responses = operation.responses;
    const expectedResponse = responses[String(response.status)] || responses["default"];

    if (!expectedResponse) {
      result.matches = false;
      result.differences.push(`Unexpected status code ${response.status}. Spec expects: ${Object.keys(responses).join(", ")}`);
      return result;
    }

    if (expectedResponse.content) {
      const expectedContentTypes = Object.keys(expectedResponse.content);
      const actualContentType = response.contentType.split(';')[0].trim();
      
      const isContentTypeMatched = expectedContentTypes.some(ct => actualContentType.includes(ct));
      
      if (!isContentTypeMatched && response.status !== 204) {
        result.matches = false;
        result.differences.push(`Unexpected Content-Type '${actualContentType}'. Spec expects: ${expectedContentTypes.join(", ")}`);
      }
    }

    if (response.status === 200 && response.body) {
      try {
        JSON.parse(response.body);
      } catch (e) {
        if (expectedResponse.content && expectedResponse.content["application/json"]) {
          result.matches = false;
          result.differences.push("Expected JSON response body, but received invalid JSON.");
        }
      }
    }

  } catch (e: any) {
    result.matches = false;
    result.differences.push(`Validation error: ${e.message}`);
  }

  return result;
};
