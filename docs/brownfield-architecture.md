# GembaFix.ai Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the GembaFix.ai codebase, including its structure, patterns, technical debt, and workarounds. It is intended to serve as a reference for AI agents working on bug fixes, refactoring, and implementing the new features outlined in the project's PRD.

### Document Scope

This documentation is focused on the existing codebase, with a specific emphasis on the areas relevant to implementing the features described in the GembaFix.ai PRD. A primary focus is analyzing the gap between the current simple PDF viewer and the required AI-native document processing and vector indexing system.

### Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| July 16, 2024 | 1.0 | Initial brownfield analysis based on PRD and user feedback. | Mary, Business Analyst |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

* **Main Entry**: `src/app/layout.tsx` (Root layout)
* **Configuration**: `.env.local`, `src/lib/supabase/client.ts`
* **Core Business Logic**: `src/app/api/`, `src/lib/hooks/`
* **API Definitions**: `src/app/api/**/route.ts` (Next.js App Router convention)
* **Database Models / Types**: `src/lib/types/`, `supabase/types.ts`
* **Key Complex Component**: `src/app/dashboard/machine/[id]/manual/page.tsx` (The current PDF viewer)

### Enhancement Impact Areas

The primary enhancement—moving from PDF viewing to AI-native document processing—will impact the following areas most significantly:
* **Document Handling**: The entire manual viewing and handling process will need to be replaced.
* **Backend API**: New endpoints will be required for document chunking, embedding, and vector search.
* **AI Chat**: The chat interface will need to query the new vector database instead of relying on high-level document context.
* **Database**: A vector database solution (like Supabase's `pgvector` extension) will need to be implemented and managed.

## High Level Architecture

### Technical Summary

The project is a SaaS web application built on a modern serverless stack. It uses Next.js for the frontend and API routes, with Supabase providing the backend services including database, authentication, and file storage. The architecture is designed to be real-time and responsive.

### Actual Tech Stack

| Category | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| Runtime | Node.js | 20.x | Assumed based on Next.js 14+ compatibility. |
| Framework | Next.js | 14+ | App Router is used. |
| UI Library | React | 18+ | Functional components with hooks. |
| Language | TypeScript | 5.x | `strict: true` is required. |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework. |
| Database | Supabase (PostgreSQL) | 15+ | `pgvector` extension will be required. |
| Authentication | Supabase Auth | - | RLS is a core security requirement. |
| File Storage | Supabase Storage | - | Used for PDF manuals currently. |

### Repository Structure Reality Check

* **Type**: Monorepo (Frontend and Backend in one Next.js project)
* **Package Manager**: `npm` or `yarn` (Assumed from standard Next.js setup)
* **Notable**: The structure strictly follows the Next.js App Router paradigm, which heavily dictates file organization and routing.

## Source Tree and Module Organization

### Project Structure (Actual)

```text
src/
├── app/
│   ├── (auth)/        # Authentication routes (login/register)
│   ├── dashboard/     # Protected main application area
│   │   ├── machine/[id]/
│   │   │   ├── chat/page.tsx  # NOTE: Currently a placeholder, needs integration with vector search
│   │   │   ├── manual/page.tsx  # COMPLEX: Current simple PDF viewer lives here. To be replaced.
│   │   │   └── ...
│   ├── api/
│   │   ├── ai/            # NOTE: To be refactored for new embedding/query logic
│   │   └── ...
│   └── layout.tsx       # Root layout with Supabase auth provider
├── components/
│   ├── ui/              # Reusable low-level UI components (buttons, inputs)
│   └── machine/         # Components related to machine features
├── lib/
│   ├── supabase/        # Supabase client and utility functions
│   ├── types/           # Core TypeScript type definitions
│   └── hooks/           # Custom React hooks for data fetching
└── supabase/
    └── migrations/      # Database migrations (critical for schema changes)