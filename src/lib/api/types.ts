export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type AuthType = "none" | "bearer" | "basic" | "apikey";

export interface ApiHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParameter {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
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
  authData: Record<string, string>; // e.g., { token: "..." } or { username: "...", password: "..." }
}

export interface PerformanceMetrics {
  dnsTime?: number;
  connectionTime?: number;
  tlsTime?: number;
  waitingTime?: number; // TTFB
  downloadTime?: number;
  totalTime: number;
}

export interface Insight {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
  evidence?: string;
  action?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string; // JSON string or raw text
  size: number; // bytes
  contentType: string;
  metrics: PerformanceMetrics;
  insights: Insight[];
  error?: string; // High level error (e.g., DNS failure, timeout)
}

export interface ApiTest {
  id: string;
  request: ApiRequest;
  response?: ApiResponse;
  timestamp: string; // ISO string
  score: number;
}

export interface Variable {
  id: string;
  key: string;
  value: string;
  type: "default" | "secret";
  enabled: boolean;
}

export interface CollectionFolder {
  id: string;
  name: string;
  description?: string;
  folders: CollectionFolder[];
  requests: ApiRequest[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  variables: Variable[]; // Collection-level variables
  authType: AuthType; // Collection-level auth
  authData: Record<string, string>;
  root: CollectionFolder;
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  id: string;
  name: string;
  type: "development" | "staging" | "production" | "custom";
  variables: Variable[];
  createdAt: string;
}
// ==========================================
// PHASE 4: ADVANCED API INTELLIGENCE MODELS
// ==========================================

export type AssertionType = 
  | "statusCodeEquals" 
  | "statusCodeInRange" 
  | "responseTimeLessThan" 
  | "responseTimeGreaterThan" 
  | "bodyContains" 
  | "bodyNotContains" 
  | "jsonPathExists" 
  | "jsonPathEquals" 
  | "jsonPathNotEquals" 
  | "jsonPathContains" 
  | "headerExists" 
  | "headerEquals" 
  | "headerContains" 
  | "contentTypeMatches" 
  | "bodyIsValidJson" 
  | "arrayLengthEquals" 
  | "numericGreaterThan" 
  | "numericLessThan" 
  | "isNull" 
  | "isNotNull";

export interface Assertion {
  id: string;
  type: AssertionType;
  target?: string; // e.g., '$.users[0].name' or 'Authorization'
  expectedValue?: string | number;
  enabled: boolean;
}

export interface TestCase {
  id: string;
  requestId: string; // The ApiRequest this belongs to
  name: string;
  enabled: boolean;
  assertions: Assertion[];
  createdAt: string;
  updatedAt: string;
}

export interface AssertionResult {
  assertionId: string;
  assertionType: AssertionType;
  expected?: string | number;
  actual?: any;
  passed: boolean;
  message: string;
}

export interface TestResult {
  testCaseId: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  assertionResults: AssertionResult[];
}

export interface ExtractedVariable {
  id: string;
  requestId: string; // The ApiRequest this belongs to
  variableName: string; // e.g., 'userId'
  source: "jsonPath" | "header" | "regex" | "statusCode" | "responseTime";
  target: string; // e.g., '$.data.id' or 'X-Custom-Header'
  enabled: boolean;
}

export interface OpenAPISpec {
  id: string;
  name: string;
  version: string;
  description?: string;
  content: string; // raw JSON or YAML string
  createdAt: string;
}

export interface OpenAPIEndpoint {
  id: string;
  specId: string;
  path: string;
  method: HttpMethod;
  summary?: string;
  tags: string[];
  // Further details will be parsed on demand or stored here
}

export interface ContractResult {
  requestId: string;
  specId: string;
  path: string;
  method: HttpMethod;
  matches: boolean;
  differences: string[];
}

export interface PerformanceSample {
  id: string;
  requestId: string;
  timestamp: string;
  totalTime: number;
  statusCode: number;
  success: boolean;
}

export interface PerformanceBaseline {
  requestId: string;
  p50: number;
  p95: number;
  p99: number;
  average: number;
  sampleCount: number;
  successRate: number;
  errorRate: number;
  lastCalculated: string;
}

export interface Monitor {
  id: string;
  name: string;
  requestId: string;
  environmentId?: string;
  intervalMinutes: number;
  expectedStatus: number;
  timeoutMs: number;
  enabled: boolean;
  lastRun?: string;
  lastStatus?: "healthy" | "degraded" | "failing" | "unknown";
}
