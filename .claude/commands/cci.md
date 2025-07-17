# Claude Code Intelligence (CCI) - Manufacturing Feature Research

Execute the Master Research Prompt v2.0 to analyze feature ideas for the GembaFix manufacturing app and create comprehensive GitHub issues.

## Usage
```
/project:cci <feature_idea>
```

## Example
```
/project:cci Add predictive maintenance alerts based on machine vibration patterns
```

## Workflow
1. Analyzes the GembaFix codebase comprehensively
2. Applies manufacturing domain expertise
3. Generates implementation details with:
   - Technical architecture
   - Database schema changes
   - UI/UX considerations
   - Testing requirements
4. Creates a GitHub issue with all details
5. Applies manufacturing review criteria

## Master Research Prompt v2.0

When this command is invoked, execute the following comprehensive analysis:

### 1. Deep Codebase Analysis
- Scan all source files for related functionality
- Identify integration points and dependencies
- Map data flow and state management patterns
- Review existing API endpoints and database schema
- Analyze UI components that might be affected

### 2. Manufacturing Domain Context
- Consider real-world manufacturing workflows
- Apply industry best practices (TPM, Six Sigma, Lean)
- Ensure compatibility with existing equipment types
- Consider operator safety and efficiency
- Validate against common manufacturing scenarios

### 3. Technical Implementation Plan
- Define new components and their interactions
- Specify database schema modifications
- Plan API endpoints with request/response formats
- Design state management approach
- Create detailed UI/UX mockups or descriptions
- List all required dependencies

### 4. Quality & Testing Strategy
- Unit test requirements and examples
- Integration test scenarios
- E2E test workflows
- Performance benchmarks
- Security considerations

### 5. Development Workflow
- Task breakdown with time estimates
- Parallel development opportunities
- Risk identification and mitigation
- Rollback strategy
- Documentation requirements

### 6. Manufacturing Review Criteria
Before creating the issue, validate against:
- ✓ Does it improve equipment uptime?
- ✓ Will operators find it intuitive?
- ✓ Does it support existing workflows?
- ✓ Can it scale across different equipment types?
- ✓ Does it provide actionable insights?

### 7. GitHub Issue Creation
Create a comprehensive issue with:
- Clear title with manufacturing context
- Problem statement from operator perspective
- Technical implementation details
- Acceptance criteria
- Testing requirements
- Manufacturing validation checklist

### 8. Quality Gate Validation (NEW - Phase 4)
Run automated quality checks:
- Technical feasibility and performance impact
- Security vulnerability assessment  
- Manufacturing environment compatibility
- Accessibility compliance (WCAG 2.1 AA)
- Testing coverage requirements

Generate quality report with pass/fail/warning status.

### 9. Implementation Artifacts (NEW - Phase 4)
If quality gates pass, automatically generate:
- Component templates with manufacturing optimizations
- Comprehensive test suites (unit, integration, E2E)
- API endpoint stubs with validation
- Database migration templates
- Documentation templates

### 10. GitHub Projects Board Assignment
After creating the issue with all artifacts:
- Automatically add the issue to the "GembaFix AI workflow" project board
- Set status to "Backlog" lane
- Set appropriate Priority (High/Medium/Low based on impact)
- Set Type (Feature/Bug/Research)
- Include quality gate score in issue
- Add implementation templates as issue attachments
- Set up progress tracking
- Log the issue number and board assignment

### 11. Progress Tracking Setup (NEW - Phase 4)
Initialize tracking for the new issue:
- Create progress monitoring entry
- Set up dependency mappings
- Configure auto-status updates
- Enable parallel development support

**Quality Gate Override**: If quality gates fail, issue is created in "Blocked" status with improvement recommendations.

This enhanced command now includes Phase 4 automation, ensuring every feature idea gets quality validation, implementation templates, and progress tracking in addition to comprehensive research and manufacturing expertise.