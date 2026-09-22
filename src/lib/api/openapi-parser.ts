import { HttpMethod, OpenAPIEndpoint, OpenAPISpec, ApiRequest } from "./types";

export const parseOpenAPI = (content: string, name: string): { spec: OpenAPISpec, endpoints: OpenAPIEndpoint[], requests: ApiRequest[] } => {
  let json: any;
  try {
    json = JSON.parse(content);
  } catch (e) {
    throw new Error("Only JSON OpenAPI specifications are supported in this version.");
  }

  if (!json.openapi || !json.openapi.startsWith("3.")) {
    throw new Error("Only OpenAPI 3.x specifications are supported.");
  }

  const specId = crypto.randomUUID();
  const spec: OpenAPISpec = {
    id: specId,
    name: name || json.info?.title || "Imported API",
    version: json.info?.version || "1.0.0",
    description: json.info?.description,
    content,
    createdAt: new Date().toISOString()
  };

  const endpoints: OpenAPIEndpoint[] = [];
  const requests: ApiRequest[] = [];

  const baseUrl = json.servers?.[0]?.url || "https://api.example.com";

  if (json.paths) {
    for (const [path, methods] of Object.entries(json.paths)) {
      for (const [method, details] of Object.entries(methods as any)) {
        if (["get", "post", "put", "delete", "patch", "options", "head"].includes(method.toLowerCase())) {
          
          const epId = crypto.randomUUID();
          
          endpoints.push({
            id: epId,
            specId,
            path,
            method: method.toUpperCase() as HttpMethod,
            summary: (details as any).summary,
            tags: (details as any).tags || []
          });

          requests.push({
            id: crypto.randomUUID(),
            name: (details as any).summary || `${method.toUpperCase()} ${path}`,
            description: (details as any).description,
            url: `${baseUrl}${path}`,
            method: method.toUpperCase() as HttpMethod,
            headers: [],
            params: [],
            body: "",
            bodyType: "none",
            authType: "none",
            authData: {}
          });
        }
      }
    }
  }

  return { spec, endpoints, requests };
};

