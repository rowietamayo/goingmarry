
import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';

// Manual .env.local loader to avoid 'dotenv' dependency in scripts folder
function loadEnv() {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    // Basic check for UTF-16LE (if it contains null bytes or common patterns)
    if (envContent.includes('\u0000')) {
        envContent = fs.readFileSync(envPath, 'utf16le');
    }

    envContent.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const apiKey = process.env.VITE_GOINGMARRY_API_KEY;

if (!apiKey) {
  console.error("❌ Error: VITE_GOINGMARRY_API_KEY not found in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function runTest() {
  console.log("🔍 Testing Gemini API Connectivity...");
  console.log(`🔑 Using Key Profile: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ role: 'user', parts: [{ text: "Say 'The GoingMarry Gemini API is active and ready!'" }] }]
    });

    if (response) {
      console.log("✅ API Success!");
      console.log("🤖 Response:", response.text);
    }
  } catch (error) {
    console.error("❌ API Test Failed!");
    const status = error.status || (error.response && error.response.status);
    if (status === 404) {
      console.error("Error 404: The model name or endpoint was not found. Please check the model string.");
    } else if (status === 403) {
      console.error("Error 403: Permission denied. Your API key might be invalid or restricted.");
    } else if (status === 429) {
      console.error("Error 429: Too many requests. You may have hit your quota.");
    } else {
      console.error("Error Detail:", error.message || error);
    }
    process.exit(1);
  }
}

runTest();
