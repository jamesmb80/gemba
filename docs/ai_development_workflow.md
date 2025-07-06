# Kora Team's Exact Workflow - Detailed Features & Steps

## 1. GitHub Project Board Setup
- **What**: Kanban-style board with lanes for different stages of development
- **How**: Uses GitHub Issues + GitHub Projects integration
- **Structure**: Issues move through lanes (e.g., "Backlog", "In Progress", "Review", "Done")
- **Integration**: Claude Code can automatically create issues and place them in appropriate lanes
- **Their Usage**: 
  - All feature ideas become GitHub issues with detailed specs
  - Visual tracking of multiple parallel development streams
  - Easy handoff between AI agents and human developers
  - Standard developer workflow that works with existing tools

## 2. The Master Research Prompt
- **What**: A comprehensive prompt that transforms simple ideas into detailed GitHub issues
- **Original Inspiration**: Natasha's dramatic "We just got AGI delivered" prompt
- **How Built**: 
  1. Started with basic prompt: "We just got AGI, it got delivered and we can write software"
  2. Fed it into Anthropic's Console Prompt Improver
  3. Refined to include systematic research steps
  4. Added specific formatting for GitHub issues
- **What it does automatically**:
  - **Research existing codebase**: Looks through current code to understand patterns and architecture
  - **Research best practices online**: Searches web for implementation patterns and solutions
  - **Present implementation plan**: Creates detailed technical approach
  - **Create GitHub issue**: Formats everything into a structured issue with:
    - Problem statement
    - Solution vision
    - Technical requirements
    - Implementation steps with time estimates
    - Testing strategy
- **Key Quote**: "It's like having a research team that works in minutes instead of days"

## 3. Custom Command in Claude Code
- **Command**: `CC` (Claude Code shortcut)
- **Setup**: Custom command that triggers the master research prompt automatically
- **Usage Flow**: 
  1. Type `CC` in Claude Code terminal
  2. Speak/type the feature idea (Kieran uses voice: "I want infinite scroll in Kora...")
  3. AI automatically follows the entire research workflow
  4. Creates and places GitHub issue in appropriate project board lane
- **Their Example**: Kieran said "I want infinite scroll in Kora where if I am at the end of a brief it should load the next brief until every unread brief is read"
- **Result**: Fully researched GitHub issue created automatically with implementation plan
- **Why It Works**: "Very low friction - we were just jamming, 'Oh what if we do this, oh that sounds cool' and voice to text starts"

## 4. Voice-to-Text Integration
- **What**: Kieran uses voice input instead of typing for everything
- **Tool**: "Monologue" (Every's internal voice-to-text tool - "coming soon")
- **How**: Speaks directly into Claude Code terminal
- **Benefit**: More natural, faster idea capture during brainstorming
- **Kieran's Approach**: "Kieran almost never types anything and does all voice text"
- **Alternative**: You can type instead of voice, but voice enables faster ideation
- **Impact**: Enables conversational development - speaking features into existence

## 5. Parallel Agent Workflow
- **What**: Running multiple Claude Code instances simultaneously on different features
- **Their Record**: 6-7 Claude Code instances running at the same time
- **How**: 
  1. Brainstorming session generates multiple feature ideas
  2. Fire up separate Claude Code instance for each idea
  3. Each runs the research workflow independently
  4. Let agents run for 20+ minutes autonomously (Kieran's record: 25 minutes)
  5. Human reviews results when ready
- **Key Insight**: "We had six or seven running at the same time because we were just like 'New idea, let's go. New idea, let's go.'"
- **Competitive Advantage**: While others work on one feature at a time, they develop multiple features in parallel

## 6. The Jamming Session Process
- **What**: Dedicated 2-hour brainstorming block to create multiple issues
- **Preparation**: "One day before the Claude live stream was scheduled, we were like 'okay, tomorrow coding is going to change'"
- **Steps**:
  1. Block out 2-hour focused time
  2. Gather input sources: user feedback, emails, feature ideas, pain points
  3. For each idea: trigger custom command (`CC`)
  4. Let all agents run in parallel while continuing to brainstorm
  5. Review generated issues later in batch
  6. Approve/modify as needed
- **ChatGPT Prep**: Used ChatGPT to generate initial list of 20+ issues they wanted "future superior model to solve"
- **Output**: 20+ detailed GitHub issues ready for implementation
- **Philosophy**: "Instead of doing our regular scheduled programming, we should jam and make a massive list of issues"

## 7. Human Review Gate - "Lowest Value Stage"
- **Philosophy**: "Fix any problem at the lowest value stage" (from Intel CEO's "High Output Management")
- **When**: After AI creates the detailed plan but before implementation begins
- **What to check**:
  - Does the direction make sense?
  - Are we missing anything important?
  - Are the requirements clear and complete?
  - Is this the right approach?
- **Why Critical**: "There are chances that the plan that Claude was able to create wasn't the direction you wanted to go, and you want to catch that before you ask Claude to implement"
- **Time Investment**: "It's kind of boring to read most of the time, but it will save so much time"
- **Making It Better**: Ask for user stories, questions a good PM would ask, examples instead of just timeline

## 8. Implementation Handoff
- **What**: Taking approved GitHub issues and implementing them with Claude Code
- **How**: 
  1. Use Claude Code to work on specific GitHub issue
  2. Reference the detailed requirements document created earlier
  3. Let Claude Code run autonomously for implementation (15-25 minutes)
  4. AI follows the implementation plan step-by-step
  5. Human review of actual code/PR
- **Example**: Bug fix where no one was filling out feedback form
  - Claude Code investigated 14 days of logs
  - Found missing code that adds people to email list
  - Created pull request automatically
  - Also created migration script for missed users
- **Key Insight**: "It didn't cost me any energy - it was as easy as writing it down in GitHub to look at later"

## 9. Prompt Engineering Hierarchy
- **Meta-level**: Prompt that creates other prompts (the master research prompt)
- **Research level**: Prompts that gather information and create detailed plans
- **Implementation level**: Prompts that execute actual coding work
- **The Compound Effect**: "This is part of the compounding effect - having an idea that has a lot of outcomes"
- **Example**: One well-crafted research prompt now automatically creates detailed implementation plans for every feature
- **Time Investment**: Spent time building the meta-prompt once, now it works for every feature

## 10. The Anthropic Console Prompt Improver Workflow
- **What**: Tool to refine prompts automatically using Claude
- **Location**: Anthropic Console (console.anthropic.com)
- **How**: 
  1. Write basic prompt describing what you want
  2. Paste into Anthropic Console prompt improver
  3. Enable "thinking" mode
  4. Click "generate" to get improved version
  5. Use improved version as your custom command
- **Their Example**: 
  - Started with: "We just got AGI delivered and we can write software"
  - Became: Comprehensive research workflow with systematic steps
- **Kieran's Quote**: "How good can it be? It's pretty good because it's also very low friction"
- **Usage**: "We were just jamming and were like 'well we're going to come up with 30 research tasks so we better have a prompt'"

## 11. GitHub Integration Pattern
- **What**: Using standard GitHub workflows that work seamlessly with humans and AI
- **Components**:
  - **Issues**: For tracking individual features/bugs with detailed specs
  - **Project boards**: Kanban-style tracking of progress
  - **Pull requests**: For code review and deployment
  - **Standard workflows**: Familiar to any developer
- **Benefit**: "We can give this to a developer and they can implement it"
- **Philosophy**: "It's very powerful because it's an ecosystem we refined over 20 years... let's lean into that"
- **Human Integration**: Can hire human developers who plug into the same workflow
- **Example**: Brought in infrastructure expert, recorded 2-hour conversation, fed to Claude Code, generated implementation issues, expert reviewed, then implemented

## 12. Quality Gates & Testing
- **Testing**: "Traditional tests and evals are very important"
- **Approach**: 
  - Write tests for AI-generated code
  - Use "evals" (evaluations) for prompts - "evals are tests for prompts"
  - Run prompts multiple times to check consistency
  - Screenshot testing with Puppeteer for UI comparison
- **Example**: 
  - Kieran had Claude Code run an eval
  - "It fails four out of 10 times"
  - "I said run it 10 times, does it always pass? No, four times it doesn't"
  - "I said look at the output, why didn't it call that tool?"
  - "It said 'Oh yeah, it wasn't specific enough'"
  - "I said keep going and change the prompt until it's passing consistently"
  - "It did it - I just walked downstairs, got a coffee, walked up and that was it"
- **Figma Integration**: Use Figma MCP to implement designs, then compare with Puppeteer screenshots
- **Self-Correction**: AI can debug and fix its own prompts based on test results

## Exact Implementation Steps

### Step 1: Build Your Master Research Prompt
1. Start with a basic prompt about creating detailed feature specs
2. Go to console.anthropic.com
3. Use the prompt improver to refine it
4. Include these systematic steps:
   - Research existing codebase patterns
   - Research online best practices
   - Create implementation plan
   - Format as GitHub issue with all sections

### Step 2: Create Custom Command in Claude Code
1. Open Claude Code terminal
2. Create custom command (e.g., `CC` or `feature`)
3. Link it to your master research prompt
4. Test with a simple feature idea
5. Refine based on results

### Step 3: Set Up GitHub Integration
1. Create GitHub repository with Issues enabled
2. Enable GitHub Projects for Kanban boards
3. Create appropriate lanes (Backlog, In Progress, Review, Done)
4. Connect Claude Code to your GitHub repo
5. Test issue creation and board placement

### Step 4: Practice Parallel Development
1. Block out 2-hour "jamming session"
2. Collect 5-10 feature ideas from users, feedback, pain points
3. Open multiple Claude Code terminals
4. Trigger custom command for each idea
5. Let them run in parallel (15-25 minutes each)
6. Batch review all generated issues

### Step 5: Implement Review Process
1. Read each AI-generated issue plan thoroughly
2. Check direction, completeness, and approach
3. Ask clarifying questions or request changes
4. Only approve for implementation after review
5. Use implementation phase for actual coding

### Step 6: Add Quality Gates
1. Set up testing framework for your stack
2. Create eval prompts to test your main workflows
3. Run consistency checks on important prompts
4. Set up screenshot/visual testing if applicable
5. Build self-correction loops for common issues

This workflow transforms development from linear coding to parallel AI orchestration, where humans focus on vision and direction while AI handles research, planning, and implementation.