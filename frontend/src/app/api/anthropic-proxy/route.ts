import { NextRequest, NextResponse } from 'next/server';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Explicitly load .env.local file
config({ path: path.join(process.cwd(), '.env.local') });

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    
    // Try multiple sources for the API key
    let apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    
    // If we still get a placeholder, try reading directly from .env.local
    if (!apiKey || apiKey.includes('your-actual') || apiKey.length < 50) {
      try {
        const envPath = path.join(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
        if (match && match[1] && !match[1].includes('your-actual')) {
          apiKey = match[1].trim();
        }
      } catch (e) {
        console.log('Could not read .env.local directly:', e);
      }
    }
    
    console.log('Environment variables check:');
    console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('NEXT_PUBLIC_ANTHROPIC_API_KEY exists:', !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY);
    
    if (apiKey) {
      // Log the key details (masked for security)
      console.log('API key length:', apiKey.length);
      console.log('API key starts with sk-ant-:', apiKey.startsWith('sk-ant-'));
      console.log('API key first 10 chars:', apiKey.substring(0, 10));
      console.log('API key last 4 chars:', apiKey.substring(apiKey.length - 4));
      
      // Test if it's a placeholder
      if (apiKey.includes('your-actual') || apiKey.length < 50) {
        console.log('⚠️  WARNING: This appears to be a placeholder key!');
      } else {
        console.log('✅ Key appears to be a real API key');
      }
    }
    
    console.log('API key found, making request to Anthropic...');
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key not set' }, { status: 500 });
    }
    
    // Parse the body to properly update the model
    let requestBody;
    try {
      requestBody = JSON.parse(body);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    // Fix the request format for Anthropic API
    const messages = requestBody.messages || [];
    let systemMessage = '';
    
    // Extract system message from messages array if it exists
    const filteredMessages = messages.filter((msg: any) => {
      if (msg.role === 'system') {
        systemMessage = msg.content;
        return false; // Remove system message from messages array
      }
      return true;
    });
    
    // Create the properly formatted request for Anthropic
    const anthropicRequest = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: requestBody.max_tokens || 256,
      temperature: requestBody.temperature || 0.2,
      messages: filteredMessages,
      ...(systemMessage && { system: systemMessage }) // Add system as top-level parameter
    };
    
    console.log('Request body:', JSON.stringify(anthropicRequest, null, 2));
    
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicRequest),
    });
    
    console.log('Anthropic response status:', anthropicRes.status);
    console.log('Anthropic response headers:', Object.fromEntries(anthropicRes.headers.entries()));
    
    const responseBody = await anthropicRes.text();
    console.log('Anthropic response body:', responseBody);
    
    if (!anthropicRes.ok) {
      return NextResponse.json(
        { error: `Anthropic API error: ${anthropicRes.status}` },
        { status: anthropicRes.status }
      );
    }
    
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in anthropic proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 