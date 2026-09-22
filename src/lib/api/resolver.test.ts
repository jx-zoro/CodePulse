import { resolveVariables, resolveObject } from "./resolver";
import { Variable } from "./types";

const globalScope: Variable[] = [
  { id: "1", key: "baseUrl", value: "https://global.example.com", type: "default", enabled: true },
  { id: "2", key: "token", value: "global_secret", type: "secret", enabled: true }
];

const envScope: Variable[] = [
  { id: "3", key: "baseUrl", value: "https://env.example.com", type: "default", enabled: true },
  { id: "4", key: "envOnly", value: "env_value", type: "default", enabled: true }
];

const collectionScope: Variable[] = [
  { id: "5", key: "baseUrl", value: "https://collection.example.com", type: "default", enabled: true },
  { id: "6", key: "disabledVar", value: "hidden", type: "default", enabled: false }
];

const requestScope: Variable[] = [
  { id: "7", key: "baseUrl", value: "https://request.example.com", type: "default", enabled: true },
];

function runTests() {
  console.log("Running Resolver Tests...");
  
  // Test 1: Single scope resolution
  const t1 = resolveVariables("GET {{baseUrl}}/users", [globalScope]);
  console.assert(t1.resolved === "GET https://global.example.com/users", "Test 1 Failed");
  
  // Test 2: Precedence (Request > Env > Global)
  const t2 = resolveVariables("GET {{baseUrl}}/users", [requestScope, envScope, globalScope]);
  console.assert(t2.resolved === "GET https://request.example.com/users", "Test 2 Failed");
  
  // Test 3: Precedence fallback
  const t3 = resolveVariables("GET {{baseUrl}}/users?token={{token}}", [envScope, globalScope]);
  console.assert(t3.resolved === "GET https://env.example.com/users?token=global_secret", "Test 3 Failed");
  
  // Test 4: Disabled variables are ignored
  const t4 = resolveVariables("{{disabledVar}}", [collectionScope]);
  console.assert(t4.resolved === "{{disabledVar}}", "Test 4 Failed");
  console.assert(t4.unresolved.includes("disabledVar"), "Test 4b Failed");
  
  // Test 5: resolveObject
  const obj = { url: "{{baseUrl}}", header: "Bearer {{token}}" };
  const resObj = resolveObject(obj, [envScope, globalScope]);
  console.assert(resObj.url === "https://env.example.com", "Test 5 Failed");
  console.assert(resObj.header === "Bearer global_secret", "Test 5b Failed");
  
  console.log("All Resolver Tests Passed!");
}

runTests();
