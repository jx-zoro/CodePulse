import { ApiRequest, HttpMethod } from "../api/types";

export interface ParsedApi {
  info: { title: string; version: string; description?: string };
  requests: ApiRequest[];
  tags: string[];
}

export function parseOpenAPI(specContent: string): ParsedApi {
  let spec: any;
  try {
    spec = JSON.parse(specContent);
  } catch (e) {
    // Basic fallback to block completely invalid JSON. In a real app we'd parse YAML too.
    throw new Error("Invalid OpenAPI specification. Only valid JSON is currently supported.");
  }

  if (!spec.openapi && !spec.swagger) {
    throw new Error("Specification is missing 'openapi' or 'swagger' version fields.");
  }

  if (!spec.paths || typeof spec.paths !== 'object') {
    throw new Error("Specification is missing 'paths' definition.");
  }

  const requests: ApiRequest[] = [];
  const tags = new Set<string>();
  const info = {
    title: spec.info?.title || "Imported API",
    version: spec.info?.version || "1.0.0",
    description: spec.info?.description
  };

  const servers = spec.servers || [{ url: "https://api.example.com" }];
  const baseUrl = servers[0].url;

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods as Record<string, any>)) {
      if (!['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) continue;
      
      const endpointTags = details.tags || ["Uncategorized"];
      endpointTags.forEach((t: string) => tags.add(t));

      const queryParams: any[] = [];
      const headers: any[] = [];
      let bodyType: ApiRequest['bodyType'] = "none";
      let body = "";

      // Parse parameters (path, query, header)
      if (details.parameters && Array.isArray(details.parameters)) {
        details.parameters.forEach((param: any) => {
          if (param.in === "query") {
            queryParams.push({ id: Math.random().toString(), key: param.name, value: "", enabled: true });
          } else if (param.in === "header") {
            headers.push({ id: Math.random().toString(), key: param.name, value: "", enabled: true });
          }
        });
      }

      // Parse request body
      if (details.requestBody && details.requestBody.content) {
        if (details.requestBody.content['application/json']) {
          bodyType = "json";
          // Try to generate a dummy body if schema is provided (simple)
          body = "{\n  \n}"; 
        } else if (details.requestBody.content['application/x-www-form-urlencoded']) {
          bodyType = "form-url-encoded";
        }
      }

      const req: ApiRequest = {
        id: Math.random().toString(36).substring(7),
        name: details.summary || `${method.toUpperCase()} ${path}`,
        description: details.description || "",
        url: `${baseUrl}${path}`,
        method: method.toUpperCase() as HttpMethod,
        headers,
        params: queryParams,
        body,
        bodyType,
        authType: "none",
        authData: {},
        folderId: endpointTags[0] // We will map tags to folder IDs later
      };
      
      requests.push(req);
    }
  }

  return {
    info,
    requests,
    tags: Array.from(tags)
  };
}
