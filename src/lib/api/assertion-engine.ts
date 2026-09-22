import { Assertion, AssertionResult, ApiResponse, TestResult, TestCase } from "./types";

export const evaluateAssertion = (assertion: Assertion, response: ApiResponse): AssertionResult => {
  const result: AssertionResult = {
    assertionId: assertion.id,
    assertionType: assertion.type,
    expected: assertion.expectedValue,
    passed: false,
    message: ""
  };

  try {
    switch (assertion.type) {
      case "statusCodeEquals":
        result.actual = response.status;
        result.passed = response.status === Number(assertion.expectedValue);
        result.message = result.passed ? `Status code is ${response.status}` : `Expected status ${assertion.expectedValue}, got ${response.status}`;
        break;

      case "statusCodeInRange": {
        const [min, max] = String(assertion.expectedValue).split("-").map(Number);
        result.actual = response.status;
        result.passed = response.status >= min && response.status <= max;
        result.message = result.passed ? `Status code ${response.status} is between ${min} and ${max}` : `Status ${response.status} not in range ${assertion.expectedValue}`;
        break;
      }

      case "responseTimeLessThan":
        result.actual = response.metrics.totalTime;
        result.passed = response.metrics.totalTime < Number(assertion.expectedValue);
        result.message = result.passed ? `Response time ${result.actual}ms < ${assertion.expectedValue}ms` : `Response time ${result.actual}ms exceeded ${assertion.expectedValue}ms`;
        break;

      case "bodyContains":
        result.passed = response.body.includes(String(assertion.expectedValue));
        result.message = result.passed ? `Body contains text` : `Body does not contain expected text`;
        break;
        
      case "bodyNotContains":
        result.passed = !response.body.includes(String(assertion.expectedValue));
        result.message = result.passed ? `Body does not contain text` : `Body unexpectedly contains text`;
        break;

      case "jsonPathExists":
      case "jsonPathEquals":
      case "jsonPathContains": {
        let bodyJson: any;
        try {
          bodyJson = JSON.parse(response.body);
        } catch (e) {
          result.passed = false;
          result.message = "Response body is not valid JSON";
          break;
        }

        const path = (assertion.target || "").replace(/^\$\.?/, "");
        const keys = path.split(".").filter(Boolean);
        
        let current = bodyJson;
        let exists = true;
        for (const key of keys) {
          const arrayMatch = key.match(/^([^\[]+)\[(\d+)\]$/);
          if (arrayMatch) {
            const [, prop, index] = arrayMatch;
            if (current && typeof current === 'object' && prop in current && Array.isArray(current[prop]) && current[prop].length > Number(index)) {
              current = current[prop][Number(index)];
            } else {
              exists = false;
              break;
            }
          } else if (current && typeof current === 'object' && key in current) {
            current = current[key];
          } else {
            exists = false;
            break;
          }
        }

        if (assertion.type === "jsonPathExists") {
          result.passed = exists;
          result.message = exists ? `Path ${assertion.target} exists` : `Path ${assertion.target} not found`;
        } else if (assertion.type === "jsonPathEquals") {
          result.actual = current;
          result.passed = exists && String(current) === String(assertion.expectedValue);
          result.message = result.passed ? `Match found` : `Expected ${assertion.expectedValue}, got ${current}`;
        } else if (assertion.type === "jsonPathContains") {
          result.actual = current;
          result.passed = exists && typeof current === "string" && current.includes(String(assertion.expectedValue));
          result.message = result.passed ? `Value contains expected text` : `Value ${current} does not contain ${assertion.expectedValue}`;
        }
        break;
      }

      case "headerExists": {
        const headerName = (assertion.target || "").toLowerCase();
        const headerKeys = Object.keys(response.headers).map(k => k.toLowerCase());
        result.passed = headerKeys.includes(headerName);
        result.message = result.passed ? `Header ${assertion.target} exists` : `Header ${assertion.target} missing`;
        break;
      }

      case "headerEquals": {
        const headerName = (assertion.target || "").toLowerCase();
        const actualKey = Object.keys(response.headers).find(k => k.toLowerCase() === headerName);
        const actualValue = actualKey ? response.headers[actualKey] : undefined;
        result.actual = actualValue;
        result.passed = String(actualValue) === String(assertion.expectedValue);
        result.message = result.passed ? `Header matches` : `Expected ${assertion.expectedValue}, got ${actualValue}`;
        break;
      }
      
      case "bodyIsValidJson": {
        try {
          JSON.parse(response.body);
          result.passed = true;
          result.message = "Body is valid JSON";
        } catch (e) {
          result.passed = false;
          result.message = "Body is not valid JSON";
        }
        break;
      }

      default:
        result.passed = false;
        result.message = `Unknown assertion type: ${assertion.type}`;
    }
  } catch (error: any) {
    result.passed = false;
    result.message = `Error evaluating assertion: ${error.message}`;
  }

  return result;
};

export const runTests = (testCase: TestCase, response: ApiResponse): TestResult => {
  const activeAssertions = testCase.assertions.filter(a => a.enabled);
  
  const startTime = performance.now();
  
  const results = activeAssertions.map(assertion => evaluateAssertion(assertion, response));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const skipped = testCase.assertions.length - activeAssertions.length;
  
  const duration = Math.round(performance.now() - startTime);

  return {
    testCaseId: testCase.id,
    passed,
    failed,
    skipped,
    duration,
    assertionResults: results
  };
};
