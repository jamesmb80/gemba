# GembaFix Manufacturing Troubleshooting App - BMAD Brownfield Analysis

## Executive Summary

GembaFix is a modern web application designed to streamline manufacturing equipment troubleshooting through AI-powered assistance and comprehensive manual management. Built on Next.js 14 with Supabase backend, it provides technicians with intelligent support for resolving equipment issues efficiently.

## 1. Application Overview

### Purpose
GembaFix serves as a centralized platform for manufacturing floor technicians to:
- Access equipment manuals and documentation
- Receive AI-powered troubleshooting guidance
- Track troubleshooting sessions and solutions
- Manage machine information and maintenance history

### Target Users
- **Primary**: Manufacturing floor technicians and maintenance personnel
- **Secondary**: Production supervisors and maintenance managers
- **Tertiary**: Quality engineers and continuous improvement specialists

### Business Value
- **Reduced Downtime**: Faster issue resolution through AI assistance
- **Knowledge Retention**: Documented troubleshooting sessions capture tribal knowledge
- **Improved First-Time Fix Rate**: AI provides contextual solutions based on manuals
- **Data-Driven Insights**: Historical data enables predictive maintenance

## 2. Technical Architecture

### High-Level Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser       │────▶│   Next.js App   │────▶│   Supabase      │
│   (React UI)    │◀────│   (SSR/API)     │◀────│   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Anthropic AI   │     │  Edge Functions │
                        │  (Claude API)   │     │  (PDF Process)  │
                        └─────────────────┘     └─────────────────┘
```

### Technology Stack
- **Frontend Framework**: Next.js 14.2.18 (App Router)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand 4.4.7
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth with RLS
- **File Storage**: Supabase Storage
- **AI Integration**: Anthropic Claude API
- **PDF Processing**: react-pdf with PDF.js

### Deployment Architecture
- **Hosting**: Vercel (assumed based on Next.js)
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Storage**: Supabase Storage buckets

## 3. Core Features & Functionality

### 3.1 Machine Management
- **CRUD Operations**: Create, read, update, delete machine records
- **Department Organization**: Machines grouped by department
- **Maintenance Tracking**: Last maintenance date and history
- **Serial Number Management**: Unique identification for equipment

### 3.2 AI-Powered Troubleshooting
- **Contextual Chat Interface**: Real-time AI assistance
- **Manual Integration**: AI references uploaded manuals
- **Confidence Scoring**: AI indicates confidence level in responses
- **Session Persistence**: All conversations saved for reference

### 3.3 Document Management
- **PDF Upload**: Support for equipment manuals and documentation
- **Full-Text Search**: Search across all uploaded documents
- **Text Extraction**: Automatic extraction for AI context
- **Viewer Integration**: In-app PDF viewing with navigation

### 3.4 Session Management
- **Session Tracking**: Every troubleshooting session recorded
- **Export Functionality**: Export sessions for reporting
- **Historical Access**: Browse past troubleshooting sessions
- **Machine Association**: Sessions linked to specific equipment

## 4. Data Models & Schema

### Core Entities

#### Machine
```typescript
{
  id: string (UUID)
  name: string
  type?: string
  serial_number?: string
  department?: string
  install_date?: timestamp
  last_maintenance?: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

#### Document
```typescript
{
  id: string (UUID)
  machine_id: string (FK)
  filename: string
  storage_path: string
  file_size?: number
  mime_type?: string
  extracted_text?: text
  processing_status?: enum('pending', 'processing', 'completed', 'failed')
  created_at: timestamp
  updated_at: timestamp
}
```

#### ChatSession
```typescript
{
  id: string (UUID)
  machine_id: string (FK)
  user_id: string (FK)
  summary?: string
  created_at: timestamp
  updated_at: timestamp
}
```

#### ChatMessage
```typescript
{
  id: string (UUID)
  session_id: string (FK)
  sender: enum('user', 'ai')
  text: text
  confidence?: enum('high', 'medium', 'low')
  timestamp: timestamp
}
```

## 5. User Interface & Experience

### UI Components Structure
- **App Shell**: Navigation, header, authentication state
- **Machine Dashboard**: Central hub for machine-specific actions
- **Chat Interface**: Real-time troubleshooting conversations
- **Manual Viewer**: PDF viewing with search capabilities
- **Session History**: Historical troubleshooting records

### Design Patterns
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Basic WCAG compliance with room for improvement

## 6. Security & Authentication

### Authentication Flow
1. User registration/login via Supabase Auth
2. JWT tokens managed by Supabase client
3. Protected routes redirect unauthenticated users
4. Session persistence across browser sessions

### Security Measures
- **Row Level Security (RLS)**: Database-level access control
- **API Route Protection**: Server-side authentication checks
- **Signed URLs**: Secure PDF access with time-limited URLs
- **Environment Variables**: Sensitive keys isolated from codebase

## 7. Current State Assessment

### Strengths
- **Modern Tech Stack**: Latest stable versions of frameworks
- **Type Safety**: Comprehensive TypeScript implementation
- **Domain Focus**: Clear manufacturing troubleshooting focus
- **Documentation**: Extensive debugging history and docs
- **Code Organization**: Clean separation of concerns

### Technical Debt & Challenges
1. **PDF Viewer Stability**: Recurring issues with PDF.js integration
2. **State Management Inconsistency**: Mix of local state and Zustand
3. **Limited Test Coverage**: Infrastructure exists but needs expansion
4. **Performance Optimization**: No lazy loading or code splitting
5. **Offline Capabilities**: No PWA features for shop floor use
6. **Error Boundaries**: Limited implementation for resilience

### Opportunities for Enhancement
1. **Offline Mode**: Critical for shop floor environments
2. **Mobile App**: Native app for better device integration
3. **Analytics Dashboard**: Insights from troubleshooting data
4. **Predictive Maintenance**: ML models based on session data
5. **Integration APIs**: Connect with CMMS/ERP systems
6. **Multi-language Support**: For global manufacturing sites

## 8. Development & Deployment

### Development Workflow
- **Local Development**: `npm run dev` with hot reload
- **Code Quality**: ESLint + Prettier enforcement
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest for unit, Playwright for E2E

### Build & Deployment
- **Build Process**: Next.js production build
- **Environment Management**: `.env.local` for secrets
- **Version Control**: Git with detailed FIXES.md
- **CI/CD**: GitHub Actions (configured)

## 9. Maintenance & Operations

### Monitoring Needs
- **Application Monitoring**: Error tracking and performance
- **Database Monitoring**: Query performance and usage
- **AI Usage Tracking**: API calls and costs
- **User Analytics**: Feature adoption and usage patterns

### Backup & Recovery
- **Database Backups**: Supabase automated backups
- **Document Storage**: Supabase Storage redundancy
- **Session Data**: Critical for knowledge retention

## 10. Recommendations for BMAD Implementation

### Immediate Priorities
1. **Stabilize PDF Viewer**: Resolve recurring PDF.js issues
2. **Improve Test Coverage**: Expand unit and E2E tests
3. **Add Error Boundaries**: Improve application resilience
4. **Implement Offline Mode**: Critical for manufacturing environment

### Architecture Improvements
1. **Unified State Management**: Consolidate to single pattern
2. **Performance Optimization**: Implement code splitting
3. **Caching Strategy**: Reduce API calls and improve speed
4. **Monitoring Integration**: Add APM and error tracking

### Feature Enhancements
1. **Advanced Search**: Filter by date, department, issue type
2. **Reporting Dashboard**: Visualize troubleshooting metrics
3. **Mobile Optimization**: Better touch interface for tablets
4. **Integration Layer**: APIs for CMMS/ERP connectivity

### Long-term Vision
1. **Predictive Analytics**: Use historical data for predictions
2. **Knowledge Graph**: Build relationships between issues
3. **AR Integration**: Overlay instructions on equipment
4. **Multi-tenant**: Support for multiple facilities

## Appendices

### A. File Structure
```
frontend/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── lib/          # Utilities and clients
│   ├── types/        # TypeScript definitions
│   └── data/         # Constants
├── public/           # Static assets
└── tests/           # Test files
```

### B. Key Dependencies
- Next.js 14.2.18
- React 18.2.0
- TypeScript 5.3.3
- Tailwind CSS 3.4.1
- Supabase JS 2.39.0
- React PDF 10.0.1
- Zustand 4.4.7

### C. Environment Configuration
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

*Document prepared for BMAD Brownfield Workflow Implementation*
*Version: 1.0*
*Date: January 2025*