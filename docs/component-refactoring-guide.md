# Component Refactoring Guide

## Overview
This guide details how to break down the overly complex components into smaller, focused, maintainable pieces.

## 1. App.tsx Refactoring (364 lines → Multiple Components)

### Current Problems:
- Handles navigation, auth, data fetching, and UI all in one component
- Complex conditional rendering logic
- Multiple useEffect hooks causing re-render cascades
- Difficult to test individual features

### New Architecture:

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home/redirect logic
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout wrapper
│   │   └── login/
│   │       └── page.tsx        # Login page
│   └── (dashboard)/
│       ├── layout.tsx          # Dashboard layout with navigation
│       ├── machines/
│       │   ├── page.tsx        # Machines list
│       │   └── [id]/
│       │       ├── page.tsx    # Machine detail
│       │       ├── chat/
│       │       │   └── page.tsx # Chat interface
│       │       └── manuals/
│       │           └── page.tsx # Manual viewer
│       └── history/
│           └── page.tsx        # Session history
├── components/
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── QueryProvider.tsx
│   ├── navigation/
│   │   ├── NavigationBar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── NavigationItem.tsx
│   └── auth/
│       ├── AuthGuard.tsx
│       └── LoginForm.tsx
└── hooks/
    ├── useAuth.ts
    ├── useNavigation.ts
    └── useMachines.ts
```

### Implementation:

#### 1.1 Root Layout (app/layout.tsx)
```typescript
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

#### 1.2 Auth Provider (components/providers/AuthProvider.tsx)
```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    router.push('/machines');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### 1.3 Dashboard Layout (app/(dashboard)/layout.tsx)
```typescript
import { NavigationBar } from '@/components/navigation/NavigationBar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        <NavigationBar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
```

#### 1.4 Navigation Bar Component
```typescript
// components/navigation/NavigationBar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function NavigationBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/machines', label: 'Machines' },
    { href: '/history', label: 'History' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              GembaFix
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
        <Breadcrumbs />
      </div>
    </nav>
  );
}
```

## 2. ManualViewer Refactoring (381 lines → Multiple Components)

### Component Breakdown:

```
components/
├── manuals/
│   ├── ManualViewer.tsx        # Main container (50 lines)
│   ├── ManualList.tsx          # Document list (80 lines)
│   ├── ManualUpload.tsx        # Upload component (100 lines)
│   ├── ManualSearch.tsx        # Search bar (40 lines)
│   ├── ManualFilters.tsx       # Filter controls (60 lines)
│   ├── ManualCard.tsx          # Individual card (40 lines)
│   └── hooks/
│       ├── useManuals.ts       # Data fetching hook
│       └── useManualUpload.ts  # Upload logic hook
```

### Implementation:

#### 2.1 Main ManualViewer Container
```typescript
// components/manuals/ManualViewer.tsx
'use client';

import { useState } from 'react';
import { ManualList } from './ManualList';
import { ManualUpload } from './ManualUpload';
import { ManualSearch } from './ManualSearch';
import { ManualFilters } from './ManualFilters';
import { useManuals } from './hooks/useManuals';

interface ManualViewerProps {
  machineId: string;
}

export function ManualViewer({ machineId }: ManualViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { manuals, loading, error, refetch } = useManuals(machineId);

  const filteredManuals = manuals.filter((manual) => {
    const matchesSearch = manual.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || manual.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manuals & Documentation</h2>
        <ManualUpload machineId={machineId} onUploadComplete={refetch} />
      </div>

      <div className="flex gap-4">
        <ManualSearch value={searchTerm} onChange={setSearchTerm} />
        <ManualFilters value={filterType} onChange={setFilterType} />
      </div>

      <ManualList
        manuals={filteredManuals}
        loading={loading}
        error={error}
      />
    </div>
  );
}
```

#### 2.2 useManuals Hook
```typescript
// components/manuals/hooks/useManuals.ts
import { useState, useEffect } from 'react';
import { Manual } from '@/types/manual';
import { getManualsByMachineId } from '@/lib/api/manuals';

export function useManuals(machineId: string) {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManuals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getManualsByMachineId(machineId);
      setManuals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manuals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (machineId) {
      fetchManuals();
    }
  }, [machineId]);

  return {
    manuals,
    loading,
    error,
    refetch: fetchManuals,
  };
}
```

#### 2.3 ManualUpload Component
```typescript
// components/manuals/ManualUpload.tsx
'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useManualUpload } from './hooks/useManualUpload';

interface ManualUploadProps {
  machineId: string;
  onUploadComplete: () => void;
}

export function ManualUpload({ machineId, onUploadComplete }: ManualUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { upload, uploading, progress, error } = useManualUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await upload(file, machineId);
      onUploadComplete();
      setIsOpen(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="primary">
        <Upload className="w-4 h-4 mr-2" />
        Upload Manual
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Manual</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF files only (max 50MB)</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
              </div>

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## 3. ChatInterface Refactoring

### Component Breakdown:

```
components/
├── chat/
│   ├── ChatInterface.tsx       # Main container (60 lines)
│   ├── MessageList.tsx         # Message display (80 lines)
│   ├── MessageItem.tsx         # Individual message (50 lines)
│   ├── ChatInput.tsx           # Input component (70 lines)
│   ├── ChatHeader.tsx          # Header with controls (40 lines)
│   ├── ConfidenceIndicator.tsx # Confidence display (30 lines)
│   └── hooks/
│       ├── useChat.ts          # Chat logic hook
│       └── useChatSession.ts   # Session management
```

### Implementation:

#### 3.1 Main ChatInterface
```typescript
// components/chat/ChatInterface.tsx
'use client';

import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from './hooks/useChat';

interface ChatInterfaceProps {
  machineId: string;
  machineName: string;
}

export function ChatInterface({ machineId, machineName }: ChatInterfaceProps) {
  const {
    messages,
    loading,
    sending,
    sessionId,
    sendMessage,
    exportSession,
    clearSession,
  } = useChat(machineId);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <ChatHeader
        machineName={machineName}
        onExport={exportSession}
        onClear={clearSession}
        hasMessages={messages.length > 0}
      />
      
      <MessageList
        messages={messages}
        loading={loading}
      />
      
      <ChatInput
        onSend={sendMessage}
        disabled={sending || !sessionId}
        placeholder={`Ask about ${machineName}...`}
      />
    </div>
  );
}
```

#### 3.2 useChat Hook
```typescript
// components/chat/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types/chat';
import { createSession, sendMessage as apiSendMessage } from '@/lib/api/chat';
import { exportSessionData } from '@/lib/utils/export';

export function useChat(machineId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await createSession(machineId);
        setSessionId(session.id);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };

    initSession();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [machineId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || sending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setSending(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await apiSendMessage(
        sessionId,
        content,
        abortControllerRef.current.signal
      );

      setMessages(prev => [...prev, response]);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to send message:', error);
        // Handle error - show toast notification
      }
    } finally {
      setSending(false);
      abortControllerRef.current = null;
    }
  }, [sessionId, sending]);

  const exportSession = useCallback(() => {
    exportSessionData({
      sessionId: sessionId!,
      messages,
      machineId,
      exportedAt: new Date().toISOString(),
    });
  }, [sessionId, messages, machineId]);

  const clearSession = useCallback(async () => {
    setMessages([]);
    // Create new session
    const session = await createSession(machineId);
    setSessionId(session.id);
  }, [machineId]);

  return {
    messages,
    loading,
    sending,
    sessionId,
    sendMessage,
    exportSession,
    clearSession,
  };
}
```

#### 3.3 MessageList Component
```typescript
// components/chat/MessageList.tsx
'use client';

import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { Message } from '@/types/chat';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500 text-center">
          No messages yet. Start a conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      
      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
```

## 4. Performance Optimizations

### 4.1 Memoized Components
```typescript
// components/common/MemoizedComponents.tsx
import { memo } from 'react';

export const MemoizedMachineCard = memo(MachineCard, (prev, next) => {
  return (
    prev.machine.id === next.machine.id &&
    prev.machine.status === next.machine.status &&
    prev.machine.lastUpdated === next.machine.lastUpdated
  );
});

export const MemoizedMessageItem = memo(MessageItem, (prev, next) => {
  return prev.message.id === next.message.id;
});
```

### 4.2 Virtual Scrolling for Long Lists
```typescript
// components/common/VirtualList.tsx
import { VariableSizeList as List } from 'react-window';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemSize: (index: number) => number;
  renderItem: (props: { index: number; style: React.CSSProperties }) => React.ReactNode;
}

export function VirtualList<T>({ items, height, itemSize, renderItem }: VirtualListProps<T>) {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemSize}
      width="100%"
    >
      {renderItem}
    </List>
  );
}
```

### 4.3 Optimized Data Fetching
```typescript
// lib/api/optimized.ts
import { useQuery, useQueries } from '@tanstack/react-query';

// Batch fetch sessions with messages
export function useSessionsWithMessages(userId: string) {
  const sessionsQuery = useQuery({
    queryKey: ['sessions', userId],
    queryFn: () => fetchUserSessions(userId),
  });

  const messageQueries = useQueries({
    queries: (sessionsQuery.data || []).map(session => ({
      queryKey: ['messages', session.id],
      queryFn: () => fetchSessionMessages(session.id),
      enabled: !!sessionsQuery.data,
    })),
  });

  return {
    sessions: sessionsQuery.data,
    messages: messageQueries.map(q => q.data).filter(Boolean),
    loading: sessionsQuery.isLoading || messageQueries.some(q => q.isLoading),
  };
}
```

## Summary

This refactoring plan:
1. Breaks down monolithic components into focused, single-responsibility components
2. Implements proper separation of concerns
3. Adds performance optimizations through memoization and virtual scrolling
4. Creates reusable hooks for business logic
5. Improves testability by isolating functionality
6. Reduces component complexity to under 100 lines each
7. Implements proper TypeScript typing throughout

The result will be a more maintainable, performant, and scalable codebase.