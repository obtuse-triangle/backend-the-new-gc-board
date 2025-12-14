
import { apiFetch } from "./lib/api/client";

// Mock fetch to return 204 No Content
global.fetch = async (url, options) => {
  console.log(`Fetching ${url} with method ${options.method}`);
  return {
    ok: true,
    status: 204,
    statusText: "No Content",
    text: async () => "",
    json: async () => {
      throw new Error("Unexpected end of JSON input"); // Standard error for empty body
      // Or if the environment throws "The string did not match the expected pattern"
    },
    headers: new Map(),
  } as any;
};

async function runTest() {
  try {
    console.log("Testing DELETE request expecting 204...");
    const result = await apiFetch("/delete-item", { method: "DELETE" });
    console.log("Success:", result);
  } catch (e) {
    console.error("Caught error:", e);
  }
}

runTest();
