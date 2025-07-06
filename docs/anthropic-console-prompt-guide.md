# Anthropic Console Prompt Improver Guide
## Phase 1.2: Master the Meta-Prompt Creation Tool

Based on the Kora team's workflow, the Anthropic Console Prompt Improver is the key tool for creating the "master research prompt" that transforms simple ideas into detailed GitHub issues.

## How to Use Anthropic Console Prompt Improver

### 1. Access the Tool
- Go to **console.anthropic.com**
- Navigate to the "Prompt Improver" section
- Log in with your Anthropic account

### 2. Basic Workflow
1. **Write a basic prompt** describing what you want to achieve
2. **Paste it into the prompt improver**
3. **Enable "thinking" mode** for better reasoning
4. **Click "generate"** to get the improved version
5. **Test and iterate** until you get great results

### 3. Kora Team's Example Evolution

**Original Basic Prompt:**
```
"We just got AGI delivered and we can write software"
```

**Evolved into Comprehensive Research Workflow:**
```
Research and create a detailed GitHub issue for the given feature idea:

1. RESEARCH EXISTING CODEBASE
   - Analyze current architecture and patterns
   - Identify related existing features
   - Note any constraints or dependencies

2. RESEARCH BEST PRACTICES
   - Search for industry standards and solutions
   - Find open-source examples and patterns
   - Identify proven implementation approaches

3. CREATE IMPLEMENTATION PLAN
   - Break down into specific technical steps
   - Estimate time and complexity
   - Identify potential risks and mitigation

4. FORMAT AS GITHUB ISSUE
   - Problem statement (why this matters)
   - Solution vision (high-level approach)
   - Technical requirements (specific needs)
   - Implementation steps (actionable tasks)
   - Testing strategy (how to verify)
   - Success criteria (definition of done)

Please create a comprehensive, actionable issue that a developer could implement.
```

## Practice Prompts for GembaFix

Let's practice improving prompts for our manufacturing troubleshooting app:

### Practice Prompt 1: Basic Feature Research
**Before Improvement:**
```
"Create a feature spec for improving the chat interface"
```

**After Console Improvement (Example):**
```
You are a senior product manager and technical architect for GembaFix, a manufacturing troubleshooting application. Create a comprehensive feature specification for improving the chat interface.

RESEARCH PHASE:
1. Analyze the current ChatInterface.tsx component structure
2. Review existing chat functionality including:
   - AI conversation flow
   - Voice input/output capabilities  
   - Confidence indicators
   - Session management
3. Research modern chat UI patterns and accessibility standards
4. Identify technical constraints in our React/TypeScript/Supabase stack

SPECIFICATION PHASE:
Create a detailed GitHub issue with:
- Problem Statement: Current chat limitations and user pain points
- Solution Vision: Modern, intuitive chat experience
- Technical Requirements: Specific implementation needs
- Implementation Steps: Prioritized development tasks
- Testing Strategy: How to validate improvements
- Success Metrics: Measurable improvement criteria

Focus on manufacturing technician workflows and hands-free operation needs.
```

### Practice Prompt 2: Bug Investigation
**Before Improvement:**
```
"Help debug the PDF viewer issue"
```

**After Console Improvement (Example):**
```
You are a senior engineer debugging issues in GembaFix's PDF viewer system. Conduct a systematic investigation and create an actionable bug report.

INVESTIGATION PHASE:
1. Analyze the PDFViewer.tsx and ManualViewer.tsx components
2. Check the PDF API route at /api/pdf/[...path]/route.ts
3. Review Supabase storage configuration and permissions
4. Test PDF loading flow from database to display
5. Check browser console errors and network requests

DOCUMENTATION PHASE:
Create a comprehensive GitHub issue with:
- Bug Description: Clear problem statement
- Steps to Reproduce: Exact replication steps
- Expected vs Actual Behavior: What should vs does happen
- Technical Analysis: Root cause investigation
- Proposed Solution: Specific fix approach
- Testing Plan: How to verify the fix
- Risk Assessment: Impact and complexity analysis

Include code snippets, error logs, and specific file references.
```

### Practice Prompt 3: Code Quality Improvement
**Before Improvement:**
```
"Review and improve the code quality"
```

**After Console Improvement (Example):**
```
You are a tech lead conducting a code quality audit for GembaFix. Create a systematic improvement plan.

AUDIT PHASE:
1. Review TypeScript configuration and type safety
2. Analyze component architecture and reusability
3. Check error handling patterns across the app
4. Evaluate testing coverage and quality
5. Review security practices and data validation
6. Assess performance and bundle optimization

IMPROVEMENT PLAN:
Create prioritized GitHub issues for:
- Critical Issues: Security, performance, or reliability problems
- Architecture Improvements: Better patterns and structure  
- Developer Experience: Tooling and workflow enhancements
- Technical Debt: Cleanup and modernization tasks

For each issue include:
- Impact Assessment: User and developer benefits
- Implementation Strategy: Technical approach
- Effort Estimation: Time and complexity
- Dependencies: What needs to happen first
- Success Criteria: How to measure improvement
```

## Best Practices Learned from Kora Team

### 1. Start Simple, Iterate
- Begin with a basic prompt describing your goal
- Don't try to perfect it on the first try
- Use the improved version and refine based on results

### 2. Include Context
- Specify your role (PM, engineer, etc.)
- Mention your tech stack and constraints
- Reference your specific application domain

### 3. Structure the Process
- Break complex tasks into phases
- Use clear section headers
- Specify the output format you want

### 4. Make It Actionable
- Focus on creating implementable plans
- Include specific file references
- Provide measurable success criteria

### 5. Test and Refine
- Try the improved prompt with real examples
- Adjust based on the quality of outputs
- Create variations for different types of work

## Next Steps

1. **Practice Session**: Try improving 3-5 prompts using the console
2. **Create Your Master Research Prompt**: Build the core prompt for feature research
3. **Test with Real Examples**: Use improved prompts on actual GembaFix features
4. **Document Patterns**: Save successful prompt patterns for reuse
5. **Iterate and Improve**: Refine based on results and feedback

The goal is to create a "meta-prompt" that consistently produces high-quality, actionable GitHub issues from simple feature ideas - the foundation of the Kora team's compounding engineering approach.