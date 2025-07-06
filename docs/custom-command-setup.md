# Custom Claude Code Command Setup
## Phase 2.2: Creating the "CC" Research Command

Following the Kora team's approach, we need to create a custom command in Claude Code that triggers our master research prompt automatically.

## How Custom Commands Work in Claude Code

Custom commands in Claude Code allow you to:
- Create shortcuts for frequently used prompts
- Trigger complex workflows with simple commands
- Maintain consistency across team members
- Enable voice-to-text integration

## Setting Up the "CC" Command

### Step 1: Access Claude Code Settings
1. Open Claude Code in your terminal: `claude`
2. Look for settings or custom commands option
3. Navigate to "Custom Commands" or "Shortcuts"

### Step 2: Create the "CC" Command
**Command Name**: `CC` (or `feature-research`)
**Description**: "Research and create detailed GitHub issue for feature idea"
**Prompt Template**: Use the Master Research Prompt v2.0

### Step 3: Configure the Command
```
Command: CC
Trigger: When user types "CC" followed by feature description
Action: Execute master research prompt with user input as [FEATURE_IDEA_PLACEHOLDER]
Output: Comprehensive GitHub issue formatted for copy-paste
```

## Command Configuration

### Basic Setup
```yaml
name: "CC"
description: "Create detailed feature research and GitHub issue"
prompt_file: "master-research-prompt-v2.md"
placeholder: "[FEATURE_IDEA_PLACEHOLDER]"
voice_enabled: true
```

### Voice Integration
- **Enable voice input**: Allow speaking feature ideas instead of typing
- **Voice trigger**: "CC" followed by spoken feature description
- **Output format**: Text that can be copy-pasted into GitHub

### Usage Pattern
```bash
# Typed usage
CC: Add search filters to PDF viewer for better navigation

# Voice usage (if available)
CC: I want to add machine status indicators to the dashboard
```

## Testing the Command Setup

Since we can't directly create custom commands in this session, let's simulate the workflow:

### Test 1: Simple Feature Idea
**Input**: `CC: Add a quick feedback button to the chat interface`

**Expected Process**:
1. Command triggers master research prompt
2. AI researches existing ChatInterface.tsx component
3. AI researches feedback UI patterns
4. AI creates comprehensive GitHub issue
5. Output is ready for copy-paste to GitHub

### Test 2: Complex Feature Idea  
**Input**: `CC: Implement offline mode for technicians in areas with poor connectivity`

**Expected Process**:
1. Comprehensive codebase analysis for offline patterns
2. Research PWA and offline-first strategies
3. Consider manufacturing environment constraints
4. Create detailed implementation plan with phases

### Test 3: Voice Integration (Simulated)
**Voice Input**: "CC: I want technicians to be able to bookmark frequently used manual sections"

**Expected Process**:
1. Voice-to-text converts to feature description
2. Triggers research workflow automatically
3. Produces detailed GitHub issue for bookmarking feature
4. Ready for human review and approval

## Manual Workflow (Until Custom Command is Set Up)

For now, we can manually execute the workflow:

### Step 1: Prepare the Prompt
- Copy the Master Research Prompt v2.0
- Replace `[FEATURE_IDEA_PLACEHOLDER]` with actual feature idea
- Paste into Claude Code

### Step 2: Execute Research
- Run the prompt and let Claude Code research for 10-15 minutes
- AI will analyze codebase, research best practices, create implementation plan
- Output will be a comprehensive GitHub issue

### Step 3: Review and Refine
- Apply human review using our quality framework
- Check direction, completeness, and technical approach
- Approve, request changes, or reject

### Step 4: Create GitHub Issue
- Copy the generated issue content
- Create new GitHub issue manually
- Assign to appropriate project board lane

## Expected Results

With the custom command properly set up, we should achieve:

### Speed Improvements
- **Idea to detailed plan**: <10 minutes (vs hours manually)
- **Research comprehensiveness**: Covers codebase + best practices + domain
- **Output quality**: Production-ready GitHub issues

### Workflow Benefits
- **Low friction**: Simple command triggers complex research
- **Consistency**: Same research methodology every time
- **Voice enabled**: Speak ideas naturally during brainstorming
- **Parallel execution**: Multiple ideas can be researched simultaneously

### Quality Outcomes
- **Comprehensive issues**: 2000+ words with all necessary sections
- **Actionable tasks**: Clear implementation steps with time estimates
- **Manufacturing focus**: Domain-specific considerations included
- **Review ready**: Structured for human quality gate review

## Troubleshooting Custom Commands

### Common Issues
1. **Command not triggering**: Check syntax and naming
2. **Incomplete output**: Verify prompt template is complete
3. **Voice not working**: Check voice input settings
4. **Poor quality**: Refine prompt based on outputs

### Debugging Steps
1. Test with simple feature ideas first
2. Compare output quality to expected structure
3. Iterate prompt template based on results
4. Document successful patterns for reuse

## Next Steps

1. **Set up custom command** in Claude Code (requires access to settings)
2. **Test with real features** from GembaFix backlog
3. **Refine prompt** based on output quality
4. **Document usage patterns** for team onboarding
5. **Enable voice integration** if available

Once the custom command is working, we'll have achieved the core of the Kora team's workflow: transforming simple ideas into comprehensive, actionable GitHub issues with a single command.

---

*This command setup enables the "compounding engineering" approach where each feature becomes easier to develop than the last.*