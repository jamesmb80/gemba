# GembaFix Manufacturing App

A modern manufacturing troubleshooting application built with Next.js, React, TypeScript, and Supabase.

## ✨ Features

- **Machine Management**: Add and manage manufacturing equipment
- **AI-Powered Chat**: Get intelligent troubleshooting assistance
- **Document Viewer**: View and manage PDF manuals with full-text search
- **Session History**: Track troubleshooting sessions and export data
- **Real-time Updates**: Live session updates with Supabase integration
- **User Authentication**: Secure login and registration system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **PDF Rendering**: react-pdf with PDF.js
- **Icons**: Lucide React
- **State Management**: Zustand
- **Testing**: Jest, Playwright

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase project with environment variables configured

### Installation

```bash
# Install dependencies
cd frontend && npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and keys

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions and API clients
│   ├── types/        # TypeScript type definitions
│   └── data/         # Mock data and constants
├── public/           # Static assets
└── package.json      # Dependencies and scripts
```

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run Jest tests
npm run test:e2e     # Run Playwright tests
```

## 📝 Recent Updates

**Project Cleanup (July 2024)**
- Removed 63+ duplicate files and development artifacts
- Fixed PDF viewer implementation with react-pdf v10
- Improved code formatting and type safety
- Enhanced error handling and user experience

## 🔧 Configuration

The app requires the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📚 Documentation

- See `FIXES.md` for detailed development history and debugging notes
- Components are documented with TypeScript interfaces
- API functions include JSDoc comments

## 🤝 Contributing

This project follows standard React/Next.js conventions:
- Use TypeScript for all new code
- Follow existing component patterns
- Run `npm run format` before committing
- Test changes with `npm run build`
