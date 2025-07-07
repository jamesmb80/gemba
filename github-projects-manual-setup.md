# GitHub Projects Manual Setup Instructions

Since the GitHub CLI token needs additional permissions for Projects v2, here are the exact manual steps:

## 1. Create Project Board

1. **Go to repository**: https://github.com/jamesmb80/GEMBA
2. **Click "Projects" tab** in the repository menu
3. **Click "New project"**
4. **Choose "Board" template** (Table view can be switched later)
5. **Name it**: "GembaFix AI Development Workflow"
6. **Description**: "Manufacturing troubleshooting app development with AI-powered workflow management"

## 2. Set Up 6-Stage Kanban Columns

Create these columns in order:
1. **Backlog** - New ideas and features waiting for research
2. **Research** - AI researching and creating detailed specifications  
3. **Ready** - Human-reviewed and approved for implementation
4. **In Progress** - Currently being implemented
5. **Review** - Code review and testing phase
6. **Done** - Completed and merged

## 3. Configure Board Fields

Add these custom fields:
- **Priority**: Single select (High, Medium, Low)
- **Type**: Single select (Feature, Bug, Research, Infrastructure)
- **Assignee**: Assignee field (use existing)
- **Estimate**: Number field (story points or hours)

## 4. Add Existing Issues to Board

Once the board is created, add these 7 existing issues to the "Backlog" column:
- Issue #1: Test Issue: Chat Feedback Feature
- Issue #2: Feature: Checklist System for Multi-Step Troubleshooting
- Issue #3: Feature: Smart Manual Search with Equipment Variations  
- Issue #4: Feature: Knowledge Sharing System for Repair Insights
- Issue #5: Feature: Mandatory Safety Checklist Integration
- Issue #6: Feature: Bookmarking System for Manual Content
- Issue #7: Feature: Add Advanced Search Filters to PDF Viewer

## 5. Test the Board

1. **View the board** in Kanban mode
2. **Try moving an issue** between columns
3. **Set priority and type** for a test issue
4. **Verify the workflow** feels intuitive

## Next Steps

Once this manual setup is complete, I can:
1. Update the CCI command to auto-assign new issues to the board
2. Test the automation with a sample feature
3. Add GitHub workflow rules to CLAUDE.md

**Note**: For future automation, the token might need these additional scopes:
- `project` (for GitHub Projects v2)
- `write:project` (for creating and modifying projects)

Let me know when you've completed this setup and I'll continue with the automation!