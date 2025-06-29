# GembaFix.ai - Manufacturing Troubleshooting App

An AI-powered manufacturing troubleshooting application that helps engineers solve equipment problems faster through intelligent manual search and conversation logging.

## Problem We're Solving

Engineers waste significant time hunting through complex machine manuals and waiting weeks for external engineering support when troubleshooting manufacturing equipment. GembaFix.ai provides instant AI-powered assistance using uploaded machine manuals.

## Project Structure
```
Gemba Fix Project/
├── frontend/          # Next.js React application
├── backend/           # Express.js API server  
├── shared/            # Shared types and utilities
├── docs/              # Project documentation
├── .taskmaster/       # Taskmaster AI configuration & PRD
└── tasks/             # Task management
```

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hook Form + Zod** - Form handling and validation
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication

## MVP Features (Core 7) - ✅ UI COMPLETE

1. **✅ Basic User Authentication** - Simple login for initial deployment
2. **✅ Document Management** - Upload and organize machine manuals for AI access
3. **✅ Machine Selection Interface** - Choose which machine you're working on
4. **✅ AI Conversational Interface** - Voice/text chat with confidence indicators
5. **✅ Automatic Session Logging** - Record all troubleshooting conversations
6. **✅ Session History & Search** - Find and review past troubleshooting sessions
7. **✅ System Performance Dashboard** - Monitor AI performance and document quality

### 🎨 Complete UI Implementation Included
- **HomeScreen** - Machine grid with search and add functionality
- **MachineDashboard** - Machine details with action buttons
- **ChatInterface** - Voice/text chat with confidence indicators (🟢🟡🔴)
- **SessionHistory** - Searchable troubleshooting session history
- **SessionDetail** - Full conversation transcripts with metadata
- **ManualViewer** - Document browser with upload capability
- **ManualDetail** - PDF viewer with zoom and navigation controls
- **AddMachineModal** - Form for adding new machines
- **LoadingSpinner** - Professional loading states
- **Header** - Navigation with breadcrumbs

## Quick Start

```bash
# Navigate to the project directory
cd "Desktop/Gemba Fix Project"

# Install all dependencies
npm run install:all

# Start development servers (both frontend and backend)
npm run dev

# Or start individually:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:5000
```

## Available Scripts

- `npm run dev` - Start both servers in development
- `npm run build` - Build both applications for production
- `npm run install:all` - Install all dependencies
- `npm run clean` - Remove all node_modules
- `npm run taskmaster` - Access Taskmaster AI commands

## Environment Setup

1. **Backend**: Update `backend/.env` with your database connection and API keys
2. **Frontend**: Update `frontend/.env.local` with your API endpoints
3. Start development: `npm run dev`

## Key Features

### Voice-First Design
- Large, accessible voice controls
- Optimized for industrial environments
- Toggleable audio responses

### Confidence Transparency
- Visual confidence indicators (🟢🟡🔴) on every AI response
- Clear distinction between manual-based facts vs AI suggestions
- Helps engineers know how much to trust each response

### Industrial-Focused UX
- Machine-first navigation
- Hands-free operation support
- Safety-conscious design principles

## Taskmaster AI Integration

This project includes Taskmaster AI for intelligent project management:
- Task breakdown and planning based on the PRD
- Code generation assistance
- Project organization and tracking

### Using Taskmaster AI
```bash
# Initialize Taskmaster AI (already done)
taskmaster-ai init

# Parse the PRD to generate initial tasks
taskmaster-ai parse-prd

# View all tasks
taskmaster-ai get-tasks

# Get next task to work on
taskmaster-ai next-task

# Add a new task
taskmaster-ai add-task "Your task description"
```

## Getting Started with Development

1. **Review the PRD**: Check `.taskmaster/docs/prd.txt` for full requirements
2. **Set up Taskmaster AI**: Use `taskmaster-ai parse-prd` to generate initial tasks
3. **Start development**: Use `taskmaster-ai next-task` to get started
4. **Build iteratively**: Focus on MVP features first

## Target Users

- **Primary**: Electrical engineers (high tech comfort)
- **Future**: Mechanical engineers, supervisors, operators
- **MVP**: 2 internal users initially
- **Scale**: 20-30 machines total

## Success Metrics

- Faster problem resolution time
- Reduced external engineer callouts
- Knowledge base growth
- User adoption rates
- AI confidence and accuracy scores

## License

MIT License

---

## Testing the Complete UI

1. **Backend Health Check**: Visit http://localhost:5000/health
2. **Frontend**: Visit http://localhost:3000 - **Complete GembaFix.ai UI is ready!**
3. **UI Demo**: Navigate through machines, chat interface, manuals, and session history
4. **Mock Data**: 6 sample machines with full interaction flows

**Ready to start development?** 
1. Run `npm run install:all`
2. Use `taskmaster-ai parse-prd` to generate tasks
3. Run `npm run dev` to start coding!
4. **UI is 100% complete** - focus on backend API integration next!