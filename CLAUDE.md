# GembaFix Manufacturing App - Claude Code Development Guide

## Project Overview

GembaFix is a modern manufacturing troubleshooting application that helps technicians resolve equipment issues through AI-powered chat assistance and comprehensive manual management.

**Key Features:**
- Machine management and monitoring
- AI-powered troubleshooting chat interface
- PDF manual viewer with full-text search
- Session history tracking and export
- Real-time updates via Supabase
- User authentication system

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **PDF Processing**: react-pdf v10 with PDF.js
- **State Management**: Zustand
- **Testing**: Jest (unit), Playwright (e2e)
- **Icons**: Lucide React

## Project Structure

```
GembaFix/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   │   ├── api/            # API routes
│   │   │   ├── globals.css     # Global styles
│   │   │   └── page.tsx        # Main pages
│   │   ├── components/         # React components
│   │   ├── lib/               # Utilities and API clients
│   │   ├── types/             # TypeScript definitions
│   │   └── data/              # Constants and mock data
│   ├── public/                # Static assets
│   └── package.json          # Dependencies and scripts
├── package.json              # Root package.json
├── .mcp.json                # MCP server configuration
├── FIXES.md                  # Debug history and lessons learned
└── .cursor/                  # Cursor-specific rules and config
```

## 🚨 CRITICAL RULES FOR CLAUDE CODE

### 1. MANDATORY: Debug Logging in FIXES.md
**BEFORE and AFTER every debugging/fix attempt, you MUST update FIXES.md**

- **Before Starting**: Check FIXES.md for previous attempts on similar issues
- **Create Entry**: Add a new entry with the template BEFORE making changes
- **Update Entry**: After testing, update with outcome, side effects, and lessons learned

Example entry:
```markdown
## 2024-07-04 - PDF Viewer - ATTEMPTED ⏳
**Problem:** PDF viewer shows placeholder instead of content
**Root Cause:** PDF.js integration disabled in ManualDetail.tsx
**Attempted Solution:** Restore react-pdf imports and PDFDocument component
**Reasoning:** PDF.js dependencies are installed and Babel config supports private methods
**Code Changes:** frontend/src/components/ManualDetail.tsx, frontend/src/components/PDFViewer.tsx
**Testing Steps:** Navigate to Machine → Manual → Click document, verify PDF loads
**Outcome:** [TO BE UPDATED]
**Side Effects:** [TO BE UPDATED]
**Lessons Learned:** [TO BE UPDATED]
**Next Steps:** [TO BE UPDATED]
```

### 2. Environment File Protection
**NEVER edit environment files directly - they contain sensitive configuration**

- ❌ **Never use Edit on `.env*` files**
- ❌ **Never overwrite environment files with placeholders**
- ❌ **Never create environment files with real API keys**
- ❌ **Never modify `.mcp.json` files directly**

✅ **Instead:**
```bash
# Show user what to add
echo "Please add your API key to frontend/.env.local:"
echo "SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here"
```

### 3. Safety Rules - Critical for Beginners

- **NEVER perform bulk deletions** without explicit file review
- **Always create backup commits** before major changes
- **Test after EVERY change**, not after multiple changes
- **Never delete files matching patterns** like "* 2.tsx" without review
- **Always use Read before Edit** to understand current state
- **Prefer editing existing files** over creating new ones

### 4. Debugging Workflow Rules

1. **System First**: Check system logs, time, and environment before assuming code is broken
2. **Structured Approach**: API → Auth → Frontend → Rendering
3. **Add Logging**: Insert detailed logging before attempting fixes
4. **For Auth Errors**: Always verify system time first (JWT issues)
5. **For Browser Issues**: Check DevTools Network and Console tabs
6. **Use MCP Tools**: Leverage Playwright to see actual browser state

### 5. Testing & Verification Commands

After any code change, run this verification sequence:
```bash
cd frontend
npm run format        # Fix formatting
npm run lint          # Check for linting errors
npm run type-check    # Verify TypeScript
npm run build         # Ensure production build works
```

**IMPORTANT**: If any command fails, fix it before proceeding!

### 6. React & Next.js Specific Rules

- **Browser-only libraries**: Always use dynamic imports with `ssr: false`
- **React Refs**: Verify refs are not null before using them
- **Circular Dependencies**: Check for circular state dependencies
- **Callback Refs**: Use for timing-sensitive operations
- **PDF.js Integration**: Ensure worker file exists in public/

Example for browser-only imports:
```typescript
// ✅ DO: Dynamic import for browser-only libraries
const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

// ❌ DON'T: Direct import of browser-only libraries
import { Document, Page } from 'react-pdf';
```

### 7. File Management Rules

- **Always use absolute paths** starting from project root
- **Frontend paths**: Always include `frontend/` prefix
- **Read before Edit**: Use Read tool to verify current content
- **No unnecessary files**: Don't create documentation unless requested
- **Check patterns**: Review existing code patterns before implementing

### 8. Communication & Workflow

- **Explain before changing**: Tell user WHAT will change and WHY
- **Use TodoWrite**: Track multi-step operations with the todo tool
- **Progress updates**: Provide updates during long operations
- **Ask when uncertain**: Better to ask than assume
- **Reference line numbers**: Use `file:line` format (e.g., `ManualDetail.tsx:45`)

### 9. 🚨 MANDATORY: Attention-Required Notifications

**Claude Code MUST notify the user when their attention is required - NO EXCEPTIONS**

Use the `attention` command (with sound + voice + bell) when:
- **User input is needed** to proceed
- **Approval required** before making changes
- **Blocked by error** that prevents continuation
- **All tasks completed** and waiting for next instruction
- **Decision needed** between multiple options

**DO NOT notify for**:
- Individual task completions
- Successful operations that continue automatically
- Intermediate progress updates

**Required Notification Format:**
```bash
# ATTENTION REQUIRED (use these - they make sound!)
./gembafix-notify attention "user input" "Review 3 changes before proceeding"
./gembafix-notify attention "approval needed" "Ready to create GitHub issue - proceed?"
./gembafix-notify attention "blocked" "Cannot continue - missing API key"
./gembafix-notify attention "complete" "All tasks finished - awaiting instructions"

# Regular alerts (visual only - use sparingly)
./gembafix-notify alert "info" "Starting code analysis..."
```

**ENFORCEMENT**: Failure to notify when attention is required violates core instructions.

**Testing & Troubleshooting:**
```bash
./gembafix-notify test          # Test both notification types
./gembafix-notify sounds        # List available sounds
./gembafix-notify voices        # List available voices
./gembafix-notify help          # Full troubleshooting guide
```

### 10. 🚨 MANDATORY: GitHub Workflow & Project Management

**GitHub Projects Board Workflow - 6 Stage Kanban:**

1. **Backlog** - New issues from CCI command
2. **Research** - AI research and specification phase
3. **Ready** - Human-reviewed and approved
4. **In Progress** - Active development
5. **Review** - Code review and testing
6. **Done** - Completed and merged

**Required Commit/Push Strategy:**
```bash
# MANDATORY: Push after major task completions to main branch
git add .
git commit -m "feat: implement user authentication - resolves #12"
git push origin main
```

**Major Task Completion Triggers (MUST push):**
- ✅ **Complete feature implementation** (working end-to-end)
- ✅ **Bug fix with verification** (issue resolved + tested)  
- ✅ **Successful build + all tests passing** (full verification sequence)
- ✅ **Milestone completion** (Phase completion, major refactor)
- ✅ **Error resolution** (TypeScript errors fixed, lint clean)

**GitHub Projects Board Management:**
- **CCI Command** auto-assigns new issues to "Backlog"
- **Manual movement** initially (user decides lane changes)
- **Semi-automatic evolution** (Claude suggests moves, user approves)
- **Eventual automation** (Claude moves based on clear task status)

**Board Movement Guidelines:**
```bash
# When starting work on issue
gh project item-edit --project-id XXX --id XXX --field-id status --value "In Progress"

# When ready for review  
gh project item-edit --project-id XXX --id XXX --field-id status --value "Review"

# When completed
gh project item-edit --project-id XXX --id XXX --field-id status --value "Done"
```

**Issue Creation Integration:**
- `/project:cci [feature idea]` → Auto-creates GitHub issue → Auto-assigns to Backlog
- Issues include: Problem statement, solution vision, technical requirements, testing strategy
- Manufacturing review criteria automatically applied

## Essential Commands

```bash
# Development
cd frontend && npm run dev              # Start dev server (http://localhost:3000)
npm run build                          # Production build
npm run type-check                     # TypeScript checking

# Code Quality (RUN AFTER EVERY CHANGE)
npm run lint                           # ESLint
npm run format                         # Prettier formatting
npm run format:check                   # Check formatting

# Testing
npm run test                           # Jest unit tests
npm run test:unit                      # Jest with coverage
npm run test:e2e                       # Playwright e2e tests
npm run test:a11y                      # Accessibility tests

# Quick Verification Sequence
npm run format && npm run lint && npm run type-check && npm run build
```

## Environment Setup

Required environment variables in `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**IMPORTANT**: Never commit these files. Ask user to add their own keys.

## Test User Credentials

For testing and development purposes:
```
Email: james@example.com
Password: Password
```

**Note**: Use these credentials for comprehensive testing of authenticated features.

## Key Files and Directories

### Core Application
- `frontend/src/app/page.tsx` - Main application entry point
- `frontend/src/components/ChatInterface.tsx` - AI chat functionality
- `frontend/src/components/ManualViewer.tsx` - PDF manual viewer
- `frontend/src/components/PDFViewer.tsx` - PDF rendering component
- `frontend/src/lib/supabaseClient.ts` - Supabase configuration
- `frontend/src/lib/api.ts` - API client functions
- `FIXES.md` - **CHECK THIS FIRST** for debugging history

### API Routes
- `frontend/src/app/api/anthropic-proxy/route.ts` - AI chat proxy
- `frontend/src/app/api/pdf/[...path]/route.ts` - PDF serving

### Configuration
- `frontend/next.config.js` - Next.js configuration
- `frontend/tailwind.config.js` - Tailwind CSS setup
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/jest.config.js` - Test configuration

## Development Workflow

### Starting Development
1. `cd frontend && npm install`
2. Set up environment variables (ask user to add keys)
3. `npm run dev`
4. Visit http://localhost:3000

### Before Making Changes
1. **Read FIXES.md** to check for previous attempts
2. **Use Read tool** to understand current code
3. **Create FIXES.md entry** before starting
4. **Plan changes** using TodoWrite tool

### After Making Changes
1. Run verification sequence: `npm run format && npm run lint && npm run type-check && npm run build`
2. Test the actual user flow
3. Update FIXES.md entry with outcome
4. Check browser console for errors

## Code Conventions

- **TypeScript**: All new code must be TypeScript
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS classes, avoid inline styles
- **State**: Zustand for global state, useState for local
- **API**: Async/await pattern, proper error handling
- **Testing**: Test-driven development preferred
- **Comments**: Avoid unnecessary comments, code should be self-documenting

## Claude Code MCP Integration

This project is configured with MCP (Model Context Protocol) servers for enhanced development capabilities:

### Available MCP Servers
- **Supabase**: Database operations and management
  - Execute SQL queries
  - Manage database schema
  - Handle migrations
  - Monitor logs and performance
  - Check auth errors with `get_logs`
- **Playwright**: Browser automation and testing
  - Run E2E tests
  - Debug UI interactions
  - Generate test scenarios
  - Take screenshots for debugging
  - Check console errors

### MCP Best Practices
1. **Use Playwright** to verify UI changes actually work
2. **Check Supabase logs** when auth or API calls fail
3. **Take screenshots** before/after major UI changes
4. **Monitor console** for JavaScript errors
5. **Verify database state** matches UI expectations

Example MCP usage:
```typescript
// Check Supabase auth logs
mcp__supabase__get_logs({ service: "auth" })

// Take screenshot of current UI
mcp__playwright__browser_take_screenshot({ filename: "before-change.png" })

// Check browser console for errors
mcp__playwright__browser_console_messages()
```

## Common Issues & Solutions

### PDF Viewer
- Uses react-pdf v10 with PDF.js worker
- Worker file: `public/pdf.worker.min.js`
- Handle loading states and errors properly
- Check for circular dependencies in state

### Supabase Integration
- Client-side: `@supabase/supabase-js` with anon key
- Server-side: Service role key for admin operations
- Real-time subscriptions for live updates
- JWT errors often mean system time is wrong

### Build Issues
- Next.js 14 app router patterns
- TypeScript strict mode enabled
- Proper import/export syntax required
- Dynamic imports for browser-only code

### Authentication Issues
1. **Check system time** - JWT tokens are time-sensitive
2. **Verify environment variables** are loaded
3. **Check Supabase logs** for specific errors
4. **Service role key** only for server-side operations

## Debugging Checklist

When something doesn't work:

1. ✅ **Check FIXES.md** for similar issues
2. ✅ **Verify system time** is correct
3. ✅ **Check browser console** for errors
4. ✅ **Check Network tab** for failed requests
5. ✅ **Add console.log** statements to trace execution
6. ✅ **Use MCP tools** to inspect state
7. ✅ **Run build** to catch compile errors
8. ✅ **Test in incognito** to rule out cache issues
9. ✅ **Update FIXES.md** with findings

## Lessons from Project History

Based on this project's development:

1. **Bulk deletions are dangerous** - Lost entire project once
2. **System time affects auth** - JWT tokens fail with wrong time
3. **React refs can be null** - Always check before using
4. **PDF.js needs careful setup** - Worker file and version matching
5. **Service role key is powerful** - Only use server-side
6. **Test one change at a time** - Easier to debug
7. **Git is your safety net** - Commit before risky changes

## Important Reminders

- 🚨 **Always update FIXES.md before and after changes**
- 🔒 **Never edit .env files directly**
- 🧪 **Test after every single change**
- 📝 **Use TodoWrite to track complex tasks**
- 🔍 **Read existing code before creating new files**
- ✅ **Run the verification sequence before committing**
- 💬 **Ask user when uncertain about requirements**

---

This guide provides Claude Code with essential context and rules for safe, efficient development on the GembaFix manufacturing troubleshooting application. When in doubt, check FIXES.md and ask the user!