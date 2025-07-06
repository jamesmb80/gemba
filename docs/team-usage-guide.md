# GembaFix AI Development Workflow - Team Usage Guide
## Complete Guide to Kora-Style Compounding Engineering

This guide enables the entire team to use our AI-first development workflow for dramatically faster feature development.

---

## 🎯 Workflow Overview

Transform simple feature ideas into comprehensive, implementable GitHub issues in **under 20 minutes** (vs 4-7 hours traditionally).

### Core Philosophy: "Compounding Engineering"
Each feature you develop makes the next feature easier to develop through:
- **Accumulated prompts** that understand your codebase better
- **Refined patterns** that improve with each iteration  
- **Domain expertise** embedded in AI research process
- **Quality frameworks** that catch problems early

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Manual Workflow (Available Now)
1. **Copy master research prompt** from `docs/master-research-prompt-v2.md`
2. **Replace placeholder** `[FEATURE_IDEA_PLACEHOLDER]` with your feature idea
3. **Paste into Claude Code** and run (takes ~10 minutes)
4. **Review output** using quality framework checklist
5. **Create GitHub issue** with generated content

### Option 2: Custom Command (Requires Setup)
1. **Set up CC command** following `docs/custom-command-setup.md`
2. **Type in Claude Code**: `CC: Your feature idea here`
3. **Wait 10 minutes** for comprehensive research
4. **Review and approve** using quality checklist
5. **Auto-create GitHub issue** (if GitHub CLI configured)

---

## 📋 Complete Workflow Steps

### Step 1: Prepare Your Feature Ideas
**Before starting**, collect feature ideas from:
- User feedback and support requests
- Technician workflow observations  
- Performance improvement opportunities
- Bug reports that suggest new features
- Manufacturing industry best practices

**Format**: Simple, natural language descriptions
- ✅ Good: "Add voice commands to the PDF viewer for hands-free navigation"
- ✅ Good: "Create status indicators for machine health monitoring"
- ❌ Avoid: Overly technical specifications (let AI do the research)

### Step 2: Execute AI Research
**Using Master Research Prompt**:
1. Copy prompt from `docs/master-research-prompt-v2.md`
2. Replace `[FEATURE_IDEA_PLACEHOLDER]` with your idea
3. Paste into Claude Code terminal
4. **Wait 10-15 minutes** while AI conducts comprehensive research
5. AI will output 2000+ word GitHub issue

**Research Process (Automatic)**:
- ✅ Analyzes existing GembaFix codebase patterns
- ✅ Researches manufacturing domain best practices
- ✅ Creates detailed technical implementation plan
- ✅ Formats as production-ready GitHub issue

### Step 3: Human Review (Quality Gate)
**Time Required**: 5-10 minutes
**Use Quality Framework** (`docs/quality-framework.md`):

#### Quick Review Checklist:
- [ ] **Right Problem**: Does this solve a real technician need?
- [ ] **Sound Approach**: Is the technical solution appropriate?
- [ ] **Complete Plan**: Can a developer implement this immediately?
- [ ] **Realistic Scope**: Are time estimates reasonable?
- [ ] **Manufacturing Focus**: Considers industrial environment?

#### Review Outcomes:
- **✅ Approve**: Move to implementation (80%+ of AI outputs)
- **🔄 Refine**: Ask AI to improve specific sections
- **❌ Reject**: Wrong direction or poor quality (rare)

### Step 4: GitHub Issue Creation
**Manual Process** (until GitHub CLI setup):
1. Copy AI-generated issue content
2. Go to https://github.com/jamesmb80/GEMBA/issues
3. Click "New Issue" → Choose "Feature" template
4. Paste comprehensive content (replace template)
5. Add labels: ~feature ~manufacturing ~voice ~accessibility
6. Assign to project board lane: "Ready"

**Automated Process** (with GitHub CLI):
```bash
# AI can create issues directly
gh issue create --title "[Feature Title]" \
  --body-file generated-issue.md \
  --label feature,manufacturing \
  --project "GembaFix AI Development Workflow"
```

### Step 5: Implementation
**Developer receives**:
- ✅ Complete technical specification
- ✅ 3-phase implementation plan with time estimates
- ✅ Testing strategy and success criteria
- ✅ Risk assessment and mitigation approaches
- ✅ Manufacturing domain context and requirements

**Implementation flows**:
1. **Phase 1**: Foundation (database, core components)
2. **Phase 2**: Integration (connect to existing systems)
3. **Phase 3**: Polish (testing, accessibility, performance)

---

## ⚡ Advanced Workflows

### Parallel Development (Kora Team Style)
**"Jamming Session" Process**:
1. **Block 2-hour focused time** for feature brainstorming
2. **Collect 5-10 feature ideas** from backlog, user feedback, observations
3. **Launch multiple Claude Code instances** (one per feature)
4. **Start all research processes** simultaneously 
5. **Batch review** all generated issues when complete
6. **Approve/refine** based on priorities and capacity

**Benefits**:
- Develop 5-10 features in parallel vs one at a time
- AI research runs autonomously while you brainstorm more
- Batch review is more efficient than individual reviews
- Creates comprehensive feature backlog quickly

### Voice Integration Workflow
**If voice-to-text available**:
1. **Speak feature ideas** directly into Claude Code
2. **Natural conversation**: "I want technicians to be able to bookmark manual sections"
3. **Automatic transcription** triggers research workflow
4. **Voice review**: Listen to AI-generated summaries
5. **Voice approval**: "Approve this feature for implementation"

### Expert Collaboration Pattern
**Bringing in domain experts efficiently**:
1. **Record 2-hour conversation** with manufacturing expert
2. **Feed recording transcript** to Claude Code
3. **AI extracts** multiple feature ideas and requirements
4. **Generate issues** for each identified opportunity
5. **Expert reviews** AI-generated plans (faster than writing from scratch)
6. **Implement** with expert validation built-in

---

## 📊 Success Metrics & Tracking

### Individual Productivity
Track these personal metrics:
- **Ideas to Issues**: How many features researched per week
- **Review Time**: Average time spent on human review
- **Approval Rate**: % of AI-generated plans approved on first review
- **Implementation Success**: Features that ship without major rework

### Team Productivity
Track these team metrics:
- **Feature Velocity**: Features from idea to production
- **Research Quality**: Comprehensive requirements reduce rework
- **Developer Satisfaction**: Clarity and completeness of specifications
- **User Impact**: Features that improve technician workflows

### Quality Indicators
Monitor these quality signals:
- **Review Time**: Should average 5-10 minutes per feature
- **Rework Rate**: <20% of features require significant changes
- **Manufacturing Fit**: Features align with industrial environment needs
- **Technical Debt**: AI suggestions don't create maintenance burden

---

## 🛠️ Tools & Setup

### Required Tools
- **Claude Code**: Primary AI research and development tool
- **GitHub Account**: Issue tracking and project management
- **Quality Framework**: Human review standards and checklists

### Optional Enhancements
- **GitHub CLI**: Automated issue creation (`brew install gh`)
- **Voice-to-Text**: Natural language feature input (various options)
- **Project Board**: Visual workflow management in GitHub
- **Team Notifications**: Slack/Discord integration for completed research

### Setup Checklist
- [ ] Claude Code installed and authenticated
- [ ] GitHub repository access configured
- [ ] Master research prompt saved and ready
- [ ] Quality framework checklist accessible
- [ ] Project board lanes configured
- [ ] Team members trained on workflow

---

## 💡 Best Practices

### Feature Idea Quality
**Good Ideas for AI Research**:
- ✅ User-focused: Solves specific technician problems
- ✅ Scoped appropriately: Clear boundaries and objectives
- ✅ Context-rich: Mentions manufacturing environment needs
- ✅ Natural language: Conversational description

**Examples**:
- "Add search to PDF manuals so technicians can find troubleshooting steps quickly"
- "Create voice commands for common chat functions when hands are busy"
- "Show machine status at a glance so supervisors can prioritize maintenance"

### Review Efficiency  
**Fast Review Techniques**:
- Focus on direction and approach, not implementation details
- Ask "Would a technician actually use this?" 
- Check if AI understood the manufacturing context
- Verify implementation phases make sense
- Trust AI for technical details, validate business value

### Implementation Handoff
**Setting Developers Up for Success**:
- AI provides complete specification (no guesswork)
- Clear phase structure (manageable chunks)
- Realistic time estimates (based on similar past work)
- Testing strategy included (no QA surprises)
- Manufacturing context explained (domain understanding)

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### AI Output Quality Problems
**Issue**: Generic solutions that don't fit manufacturing
**Solution**: Emphasize industrial environment in feature description

**Issue**: Unrealistic time estimates or scope
**Solution**: Include "realistic for 2-person team" in feature idea

**Issue**: Missing integration with existing features
**Solution**: Mention specific GembaFix components in feature description

#### Review Process Problems
**Issue**: Reviews taking too long (>10 minutes)
**Solution**: Focus on direction, not implementation details

**Issue**: High rejection rate (>20%)
**Solution**: Improve feature idea quality and context

**Issue**: Rework after implementation starts
**Solution**: Strengthen technical review during planning phase

#### Workflow Adoption Issues
**Issue**: Team not using AI workflow consistently
**Solution**: Start with simple features, demonstrate speed benefits

**Issue**: Developers prefer traditional planning
**Solution**: Show comprehensive specifications reduce implementation questions

---

## 📈 Scaling the Workflow

### Individual → Team
1. **Start personally**: Master the workflow with 5-10 features
2. **Show results**: Demonstrate speed and quality improvements
3. **Train teammates**: Share successful patterns and techniques
4. **Standardize**: Create team conventions and quality standards

### Team → Organization
1. **Document successes**: Track productivity and quality metrics
2. **Create templates**: Standardize prompts for different work types
3. **Share learnings**: Teach other teams the workflow patterns
4. **Build culture**: Make AI-assisted development the default

### Continuous Improvement
1. **Feedback loops**: Track which AI suggestions work best
2. **Prompt evolution**: Improve master prompt based on results
3. **Domain expertise**: Accumulate manufacturing-specific patterns
4. **Tool integration**: Connect to more systems and workflows

---

## 🎉 Expected Outcomes

### Immediate Benefits (Week 1)
- **10x faster research**: Ideas to comprehensive plans in minutes
- **Higher quality**: AI considers more factors than manual research
- **Less context switching**: AI handles research while you brainstorm
- **Better documentation**: Comprehensive GitHub issues improve team communication

### Medium-term Benefits (Month 1)
- **Parallel development**: Multiple features progressing simultaneously  
- **Reduced rework**: Better planning prevents implementation problems
- **Faster onboarding**: New developers get complete specifications
- **More innovation**: Lower research cost enables more experimentation

### Long-term Benefits (3+ Months)  
- **Compounding returns**: Each feature makes the next easier
- **Domain expertise**: AI accumulates manufacturing knowledge
- **Team scaling**: New team members productive immediately
- **Competitive advantage**: Ship features faster than traditional teams

---

**This workflow transforms development from linear coding to AI-orchestrated parallel engineering, enabling small teams to build like large teams while maintaining high quality and domain expertise.**

Ready to experience 20x faster feature development? Start with your first feature idea and follow this guide!