# GitHub Projects Setup Guide
## Phase 1.1: Foundation for AI Development Workflow

### Manual Setup Instructions (GitHub CLI not available)

Since we don't have GitHub CLI installed, here's how to set up the GitHub Projects board manually:

## 1. Create GitHub Project Board

1. **Go to your repository**: https://github.com/jamesmb80/GEMBA
2. **Navigate to Projects tab**: Click on "Projects" in the repository menu
3. **Create new project**: Click "New project"
4. **Choose "Table" view** for now (we'll switch to Board view)
5. **Name it**: "GembaFix AI Development Workflow"

## 2. Set Up Kanban Board Structure

**Create these columns/statuses:**
- **Backlog**: New ideas waiting for research
- **Research**: AI is researching and creating detailed specs  
- **Ready**: Human-reviewed and approved for implementation
- **In Progress**: Currently being implemented
- **Review**: Code review and testing
- **Done**: Completed and merged

**Field Configuration:**
- **Status**: Use the columns above
- **Priority**: High, Medium, Low
- **Estimate**: Story points or time estimates
- **Type**: Feature, Bug, Research, Infrastructure
- **Assignee**: Who's working on it (human or "AI Agent")

## 3. Enable GitHub Issues Templates

1. **Go to Settings** in your repository
2. **Scroll to Features section**
3. **Ensure "Issues" is checked**
4. **Set up issue templates**:

### Feature Template
```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this solve?

## Solution Vision
High-level approach

## Technical Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Implementation Steps
1. Step 1 (estimate: X hours)
2. Step 2 (estimate: X hours)

## Testing Strategy
How will we test this?

## Research Notes
AI research findings and best practices

## Success Criteria
How do we know it's done?
```

### Bug Template
```markdown
## Bug Description
What's broken?

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Research Analysis
AI analysis of the issue

## Proposed Solution
How to fix it

## Testing Plan
How to verify the fix
```

### Research Template
```markdown
## Research Topic
What needs to be researched?

## Context
Why is this research needed?

## Research Questions
- [ ] Question 1
- [ ] Question 2

## Findings
AI research results

## Recommendations
What should we do based on research?

## Next Steps
Action items from research
```

## 4. Test Issue Creation

Create a test issue to verify the setup:
1. **Click "New Issue"**
2. **Choose Feature template**
3. **Title**: "Test Feature: Simple UI Enhancement"
4. **Fill out template**
5. **Add to project**: Select your new project
6. **Set status**: "Backlog"
7. **Set priority**: "Low"

## 5. Connect to Project Board

1. **Open your project**
2. **Switch to "Board" view**
3. **Verify columns match your workflow**
4. **Test moving the test issue between columns**

## Next Steps After Manual Setup

Once this is set up manually, we can:
1. Use Claude Code to create issues programmatically
2. Test the workflow with real features
3. Practice the research → review → implementation flow

Let me know when you've completed this manual setup, and we'll move to Phase 1.2!