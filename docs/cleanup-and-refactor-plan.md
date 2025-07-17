# GembaFix Cleanup and Refactor Plan

## Overview
This plan addresses critical security issues, documentation bloat, performance problems, and architectural concerns identified in the code review.

## Phase 1: Critical Security & Stability Issues (Immediate)

### 1.1 Fix API Key Security Vulnerability
**File**: `frontend/src/app/api/anthropic-proxy/route.ts`
**Issue**: Reading .env.local directly from filesystem
**Solution**:
```typescript
// Remove lines 17-28 that read filesystem
// Replace with:
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
}
```

### 1.2 Fix Memory Leaks
**Files**: `ChatInterface.tsx`, `ManualViewer.tsx`
**Solution**:
- Implement AbortController for all fetch requests
- Add proper cleanup in useEffect hooks
- Cancel ongoing operations when components unmount

### 1.3 Add Input Validation
**Implementation**:
1. Install Zod: `npm install zod`
2. Create validation schemas for:
   - Machine creation/update
   - Chat messages
   - File uploads
   - PDF path segments
3. Apply validation at API routes and form submissions

## Phase 2: Documentation & File Cleanup

### 2.1 Remove Redundant Files
```bash
# Files to delete:
rm migrate-to-hooks.sh
rm .github/instructions/taskmaster.md
rm docs/phase-4-completion-summary.md
```

### 2.2 Consolidate Quality Documentation
**Action**: Merge into single `docs/quality-and-development-guide.md`:
- `docs/phase-4-quality-gates.md`
- `docs/quality-framework.md`
- Relevant parts from command files

### 2.3 Streamline Command Structure
**Decision needed**: Should quality-check and track-progress be:
1. Separate commands (current state)
2. Integrated into CCI workflow
3. Converted to hooks that run automatically

## Phase 3: Architecture Refactoring

### 3.1 Break Down App.tsx
**New component structure**:
```
src/
├── components/
│   ├── navigation/
│   │   ├── NavigationProvider.tsx
│   │   ├── NavigationBar.tsx
│   │   └── useNavigation.ts
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── AuthGuard.tsx
│   │   └── useAuth.ts
│   └── layout/
│       ├── AppLayout.tsx
│       └── PageContainer.tsx
```

**App.tsx responsibilities**:
- Only top-level providers and layout
- Delegate navigation to NavigationProvider
- Delegate auth to AuthProvider
- Move page components to separate files

### 3.2 Implement Proper Routing
**Options**:
1. Use Next.js App Router properly with file-based routing
2. Implement client-side router (React Router)
3. Create custom routing solution

**Recommendation**: Leverage Next.js App Router:
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── machines/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── history/page.tsx
│   └── layout.tsx
```

### 3.3 Global State Management with Zustand
**Implementation**:
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// stores/machineStore.ts
interface MachineState {
  machines: Machine[];
  selectedMachine: Machine | null;
  isLoading: boolean;
  fetchMachines: () => Promise<void>;
  selectMachine: (id: string) => void;
}
```

## Phase 4: Component Refactoring

### 4.1 ManualViewer Decomposition
Break into:
- `ManualList.tsx` - Document listing
- `ManualUpload.tsx` - Upload functionality
- `ManualSearch.tsx` - Search interface
- `ManualFilters.tsx` - Filter controls
- `useManuals.ts` - Custom hook for manual operations

### 4.2 PDF Viewer Decision
**Option 1**: Implement real PDF.js
```typescript
// Install react-pdf v10
// Create proper PDFViewer with:
- Page navigation
- Zoom controls
- Full-text search
- Loading states
```

**Option 2**: Simplify to basic viewer
```typescript
// Remove non-functional controls
// Rename to DocumentViewer
// Clear about iframe limitations
```

### 4.3 ChatInterface Improvements
- Extract message rendering to `MessageList.tsx`
- Create `ChatInput.tsx` component
- Implement `useChat.ts` hook for chat logic
- Add proper TypeScript types for messages

## Phase 5: Performance Optimizations

### 5.1 Implement Memoization
**Components needing memo**:
- `filteredDocuments` in ManualViewer
- `renderConfidenceIndicator` in ChatInterface
- Breadcrumb rendering in Header
- Machine list rendering

### 5.2 Optimize Data Fetching
**Current issue**: Sequential fetching
**Solution**: Implement batch operations
```typescript
// Instead of:
for (const session of sessions) {
  const messages = await fetchMessages(session.id);
}

// Use:
const messagePromises = sessions.map(s => fetchMessages(s.id));
const allMessages = await Promise.all(messagePromises);
```

### 5.3 Implement Virtual Scrolling
For long lists:
- Machine list
- Document list
- Chat history
Use: `react-window` or `react-virtualized`

## Phase 6: Code Quality Improvements

### 6.1 Consistent Error Handling
**Pattern**:
```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(message: string, public code: string, public statusCode: number) {
    super(message);
  }
}

// Global error boundary
// Consistent toast notifications
// Proper error logging
```

### 6.2 API Service Layer
**Structure**:
```typescript
// services/api/base.ts
class APIClient {
  private axiosInstance: AxiosInstance;
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor for auth
    // Response interceptor for errors
  }
}

// services/api/machines.ts
class MachineService extends APIClient {
  async getAll(): Promise<Machine[]> {}
  async getById(id: string): Promise<Machine> {}
  async create(data: CreateMachineDto): Promise<Machine> {}
}
```

### 6.3 TypeScript Improvements
- Remove all `any` types
- Create proper DTOs for API communication
- Use discriminated unions for navigation state
- Implement proper generics for reusable components

## Phase 7: Testing & Documentation

### 7.1 Add Missing Tests
Priority areas:
- Authentication flow
- API error handling
- Form validation
- Critical user paths

### 7.2 Update Documentation
- Update CLAUDE.md with new architecture
- Create component documentation
- Add JSDoc comments for complex functions
- Update README with new structure

## Implementation Order

1. **Week 1**: Critical Security & Memory Leaks (Phase 1)
2. **Week 1**: Documentation Cleanup (Phase 2)
3. **Week 2**: App.tsx Refactoring & Routing (Phase 3.1-3.2)
4. **Week 2**: Global State Management (Phase 3.3)
5. **Week 3**: Component Refactoring (Phase 4)
6. **Week 3**: Performance Optimizations (Phase 5)
7. **Week 4**: Code Quality & Testing (Phase 6-7)

## Success Metrics

- [ ] No security vulnerabilities in code scan
- [ ] App.tsx under 100 lines
- [ ] All components under 200 lines
- [ ] 0 TypeScript errors
- [ ] Build time under 30 seconds
- [ ] Lighthouse performance score > 90
- [ ] Test coverage > 80%

## Risk Mitigation

1. **Create branch for each phase**
2. **Comprehensive testing after each change**
3. **Keep FIXES.md updated**
4. **Regular commits with descriptive messages**
5. **User acceptance testing for major changes**