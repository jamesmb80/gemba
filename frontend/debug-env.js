const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Debug Script');
console.log('==========================\n');

// Check current working directory
console.log('📁 Current working directory:', process.cwd());

// Possible .env file locations to check
const possibleEnvFiles = [
  '.env.local',
  '.env',
  '.env.development',
  '.env.production',
  '../.env.local',
  '../.env',
  '../../.env.local',
  '../../.env'
];

console.log('\n📂 Checking for .env files:');
console.log('----------------------------');

let envFileFound = false;
let envFileContent = '';

for (const envFile of possibleEnvFiles) {
  const fullPath = path.resolve(envFile);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${envFile} (${fullPath})`);
  
  if (exists && !envFileFound) {
    envFileFound = true;
    try {
      envFileContent = fs.readFileSync(fullPath, 'utf8');
      console.log(`📄 Content of ${envFile}:`);
      console.log('---START OF FILE---');
      console.log(envFileContent);
      console.log('---END OF FILE---');
    } catch (error) {
      console.log(`❌ Error reading ${envFile}:`, error.message);
    }
  }
}

if (!envFileFound) {
  console.log('\n❌ No .env files found!');
}

// Check if dotenv is installed
console.log('\n📦 Checking dotenv installation:');
console.log('-------------------------------');
try {
  require('dotenv');
  console.log('✅ dotenv is installed');
} catch (error) {
  console.log('❌ dotenv is not installed:', error.message);
}

// Try to load environment variables
console.log('\n🔧 Attempting to load environment variables:');
console.log('--------------------------------------------');

try {
  // Try loading from .env.local first
  const dotenv = require('dotenv');
  const result = dotenv.config({ path: '.env.local' });
  
  if (result.error) {
    console.log('❌ Error loading .env.local:', result.error.message);
    // Try loading from .env
    const result2 = dotenv.config();
    if (result2.error) {
      console.log('❌ Error loading .env:', result2.error.message);
    } else {
      console.log('✅ Successfully loaded .env');
    }
  } else {
    console.log('✅ Successfully loaded .env.local');
  }
} catch (error) {
  console.log('❌ Error loading environment variables:', error.message);
}

// Check environment variables
console.log('\n🔑 Environment Variables Check:');
console.log('-------------------------------');

const envVars = [
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_ANTHROPIC_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const envVar of envVars) {
  const value = process.env[envVar];
  if (value) {
    // Show first 10 characters and last 4 characters for security
    const maskedValue = value.length > 14 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : value.substring(0, Math.min(4, value.length)) + '...';
    console.log(`✅ ${envVar}: ${maskedValue} (length: ${value.length})`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
  }
}

// Check for placeholder values
console.log('\n🚨 Checking for placeholder values:');
console.log('----------------------------------');

const placeholderPatterns = [
  'your-anthropic-api-key',
  'your_supabase_url',
  'your_supabase_anon_key',
  'your_supabase_service_role_key',
  'placeholder',
  'REPLACE_WITH_',
  'INSERT_'
];

for (const envVar of envVars) {
  const value = process.env[envVar];
  if (value) {
    const isPlaceholder = placeholderPatterns.some(pattern => 
      value.toLowerCase().includes(pattern.toLowerCase())
    );
    if (isPlaceholder) {
      console.log(`⚠️  ${envVar} appears to be a placeholder: "${value}"`);
    }
  }
}

// Test direct file reading
console.log('\n📖 Direct file reading test:');
console.log('----------------------------');

const testPaths = [
  '.env.local',
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '..', '.env.local'),
  path.join(process.cwd(), '..', '..', '.env.local')
];

for (const testPath of testPaths) {
  try {
    if (fs.existsSync(testPath)) {
      const content = fs.readFileSync(testPath, 'utf8');
      const hasAnthropicKey = content.includes('ANTHROPIC_API_KEY');
      console.log(`✅ ${testPath} exists and ${hasAnthropicKey ? 'contains' : 'does NOT contain'} ANTHROPIC_API_KEY`);
      
      if (hasAnthropicKey) {
        const lines = content.split('\n');
        const anthropicLine = lines.find(line => line.startsWith('ANTHROPIC_API_KEY='));
        if (anthropicLine) {
          const keyValue = anthropicLine.split('=')[1];
          const maskedKey = keyValue.length > 14 
            ? `${keyValue.substring(0, 10)}...${keyValue.substring(keyValue.length - 4)}`
            : keyValue.substring(0, Math.min(4, keyValue.length)) + '...';
          console.log(`   Key value: ${maskedKey} (length: ${keyValue.length})`);
        }
      }
    } else {
      console.log(`❌ ${testPath} does not exist`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${testPath}:`, error.message);
  }
}

// Check Next.js specific environment loading
console.log('\n⚡ Next.js Environment Check:');
console.log('----------------------------');

// Check if we're in a Next.js context
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.js found');
  try {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    if (nextConfig.includes('env') || nextConfig.includes('environment')) {
      console.log('✅ next.config.js contains environment configuration');
    } else {
      console.log('ℹ️  next.config.js does not contain explicit environment configuration');
    }
  } catch (error) {
    console.log('❌ Error reading next.config.js:', error.message);
  }
} else {
  console.log('❌ next.config.js not found');
}

console.log('\n🎯 Summary:');
console.log('===========');
console.log(`Environment file found: ${envFileFound ? 'Yes' : 'No'}`);
console.log(`ANTHROPIC_API_KEY set: ${process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
console.log(`NEXT_PUBLIC_ANTHROPIC_API_KEY set: ${process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);

if (process.env.ANTHROPIC_API_KEY) {
  const key = process.env.ANTHROPIC_API_KEY;
  const isLikelyValid = key.startsWith('sk-ant-') && key.length > 20;
  console.log(`API key format appears valid: ${isLikelyValid ? 'Yes' : 'No'}`);
}

console.log('\n💡 Recommendations:');
console.log('==================');
if (!envFileFound) {
  console.log('1. Create a .env.local file in the frontend directory');
  console.log('2. Add your Anthropic API key: ANTHROPIC_API_KEY=sk-ant-...');
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('3. Ensure ANTHROPIC_API_KEY is set in your environment file');
}
if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
  console.log('4. Check that your API key starts with "sk-ant-"');
} 