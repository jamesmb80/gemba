// Simple test script to verify your Anthropic API key
// Run this with: node test-anthropic-key.js

const fs = require('fs');
const path = require('path');

// Read the .env.local file
const envPath = path.join(__dirname, '.env.local');
let apiKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

console.log('=== Anthropic API Key Test ===');
console.log('API Key found:', !!apiKey);
console.log('API Key starts with sk-ant-:', apiKey.startsWith('sk-ant-'));
console.log('API Key length:', apiKey.length);
console.log('First 10 characters:', apiKey.substring(0, 10) + '...');

if (!apiKey) {
  console.log('\n❌ No API key found in .env.local');
  console.log('Please add your Anthropic API key to .env.local:');
  console.log('ANTHROPIC_API_KEY=sk-ant-your-key-here');
} else if (!apiKey.startsWith('sk-ant-')) {
  console.log('\n❌ API key format is incorrect');
  console.log('Anthropic API keys should start with "sk-ant-"');
} else {
  console.log('\n✅ API key format looks correct');
  console.log('If you\'re still getting 401 errors, the key might be:');
  console.log('- Expired or revoked');
  console.log('- From the wrong account');
  console.log('- Missing required permissions');
  console.log('\nPlease check your Anthropic console at: https://console.anthropic.com');
}
