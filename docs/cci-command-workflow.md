# CCI Command Workflow
## Claude Code Intelligence - Automated Feature Research

**Command Format**: `CCI: [your feature idea]`

## How It Works

When you type "CCI:" followed by any feature idea or bug description, I will:

1. **Automatically trigger** the Master Research Prompt v2.0
2. **Research your codebase** for relevant patterns and integration points
3. **Apply manufacturing domain expertise** for industrial environment considerations
4. **Generate comprehensive GitHub issue** with implementation plan
5. **Create the issue** directly in your repository (or provide formatted content)

## Usage Examples

### Simple Feature Ideas
```
CCI: Add export functionality to session history
CCI: Create quick machine status indicators on dashboard
CCI: Add voice shortcuts for common PDF navigation
```

### Complex Feature Ideas
```
CCI: Implement smart maintenance scheduling based on equipment usage patterns
CCI: Create collaborative troubleshooting sessions between multiple technicians
CCI: Add predictive failure analysis using historical troubleshooting data
```

### Bug Reports
```
CCI: PDF viewer sometimes crashes when loading large manuals
CCI: Voice commands not working reliably in noisy environments
CCI: Session data occasionally lost during network disconnections
```

## Automatic Research Process

When you use the CCI command, I will systematically research:

### Phase 1: Codebase Analysis (5 minutes)
- Review relevant React components
- Check existing API patterns
- Analyze database schema integration
- Identify reusable utilities

### Phase 2: Manufacturing Domain (3 minutes)  
- Industrial environment constraints
- Technician workflow integration
- Hands-free operation requirements
- Safety and compliance considerations

### Phase 3: Technical Best Practices (3 minutes)
- Industry standard implementations
- Performance and reliability patterns
- Security and accessibility requirements
- Voice interface design guidelines

### Phase 4: Implementation Planning (4 minutes)
- Technical architecture design
- Risk assessment and mitigation
- Phased implementation strategy
- Testing and validation approach

## Output Quality

Each CCI command generates:
- **2000+ word GitHub issue** with comprehensive specifications
- **Manufacturing-focused requirements** for industrial environment
- **Implementation plan** with realistic time estimates
- **Testing strategy** including voice and accessibility
- **Success criteria** with measurable outcomes
- **Risk assessment** with mitigation strategies

## Direct GitHub Integration

After generating the research, I can:
1. **Create GitHub issue automatically** using the `gh` CLI
2. **Apply appropriate labels** (~feature, ~manufacturing, ~voice, ~accessibility)
3. **Set priority and complexity** based on analysis
4. **Link to project board** for workflow management

## Voice Integration Ready

Since you have Wispr Flow, you can:
1. **Speak your ideas**: "CCI: I want technicians to track maintenance history"
2. **Voice triggers research**: Automatic workflow activation
3. **Natural language input**: No need for perfect formatting
4. **Hands-free brainstorming**: Generate ideas while working

## Example Workflow

### Input
```
CCI: Add offline sync for when technicians work in dead zones
```

### Automatic Processing
I will automatically:
1. Research existing offline patterns in your codebase
2. Analyze PWA and service worker implementations
3. Consider manufacturing environment connectivity issues
4. Design sync conflict resolution strategies
5. Create comprehensive implementation plan

### Output
A complete GitHub issue with:
- Problem statement for dead zone connectivity
- Technical approach using service workers
- Manufacturing-specific offline requirements
- Implementation phases with time estimates
- Testing strategy for intermittent connectivity
- Success criteria and performance metrics

## Ready to Use

The CCI command is **ready for immediate use**. Just type:

```
CCI: [your feature idea here]
```

And I'll automatically run the complete research workflow to generate a comprehensive, implementation-ready GitHub issue tailored for GembaFix's manufacturing environment.

---

**Next**: Try your first CCI command with any feature idea!