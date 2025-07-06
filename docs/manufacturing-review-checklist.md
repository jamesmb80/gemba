# Manufacturing-Focused Review Checklist
## Quick Reference for AI-Generated Feature Reviews

**Time Target**: 5-7 minutes per feature review
**Goal**: Catch direction problems before implementation starts

---

## 🏭 MANUFACTURING CONTEXT (2 minutes)

### Industrial Environment ✅
- [ ] **Noise Tolerance**: Works in loud manufacturing environment
- [ ] **Glove Friendly**: Usable with work gloves and safety equipment  
- [ ] **Visual Clarity**: Readable in industrial lighting conditions
- [ ] **Network Resilient**: Handles poor/intermittent connectivity
- [ ] **Safety Aware**: Doesn't distract from safety-critical work

**Quick Questions**:
- Can a technician use this while wearing gloves?
- Does it work when the factory floor is noisy?
- What happens if the network goes down?

### Technician Workflow ✅
- [ ] **Interruption Friendly**: Handles task switching and resumption
- [ ] **Context Preservation**: Maintains state across workflow interruptions
- [ ] **Quick Access**: Critical functions within 2 taps/voice commands
- [ ] **Documentation Built-in**: Auto-logs for audit trails and handoffs
- [ ] **Integration Natural**: Fits existing maintenance procedures

**Quick Questions**:
- Does this fit how technicians actually work?
- Can they be interrupted and resume easily?
- Is this faster than their current process?

### Hands-Free Priority ✅
- [ ] **Voice Commands**: Primary functions accessible by voice
- [ ] **Audio Feedback**: System speaks important status updates
- [ ] **Large Touch Targets**: Easy to activate with gloves
- [ ] **Voice Recognition**: Works in noisy industrial environments
- [ ] **Arm's Length Readable**: Information clear from working distance

**Quick Questions**:
- Can technicians use this while their hands are busy?
- Does it provide audio feedback for eyes-free operation?
- Are the buttons/areas large enough for gloved operation?

---

## 💻 TECHNICAL QUALITY (2 minutes)

### GembaFix Architecture ✅
- [ ] **React Integration**: Uses existing component patterns
- [ ] **TypeScript Safety**: Proper types, no `any` usage
- [ ] **Supabase Patterns**: Correct RLS, auth, real-time usage
- [ ] **API Consistency**: Follows established endpoint patterns
- [ ] **Testing Included**: Jest and Playwright test strategy

**Quick Questions**:
- Does this build on existing GembaFix patterns?
- Are the TypeScript types properly defined?
- Is the Supabase integration secure and efficient?

### Performance & Reliability ✅
- [ ] **Fast Loading**: <3 seconds on industrial tablets
- [ ] **Offline Capable**: Core functions work without internet
- [ ] **Error Recovery**: Graceful failure handling
- [ ] **Concurrent Safe**: Multiple technicians can use simultaneously
- [ ] **Memory Efficient**: No leaks during long shifts

**Quick Questions**:
- Will this be fast enough for urgent troubleshooting?
- What happens when the network fails?
- Can multiple people use this at the same time?

---

## 👥 USER EXPERIENCE (1 minute)

### Accessibility & Adoption ✅
- [ ] **Screen Reader Ready**: Proper ARIA labels and navigation
- [ ] **Color Blind Safe**: Info not conveyed by color alone
- [ ] **Intuitive Design**: Obvious without training
- [ ] **Error Prevention**: Hard to make mistakes
- [ ] **Clear Value**: Benefit immediately apparent

**Quick Questions**:
- Can technicians with disabilities use this effectively?
- Will people actually want to use this feature?
- Is it obviously better than the current approach?

---

## 📊 BUSINESS VALUE (1 minute)

### Manufacturing Impact ✅
- [ ] **Downtime Reduction**: Helps resolve issues faster
- [ ] **Preventive Focus**: Enables proactive maintenance
- [ ] **Knowledge Capture**: Preserves and shares expertise
- [ ] **Safety Enhancement**: Improves workplace safety
- [ ] **Efficiency Gain**: Streamlines existing processes

**Quick Questions**:
- Does this solve a real production problem?
- Will this reduce downtime or improve safety?
- Is the benefit worth the implementation effort?

### Implementation Reality ✅
- [ ] **Timeline Realistic**: Time estimates fit current capacity
- [ ] **Dependencies Clear**: Prerequisites identified and available
- [ ] **Risk Managed**: Technical challenges have mitigation plans
- [ ] **Deployment Viable**: Can roll out safely to production

**Quick Questions**:
- Can we actually build this in the estimated time?
- Do we have everything we need to get started?
- What could go wrong and how do we handle it?

---

## 🚨 DECISION MATRIX

### ✅ APPROVE (Target: 80%+)
**All sections mostly ✅ with clear manufacturing value**
- Move to "Ready" status
- Assign to developer 
- Proceed with implementation

### 🔄 REFINE (Target: 15%)
**Good direction but gaps in key areas**
- Request specific improvements
- Common requests:
  - "Add more detail on voice implementation"
  - "Consider offline scenarios better"
  - "Break down complex phases"
  - "Add more accessibility details"

### ❌ REJECT (Target: <5%)
**Poor fit or unrealistic scope**
- Close and document learnings
- Common reasons:
  - Doesn't address real manufacturing problems
  - Technical approach fundamentally flawed
  - Scope too large for current capacity

---

## 📝 QUICK REVIEW TEMPLATE

```
## Feature: [TITLE]
## Review: [APPROVE/REFINE/REJECT] | Time: [X min]

Manufacturing Context: ✅/⚠️/❌
- Industrial environment: [Quick note]
- Technician workflow: [Quick note]  
- Hands-free operation: [Quick note]

Technical Quality: ✅/⚠️/❌
- Architecture fit: [Quick note]
- Performance/reliability: [Quick note]

UX & Business: ✅/⚠️/❌
- Accessibility/adoption: [Quick note]
- Manufacturing impact: [Quick note]

Next Steps: [Action required if REFINE]
```

---

## 🎯 REVIEW BEST PRACTICES

### Before You Start
- [ ] Read feature title and problem statement first
- [ ] Scan implementation phases for scope understanding
- [ ] Note estimated timeline and complexity

### During Review
- [ ] Focus on direction and fit, not implementation details
- [ ] Ask "Would a technician actually use this?"
- [ ] Check if AI understood manufacturing environment
- [ ] Verify integration with existing GembaFix features

### After Review
- [ ] Document decision clearly with reasoning
- [ ] If REFINE: Be specific about what needs improvement
- [ ] If APPROVE: Move to appropriate project board lane
- [ ] Track review time for process improvement

### Speed Tips
- **Don't read everything**: Focus on problem, approach, and key requirements
- **Trust the AI**: For technical details, validate approach not implementation
- **Manufacturing first**: Start with "does this solve a real factory problem?"
- **Use examples**: "Like when a technician is troubleshooting pump failure..."

This checklist enables consistent 5-7 minute reviews that catch problems early while maintaining the speed benefits of AI-assisted development.