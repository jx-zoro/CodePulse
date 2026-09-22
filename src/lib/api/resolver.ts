import { Variable } from "./types";

/**
 * Resolves a template string containing variables like {{variable_name}}.
 * Variables are resolved hierarchically from left to right in the scopes array.
 * If a variable is found in the first scope, it is used, otherwise it falls back to the next scope.
 * 
 * @param text The template string to resolve
 * @param scopes An array of variable arrays. Highest precedence first.
 * @returns The resolved string, and an array of unresolved variable names.
 */
export const resolveVariables = (
  text: string | undefined | null,
  scopes: Variable[][]
): { resolved: string; unresolved: string[] } => {
  if (!text) return { resolved: "", unresolved: [] };

  const unresolved = new Set<string>();
  
  const resolved = text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    
    // Search through scopes in order of precedence
    for (const scope of scopes) {
      if (!scope) continue;
      
      const variable = scope.find(v => v.key === trimmedKey && v.enabled);
      if (variable) {
        return variable.value;
      }
    }
    
    // If we get here, the variable was not found in any scope
    unresolved.add(trimmedKey);
    return match; // Return the original {{variable}} text
  });

  return { 
    resolved, 
    unresolved: Array.from(unresolved) 
  };
};

/**
 * Helper to easily resolve a simple object containing strings (like headers or params).
 */
export const resolveObject = <T extends Record<string, unknown>>(
  obj: T,
  scopes: Variable[][]
): T => {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === "string") {
      result[key] = resolveVariables(result[key] as string, scopes).resolved as unknown as T[Extract<keyof T, string>];
    }
  }
  return result;
};
