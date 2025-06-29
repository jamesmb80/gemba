# GembaFix.ai - Product Requirements Document (PRD)

## PROJECT INFORMATION
**Project Name:** GembaFix.ai  
**Project Type:** Manufacturing Troubleshooting SaaS Web Application  
**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Express.js (API), Supabase (Database, Auth, Storage)

**Project Description:**
GembaFix.ai is an AI-powered manufacturing troubleshooting application that helps electrical engineers resolve equipment issues faster by providing instant access to machine manuals through conversational AI. The system automatically logs all troubleshooting sessions to build institutional knowledge and reduce dependency on external engineering support.

**Key Features (Phase 1 MVP):**
- Feature 1: Machine-centric interface with responsive grid navigation and dashboard system
- Feature 2: AI-powered conversational troubleshooting with text input and confidence indicators
- Feature 3: Comprehensive document management with PDF upload, storage, and AI-accessible search
- Feature 4: Automatic session logging with smart completion detection and searchable history
- Feature 5: Performance monitoring dashboard with AI analytics and document optimization recommendations
- Feature 6: Multi-user authentication system with role-based access for initial 2-user deployment
- Feature 7: Complete responsive UI following established design patterns and component architecture

## DESIGN SYSTEM INTEGRATION
**Design System Used:** Custom React Component Library (based on provided code)
**Design Assets Available:**
- [x] Component export files (.tsx with strict TypeScript interfaces)
- [x] Complete application structure and navigation patterns
- [x] Tailwind CSS utility classes and responsive design system
- [x] Component hierarchy and interaction patterns

**Visual Compliance Requirements:**
- All UI components must match the provided component architecture exactly (pixel-perfect implementation)
- Interactive states (hover, focus, active, disabled) must replicate existing component specifications
- Responsive behavior must follow Tailwind CSS breakpoints (sm:, md:, lg:, xl:) precisely
- Machine-first navigation pattern must be preserved across all features
- Color scheme consistency: Blue-900 header, slate-100 background, white cards with proper shadows

## COMPREHENSIVE CODING STANDARDS (MANDATORY)

### TypeScript Standards
- **Strict Mode Required:** tsconfig.json must have strict: true with no exceptions
- **No 'any' Types:** Prohibited - all props, state, and function parameters must be properly typed
- **Interface Definitions:** All React components must have TypeScript interfaces for props
- **Return Type Annotations:** Functions should specify return types explicitly (JSX.Element, void, etc.)
- **Null Safety:** Proper handling of undefined/null values with optional chaining and null checks

### Code Quality Standards
- **ESLint Configuration:** React-specific rules with TypeScript integration
- **Prettier Formatting:** Consistent code formatting matching existing codebase style
- **Pre-commit Hooks:** Automated quality checks before code commits
- **Import Organization:** React imports first, then Lucide icons, then relative imports
- **No Unused Variables:** Strict enforcement - remove all unused imports and variables

### React/TypeScript Component Standards
- **Component Architecture:** Functional components with hooks only (following existing pattern)
- **Single Responsibility:** Each component handles one specific UI concern
- **Props Interface:** TypeScript interfaces for all component props with proper naming
- **Custom Hooks:** Extract reusable stateful logic (API calls, form handling, etc.)
- **Error Boundaries:** Proper error handling for API failures and component crashes
- **Performance:** Use React.memo for expensive re-renders, proper dependency arrays

### Project Structure Standards (Must Follow Next.js App Router)
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── page.tsx           # Home screen with machine grid
│   │   ├── machine/[id]/
│   │   │   ├── page.tsx       # Machine dashboard
│   │   │   ├── chat/page.tsx  # AI chat interface
│   │   │   ├── history/page.tsx # Session history
│   │   │   └── manual/page.tsx  # Document viewer
│   │   └── admin/page.tsx     # Performance dashboard
│   ├── api/
│   │   ├── auth/              # Supabase auth endpoints
│   │   ├── machines/          # Machine CRUD operations
│   │   ├── sessions/          # Session management
│   │   ├── documents/         # Document upload/processing
│   │   └── ai/                # AI chat endpoints
│   ├── globals.css            # Tailwind imports
│   ├── layout.tsx             # Root layout with auth
│   └── page.tsx               # Landing/redirect page
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── auth/                  # Authentication components
│   ├── dashboard/             # Dashboard-specific components
│   └── machine/               # Machine-related components
├── lib/
│   ├── supabase/              # Supabase client and utilities
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   └── types/                 # TypeScript type definitions
├── middleware.ts              # Next.js middleware for auth
└── supabase/
    ├── migrations/            # Database migrations
    └── types.ts               # Generated Supabase types
```

### File Naming Conventions (Next.js App Router)
- **Pages:** page.tsx, layout.tsx, loading.tsx, error.tsx (Next.js conventions)
- **Components:** PascalCase.tsx (ChatInterface.tsx, SessionHistory.tsx)
- **API Routes:** route.ts in api/ directories (Next.js App Router)
- **Utilities:** camelCase.ts (supabaseClient.ts, documentProcessor.ts)
- **Constants:** UPPER_SNAKE_CASE in constants.ts
- **Hooks:** camelCase with 'use' prefix (useSupabase.ts, useAIChat.ts)
- **Types:** camelCase.types.ts or generated supabase types

### API & Data Standards
- **Supabase Integration:** Use Supabase client with proper error handling and TypeScript
- **Row Level Security:** Implement RLS policies for all database tables
- **Real-time Subscriptions:** Use Supabase real-time for session updates
- **File Upload:** Supabase Storage with secure upload policies
- **Input Validation:** Schema validation using Zod for all form inputs and API data
- **Type Safety:** Generated Supabase TypeScript types for all database operations
- **Security:** Environment variables for API keys, RLS for data access control
- **Performance:** Efficient queries with Supabase indexes, optimized file storage

### Development Workflow Standards
- **Git Workflow:** Feature branch strategy with descriptive commit messages
- **Code Review:** Pull request templates with component functionality checklists
- **Testing Strategy:** Component testing with React Testing Library, Supabase local development
- **Database Management:** Supabase migrations for schema changes
- **Environment Management:** Next.js environment variables with Supabase configuration
- **Local Development:** Supabase CLI for local database and storage emulation

## QUALITY GATES (ALL MUST PASS)

### Code Quality Gates
- [ ] TypeScript compilation with zero errors in strict mode
- [ ] ESLint passes with zero warnings following React best practices
- [ ] Prettier formatting applied consistently matching existing code style
- [ ] All components have proper TypeScript interfaces
- [ ] No console.log statements in production code
- [ ] Proper error handling for all async operations

### Design Compliance Gates
- [ ] Pixel-perfect match with existing component library and design patterns
- [ ] Machine-first navigation pattern preserved and enhanced
- [ ] Responsive design works correctly at all Tailwind breakpoints
- [ ] Interactive states match existing hover/focus/active patterns
- [ ] Loading states and error states follow established UI patterns
- [ ] Accessibility compliance with proper ARIA labels and keyboard navigation

### Functional Quality Gates
- [ ] AI confidence indicators display correctly for all responses
- [ ] Document upload and PDF processing functions properly
- [ ] Session logging captures all required troubleshooting data
- [ ] Search functionality works across sessions and documents
- [ ] Multi-user authentication prevents unauthorized access
- [ ] Text-based chat interface provides smooth user experience

## PROJECT OVERVIEW & OBJECTIVES

### Primary Objectives
1. **Faster Problem Resolution:** Reduce troubleshooting time from hours/days to minutes through AI-powered manual search and conversational interface
2. **Knowledge Preservation:** Automatically capture all troubleshooting conversations to build searchable institutional memory
3. **Cost Reduction:** Minimize expensive external engineering callouts by empowering internal engineers with AI assistance
4. **Safety Enhancement:** Provide confidence indicators to help engineers make informed decisions about AI suggestions
5. **Scalable Foundation:** Build MVP architecture that can scale to 20-30 machines and additional user types

### Success Metrics
- **Primary:** Time from problem identification to solution implementation
- **Secondary:** Number of external engineering callouts avoided
- **Tertiary:** User adoption rate and daily session volume
- **Quality:** AI response confidence scores and user satisfaction ratings

## TECHNICAL ARCHITECTURE WITH STANDARDS INTEGRATION

### Frontend Architecture
- **Framework:** Next.js 14+ with React 18+ and TypeScript in strict mode
- **Styling:** Tailwind CSS following existing utility-first approach
- **State Management:** React useState and useContext for navigation and machine selection
- **Document Handling:** PDF.js integration for manual viewing and processing
- **API Integration:** Next.js API routes with Express.js middleware for complex operations
- **UI Components:** Existing component library with Lucide React icons
- **Authentication:** Supabase Auth with built-in user management
- **File Storage:** Supabase Storage for PDF documents and machine images

### Backend Architecture Requirements
- **API Design:** Next.js API routes with Express.js for complex operations
- **Database:** Supabase PostgreSQL with real-time subscriptions
- **Document Storage:** Supabase Storage buckets with row-level security
- **Session Management:** Supabase database tables with automatic timestamping
- **AI Integration:** OpenAI/Claude API integration with confidence scoring
- **Authentication:** Supabase Auth with JWT tokens and row-level security
- **Real-time Updates:** Supabase real-time subscriptions for session updates

### Data Architecture
- **Machine Data:** Supabase PostgreSQL tables with machine profiles and documentation links
- **Session Data:** Real-time conversation logs with automatic timestamping and metadata extraction
- **User Data:** Supabase Auth user profiles with session history and preferences
- **Document Data:** Supabase Storage for PDFs with metadata in PostgreSQL tables for AI-searchable indexing
- **Real-time Features:** Supabase subscriptions for live session updates and collaboration

## HIGH-LEVEL FEATURE REQUIREMENTS

### Feature 1: Machine-Centric Navigation System
**Description:** Responsive grid-based machine selection interface with detailed dashboards for each machine
**Requirements:**
- Grid layout displaying machine tiles with status indicators and last activity timestamps
- Machine dashboard with three primary actions: Chat, Manual, History
- Breadcrumb navigation system maintaining context across all screens
- Empty state handling for new installations with machine addition workflow
- Search and filter capabilities for managing 20-30 machines efficiently
**Standards:** Must follow existing component architecture and Tailwind responsive patterns
**Acceptance Criteria:** Navigation preserves state, responsive design works on all devices, loading states handle API delays

### Feature 2: AI Conversational Troubleshooting Interface
**Description:** Text-based chat interface with AI assistant providing machine-specific troubleshooting guidance
**Requirements:**
- Text input with proper form handling and validation
- Send button and keyboard shortcuts for message submission
- Confidence indicator system (🟢🟡🔴) for all AI responses
- Real-time conversation with machine context awareness
- Integration with machine-specific documentation for accurate responses
- Session persistence and automatic save functionality
- Loading states during AI processing
**Standards:** Must integrate with existing ChatInterface.tsx patterns and interaction design
**Acceptance Criteria:** Chat interface responds smoothly, confidence indicators display accurately, AI responses reference correct machine manuals

### Feature 3: Comprehensive Document Management System
**Description:** PDF upload, storage, and AI-accessible document organization using Supabase Storage linked to specific machines
**Requirements:**
- Supabase Storage integration for secure PDF upload with bucket policies
- Machine-specific document organization using PostgreSQL foreign keys
- AI-searchable document indexing stored in Supabase tables for troubleshooting queries
- Document viewer with zoom, navigation, and search capabilities
- Document metadata management in PostgreSQL (title, sections, last updated, file paths)
- Usage analytics stored in Supabase to identify most/least accessed documents
- Row-level security policies for document access control
**Standards:** Must integrate with Supabase Storage APIs and follow security best practices
**Acceptance Criteria:** PDFs upload to Supabase Storage successfully, AI can search document content via database queries, viewer displays all document types properly

### Feature 4: Automatic Session Logging and History Management
**Description:** Complete troubleshooting session capture using Supabase real-time database with intelligent completion detection
**Requirements:**
- Automatic conversation logging with Supabase PostgreSQL and real-time subscriptions
- Timestamps and user identification using Supabase Auth integration
- Smart session completion with AI follow-up stored in database tables
- Problem/solution metadata extraction and summarization in structured database fields
- Real-time searchable session history by machine, problem type, engineer, and keywords using PostgreSQL full-text search
- Session detail view with complete conversation transcripts from database
- Export functionality for session reports using Supabase database queries
- Row-level security ensuring users only see authorized sessions
**Standards:** Must utilize Supabase real-time features and PostgreSQL search capabilities
**Acceptance Criteria:** All conversations save automatically to Supabase, real-time updates work properly, search returns relevant results using database queries

### Feature 5: System Performance Monitoring Dashboard
**Description:** Analytics dashboard using Supabase database queries and real-time subscriptions for AI performance and system optimization
**Requirements:**
- Document access analytics using Supabase database views and aggregations
- AI confidence score tracking stored in PostgreSQL with trend analysis
- User engagement metrics calculated from Supabase session data
- Document quality recommendations based on usage patterns from database analytics
- System performance monitoring (response times, error rates) stored in Supabase tables
- Real-time dashboard updates using Supabase subscriptions
- Troubleshooting pattern analysis using PostgreSQL window functions
**Standards:** Must utilize Supabase analytics capabilities and real-time subscriptions
**Acceptance Criteria:** Analytics display accurate data from Supabase, real-time updates function properly, dashboard performance remains optimal

### Feature 6: Multi-User Authentication System
**Description:** Supabase Auth integration supporting initial 2-user deployment with scalable role-based access
**Requirements:**
- Supabase Auth integration with email/password authentication
- User profile management using Supabase user metadata and custom tables
- Session isolation and security using Supabase RLS policies
- Password reset functionality through Supabase Auth email templates
- Audit logging using Supabase database triggers and functions
- Row-level security policies for all user data access
- Foundation for future role-based permissions using Supabase Auth roles
- Next.js middleware integration for route protection
**Standards:** Must utilize Supabase Auth best practices and security features
**Acceptance Criteria:** Supabase Auth prevents unauthorized access, RLS policies secure user data, authentication flows work seamlessly

### Feature 7: Enhanced UI/UX Implementation
**Description:** Complete responsive user interface following established design patterns optimized for industrial use
**Requirements:**
- Touch-friendly interface suitable for industrial tablet usage
- Industrial environment compatibility (high contrast, clear visual hierarchy)
- Progressive disclosure preventing cognitive overload during troubleshooting
- Loading states and error handling for all user interactions
- Accessibility compliance maintaining usability in various conditions
- Mobile-first responsive design scaling to tablet and desktop usage
- Consistent iconography using Lucide React icon library
**Standards:** Must strictly follow existing component library and Tailwind CSS patterns
**Acceptance Criteria:** Interface works on industrial tablets, responsive design adapts to all screen sizes, accessibility standards met

## QUALITY ASSURANCE FRAMEWORK

### Testing Strategy
- **Component Testing:** React Testing Library for all interactive components
- **Integration Testing:** API endpoint testing with mock data
- **Document Testing:** PDF processing and AI search functionality
- **Performance Testing:** Load testing for document upload and AI response times
- **Security Testing:** Authentication and authorization validation
- **User Interface Testing:** Cross-browser compatibility and responsive design validation

### Validation Requirements
- **AI Response Time:** Under 3 seconds for standard troubleshooting queries
- **Document Processing:** PDF upload to Supabase Storage and indexing within 30 seconds
- **Search Performance:** Session and document search using PostgreSQL queries under 1 second
- **Real-time Updates:** Supabase subscriptions deliver updates within 500ms
- **Mobile Performance:** Full functionality on industrial tablets and smartphones
- **Database Performance:** Supabase queries optimized with proper indexing
- **Accessibility:** WCAG 2.1 AA compliance for industrial environment usage

### Deployment Standards
- **Staging Environment:** Separate Supabase project for testing with identical schema
- **Progressive Deployment:** Feature flags using Supabase Edge Functions for gradual rollout
- **Monitoring:** Supabase dashboard monitoring with custom logging tables
- **Backup Strategy:** Automated Supabase backups with point-in-time recovery
- **Recovery Planning:** Disaster recovery procedures using Supabase backup restoration
- **Environment Variables:** Next.js environment configuration for Supabase keys
- **Database Migrations:** Version-controlled Supabase migrations for schema changes

## ACCEPTANCE CRITERIA TEMPLATES

### Component Development Template
Every UI component must meet these criteria:
- [ ] TypeScript interface defined for all props with proper types
- [ ] Responsive design works at sm:, md:, lg:, and xl: breakpoints
- [ ] Loading and error states handled gracefully
- [ ] Accessibility attributes (aria-labels, proper focus management)
- [ ] Hover, focus, and active states match design specifications
- [ ] Component documented with usage examples

### Feature Implementation Template
Every feature must meet these criteria:
- [ ] Core functionality works as specified in requirements
- [ ] Error handling prevents application crashes
- [ ] User feedback provided for all actions (success/error messages)
- [ ] Data persistence functions correctly
- [ ] Performance meets specified benchmarks
- [ ] Security requirements implemented and tested

### API Integration Template
Every API integration must meet these criteria:
- [ ] Supabase TypeScript types used for all database operations
- [ ] Row-level security policies implemented and tested
- [ ] Comprehensive error handling with user-friendly messages
- [ ] Proper Supabase Auth integration with middleware protection
- [ ] Real-time subscriptions properly configured where needed
- [ ] Input validation using Zod schemas
- [ ] Integration tests covering database operations and auth flows

## RISK MITIGATION STRATEGIES

### Technical Risks
- **Supabase Service Downtime:** Implement proper error boundaries and offline fallback mechanisms
- **Database Performance:** Optimize queries with proper indexing and implement caching strategies
- **File Storage Limits:** Monitor Supabase Storage usage and implement file size controls
- **Real-time Connection Issues:** Graceful degradation when subscriptions fail
- **AI Service Downtime:** Graceful degradation to manual search, error messaging
- **Document Processing Issues:** File validation, format conversion, manual fallback
- **Authentication Failures:** Session recovery, proper error handling, Supabase Auth fallback

### User Experience Risks
- **Learning Curve:** Intuitive interface design, progressive disclosure, user training materials
- **Industrial Environment Challenges:** High contrast UI, large touch targets, clear visual hierarchy
- **Session Loss:** Automatic saving, recovery mechanisms, progress indicators
- **Document Access Issues:** Multiple upload methods, format validation, clear error messages

### Business Risks
- **Low Adoption:** User feedback integration, iterative improvement, training support
- **Data Security:** Encryption, access controls, audit logging, compliance validation
- **Scalability Limitations:** Performance monitoring, architecture review, optimization planning
- **AI Accuracy Concerns:** Confidence indicators, manual verification options, continuous improvement

## SUCCESS METRICS & DEFINITION OF DONE

### Definition of Done (Per Feature)
A feature is considered complete when:
- [ ] All acceptance criteria met and validated
- [ ] Code passes all quality gates (TypeScript, ESLint, testing)
- [ ] UI matches design specifications exactly
- [ ] Performance benchmarks achieved
- [ ] Security requirements implemented
- [ ] Documentation completed (technical and user)
- [ ] Integration testing completed successfully
- [ ] User acceptance testing passed

### Project Success Metrics
- **Technical Success:** Zero critical bugs, 95% uptime, sub-3-second response times
- **User Success:** Daily active usage by both initial users, positive feedback scores
- **Business Success:** Measurable reduction in troubleshooting time, reduced external callouts
- **Quality Success:** AI confidence scores above 80%, session completion rate above 90%

### Long-term Success Indicators
- **Knowledge Growth:** Increasing database of solved problems and searchable solutions
- **System Learning:** Improved AI responses over time based on session feedback
- **Scalability Proof:** System handles additional machines and users without degradation
- **Foundation Validation:** Architecture supports planned Phase 2 and Phase 3 enhancements

This PRD provides the comprehensive framework for Taskmaster-AI to generate detailed, implementable tasks while ensuring every component meets the strict coding standards and design compliance requirements established by the existing GembaFix.ai codebase.