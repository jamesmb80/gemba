# Security Fixes Implementation Guide

## Critical Security Issues to Address

### 1. API Key Exposure in anthropic-proxy Route

**Current Security Vulnerability**:
```typescript
// DANGEROUS - Reading filesystem directly
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
```

**Secure Implementation**:
```typescript
// frontend/src/app/api/anthropic-proxy/route.ts
export async function POST(request: Request) {
  // Use Next.js built-in env handling
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured in environment');
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 }
    );
  }

  try {
    const { messages, model = 'claude-3-sonnet-20240229' } = await request.json();
    
    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Make API call with proper error handling
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. Input Validation with Zod

**Installation**:
```bash
cd frontend && npm install zod
```

**Validation Schemas**:
```typescript
// frontend/src/lib/validation/schemas.ts
import { z } from 'zod';

// Machine validation
export const machineSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  status: z.enum(['operational', 'maintenance', 'error']),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
});

// Chat message validation
export const chatMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  role: z.enum(['user', 'assistant']),
  sessionId: z.string().uuid(),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9\s\-._()]+\.(pdf|PDF)$/),
  size: z.number().max(50 * 1024 * 1024), // 50MB max
  type: z.literal('application/pdf'),
});

// PDF path validation
export const pdfPathSchema = z.object({
  machineId: z.string().uuid(),
  manualId: z.string().uuid(),
  filename: z.string().regex(/^[a-zA-Z0-9\-._]+\.pdf$/),
});
```

**API Route Protection**:
```typescript
// frontend/src/app/api/machines/route.ts
import { machineSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = machineSchema.parse(body);
    
    // Process with validated data
    const machine = await createMachine(validatedData);
    
    return NextResponse.json(machine);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Authentication & Authorization

**Middleware Protection**:
```typescript
// frontend/src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (!session && !req.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // Protect app routes
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/api/((?!auth).)*',
    '/((?!login|_next/static|_next/image|favicon.ico).)*',
  ],
};
```

### 4. Content Security Policy

**Next.js Configuration**:
```typescript
// frontend/next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.supabase.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: *.supabase.co",
      "font-src 'self'",
      "connect-src 'self' *.supabase.co *.anthropic.com",
      "frame-src 'self' *.supabase.co",
    ].join('; ')
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 5. Secure Session Management

**Session Configuration**:
```typescript
// frontend/src/lib/auth/session.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getServerSession() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Session error:', error);
    return null;
  }

  // Validate session
  if (session?.expires_at) {
    const expiresAt = new Date(session.expires_at * 1000);
    if (expiresAt < new Date()) {
      await supabase.auth.signOut();
      return null;
    }
  }

  return session;
}

// Rate limiting for auth attempts
const loginAttempts = new Map<string, { count: number; resetAt: Date }>();

export async function validateLoginAttempt(email: string): Promise<boolean> {
  const attempt = loginAttempts.get(email);
  const now = new Date();
  
  if (!attempt || attempt.resetAt < now) {
    loginAttempts.set(email, {
      count: 1,
      resetAt: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes
    });
    return true;
  }
  
  if (attempt.count >= 5) {
    return false; // Too many attempts
  }
  
  attempt.count++;
  return true;
}
```

### 6. File Upload Security

**Secure Upload Handler**:
```typescript
// frontend/src/app/api/upload/route.ts
import { fileUploadSchema } from '@/lib/validation/schemas';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = fileUploadSchema.safeParse({
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid file', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Generate secure filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const secureFilename = `${crypto.randomUUID()}.${fileExt}`;
    
    // Scan file content (placeholder for actual virus scanning)
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check for PDF magic bytes
    const pdfMagicBytes = [0x25, 0x50, 0x44, 0x46]; // %PDF
    const isPDF = pdfMagicBytes.every((byte, index) => bytes[index] === byte);
    
    if (!isPDF) {
      return NextResponse.json(
        { error: 'Invalid PDF file' },
        { status: 400 }
      );
    }

    // Save file securely (implementation depends on storage solution)
    // ...

    return NextResponse.json({
      filename: secureFilename,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### 7. XSS Prevention

**Safe Content Rendering**:
```typescript
// frontend/src/lib/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

export function escapeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

// Component usage
import { sanitizeHTML } from '@/lib/utils/sanitize';

export function MessageDisplay({ content }: { content: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHTML(content) 
      }} 
    />
  );
}
```

### 8. Environment Variable Security

**.env.local.example**:
```env
# Public variables (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-only variables (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DATABASE_URL=your_database_url

# Security configuration
SESSION_SECRET=generate_random_32_char_string
ENCRYPTION_KEY=generate_random_32_char_string
```

**Runtime Validation**:
```typescript
// frontend/src/lib/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Missing or invalid environment variables');
  }
}

// Call during app initialization
validateEnv();
```

## Implementation Checklist

- [ ] Remove filesystem API key reading
- [ ] Implement Zod validation schemas
- [ ] Add authentication middleware
- [ ] Configure Content Security Policy
- [ ] Implement rate limiting
- [ ] Secure file upload handling
- [ ] Add XSS prevention
- [ ] Validate environment variables
- [ ] Add security headers
- [ ] Implement CSRF protection
- [ ] Add request logging for security monitoring
- [ ] Set up error boundaries to prevent info leakage
- [ ] Configure HTTPS in production
- [ ] Implement session timeout handling
- [ ] Add security scanning to CI/CD pipeline