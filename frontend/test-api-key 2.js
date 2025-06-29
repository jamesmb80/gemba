// Test script to verify API key loading in Next.js context
require('dotenv').config({ path: '.env.local' });

console.log('🔑 API Key Test');
console.log('==============\n');

const apiKey = process.env.ANTHROPIC_API_KEY;
const publicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

console.log('ANTHROPIC_API_KEY exists:', !!apiKey);
console.log('NEXT_PUBLIC_ANTHROPIC_API_KEY exists:', !!publicKey);

if (apiKey) {
  console.log('ANTHROPIC_API_KEY length:', apiKey.length);
  console.log('ANTHROPIC_API_KEY starts with sk-ant-:', apiKey.startsWith('sk-ant-'));
  console.log('ANTHROPIC_API_KEY first 10 chars:', apiKey.substring(0, 10));
  console.log('ANTHROPIC_API_KEY last 4 chars:', apiKey.substring(apiKey.length - 4));
  
  // Test if it's a placeholder
  if (apiKey.includes('your-actual') || apiKey.length < 50) {
    console.log('⚠️  WARNING: This appears to be a placeholder key!');
  } else {
    console.log('✅ Key appears to be a real API key');
  }
}

if (publicKey) {
  console.log('NEXT_PUBLIC_ANTHROPIC_API_KEY length:', publicKey.length);
  console.log('NEXT_PUBLIC_ANTHROPIC_API_KEY starts with sk-ant-:', publicKey.startsWith('sk-ant-'));
}

// Test making a simple API call
if (apiKey && apiKey.startsWith('sk-ant-') && apiKey.length > 50) {
  console.log('\n🧪 Testing API call...');
  
  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }]
    })
  })
  .then(response => {
    console.log('API Response Status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('API Response:', data);
  })
  .catch(error => {
    console.log('API Error:', error.message);
  });
} else {
  console.log('\n❌ Cannot test API call - invalid or missing API key');
} 