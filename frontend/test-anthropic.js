#!/usr/bin/env node

/**
 * Anthropic API Diagnostic Script
 * Tests API key validity and direct API communication
 */

const fs = require('fs');
const path = require('path');

// Load .env.local from the current directory (frontend)
require('dotenv').config({ path: '.env.local' });

// Configuration
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

console.log('🔍 Anthropic API Diagnostic Script');
console.log('=====================================\n');

// Step 1: Check if .env.local exists
console.log('1. Checking .env.local file...');
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('   Please create .env.local with your Anthropic API key:');
  console.log('   ANTHROPIC_API_KEY=sk-ant-your-key-here');
  process.exit(1);
}
console.log(`✅ .env.local file found at: ${envPath}\n`);

// Step 2: Load and validate API key
console.log('2. Loading API key from .env.local...');
const apiKey = process.env.ANTHROPIC_API_KEY;

// Debug information
console.log('Current working directory:', process.cwd());
console.log('Raw API key with quotes:', `"${process.env.ANTHROPIC_API_KEY}"`);
console.log('API key as array of characters:', [...(process.env.ANTHROPIC_API_KEY || '')]);

if (!apiKey) {
  console.log('❌ ANTHROPIC_API_KEY not found in .env.local');
  console.log('   Please add: ANTHROPIC_API_KEY=sk-ant-your-key-here');
  process.exit(1);
}

console.log('✅ API key found');
console.log(`   Key starts with 'sk-ant-': ${apiKey.startsWith('sk-ant-')}`);
console.log(`   Key length: ${apiKey.length} characters`);
console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

if (!apiKey.startsWith('sk-ant-')) {
  console.log('❌ API key format is incorrect - should start with "sk-ant-"');
  process.exit(1);
}

if (apiKey.length < 50) {
  console.log('❌ API key appears too short - should be around 50+ characters');
  process.exit(1);
}

console.log('✅ API key format appears valid\n');

// Step 3: Test API call
console.log('3. Testing direct API call to Anthropic...');

const testPayload = {
  model: MODEL,
  max_tokens: 50,
  messages: [
    {
      role: 'user',
      content: 'Hello! Please respond with just "API test successful" if you can see this message.'
    }
  ]
};

const headers = {
  'x-api-key': apiKey,
  'anthropic-version': API_VERSION,
  'Content-Type': 'application/json'
};

console.log('   Making request to:', API_URL);
console.log('   Model:', MODEL);
console.log('   API Version:', API_VERSION);
console.log('   Request payload:', JSON.stringify(testPayload, null, 2));

async function testAnthropicAPI() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testPayload)
    });

    console.log('\n   Response status:', response.status);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('   Raw response (not JSON):', responseText);
      responseData = { raw: responseText };
    }

    if (response.ok) {
      console.log('\n🎉 SUCCESS! API call worked!');
      console.log('   Response data:', JSON.stringify(responseData, null, 2));
      
      if (responseData.content && responseData.content[0] && responseData.content[0].text) {
        console.log('\n   Claude response:', responseData.content[0].text);
      }
      
      console.log('\n✅ Your API key is valid and working!');
      console.log('   The issue is likely in your Next.js application configuration.');
      console.log('\n   Next steps:');
      console.log('   1. Check that your .env.local is being loaded by Next.js');
      console.log('   2. Verify the proxy route is correctly forwarding the API key');
      console.log('   3. Check for any middleware or interceptors modifying the request');
      
    } else {
      console.log('\n❌ API call failed!');
      console.log('   Error response:', JSON.stringify(responseData, null, 2));
      
      if (response.status === 401) {
        console.log('\n🔍 401 Unauthorized - This means:');
        console.log('   - The API key is being sent to Anthropic');
        console.log('   - Anthropic is rejecting the key as invalid');
        console.log('\n   Possible causes:');
        console.log('   1. API key is expired or revoked');
        console.log('   2. API key is from wrong account/organization');
        console.log('   3. API key doesn\'t have access to this model');
        console.log('   4. API key format is corrupted (extra spaces, characters)');
        console.log('\n   Action: Check your Anthropic console and regenerate the key');
        
      } else if (response.status === 400) {
        console.log('\n🔍 400 Bad Request - This means:');
        console.log('   - The request format is incorrect');
        console.log('   - Check the model name, headers, or payload structure');
        
      } else {
        console.log('\n🔍 Unexpected error - Check the response details above');
      }
    }

  } catch (error) {
    console.log('\n❌ Network/Request error:');
    console.log('   Error:', error.message);
    console.log('\n   This could be:');
    console.log('   1. Network connectivity issue');
    console.log('   2. DNS resolution problem');
    console.log('   3. Firewall blocking the request');
    console.log('   4. Node.js fetch not available (try Node 18+)');
  }
}

// Run the test
testAnthropicAPI().then(() => {
  console.log('\n🏁 Diagnostic complete!');
}).catch((error) => {
  console.log('\n💥 Unexpected error during test:', error);
  process.exit(1);
}); 