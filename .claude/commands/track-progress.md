# Progress Tracking Command

Real-time tracking and visualization of parallel development sessions.

## Usage
```
/project:track-progress [issue-numbers]
```

## Examples
```
/project:track-progress              # Show all active issues
/project:track-progress 8,12,15     # Track specific issues
/project:track-progress --dashboard  # Open visual dashboard
```

## Progress Tracking Features

### 1. Real-Time Status Updates
Monitors and reports on:
- Current development stage (Backlog → Research → Ready → In Progress → Review → Done)
- Active Claude Code sessions
- Git commit activity
- Test execution status
- Build pipeline results

### 2. Dependency Visualization
```
Issue #12 (In Progress) 
  ├─ Depends on: #8 (Done) ✅
  └─ Blocks: #15 (Ready) ⏸️
```

### 3. Time Tracking
- Actual vs estimated hours
- Time in each stage
- Bottleneck identification
- Velocity calculations

### 4. Blocker Management
- Automatic blocker detection
- Impact analysis
- Resolution suggestions
- Escalation triggers

## Dashboard Output

```
=== GembaFix Development Progress ===
Last Updated: 2025-07-07 21:45:30

Active Sessions: 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 BACKLOG (2)
  • #16 Smart Alert System
  • #17 Maintenance Calendar

🔬 RESEARCH (1)
  • #18 Voice Commands [2h 15m] 🤖 Claude analyzing...

✅ READY (2)  
  • #10 Safety Checklist [blocked by #8]
  • #11 Export Feature [approved ✓]

🚧 IN PROGRESS (3)
  • #8 Status Badges [85%] 🟢 Tests: 12/12 ✅
    └─ James: Implementing UI components
  • #12 Quick Actions [40%] 🟡 Tests: 5/8 ⚠️
    └─ Claude: Adding API endpoints
  • #15 Dark Mode [15%] 🔴 Build failing ❌
    └─ Blocked: Theme system conflict

👀 REVIEW (1)
  • #9 PDF Search [PR #47] 
    └─ 2 comments to address

✨ DONE TODAY (2)
  • #6 Bookmarking ✅ [3h 20m]
  • #7 Filter System ✅ [4h 45m]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 METRICS
• Velocity: 8 points/day (↑ 60%)
• Cycle Time: 6.5 hours avg
• Quality Gates: 94% pass rate
• Test Coverage: 87%

⚡ RECOMMENDATIONS
1. Unblock #15 by resolving theme conflict
2. #12 needs test fixes before proceeding  
3. Consider parallelizing #16 and #17

🎯 PROJECTED COMPLETION
At current velocity: 2.5 days for all active items
```

## Integration Points

### 1. Git Hook Integration
Automatically updates progress on:
- Commit with issue reference: `git commit -m "feat: add badges - refs #8"`
- PR creation/update
- CI/CD pipeline results

### 2. Claude Code Session Tracking
Detects active Claude Code sessions by monitoring:
- File changes in real-time
- Terminal activity patterns  
- Tool usage frequency

### 3. GitHub Board Sync
- Two-way sync with GitHub Projects
- Automatic stage transitions
- Comment synchronization

## Parallel Development Support

### Session Coordination
```
Active Claude Sessions:
1. Claude-1: Working on #8 (frontend/components/StatusBadge.tsx)
2. Claude-2: Working on #12 (api/quick-actions/route.ts)
3. Human: Reviewing #9 (PR feedback)

No conflicts detected ✅
```

### Conflict Prevention
- Real-time file lock monitoring
- Merge conflict prediction
- Suggested work distribution

## Quality Gate Integration

Each issue shows quality status:
- 🟢 All gates passed
- 🟡 Warnings to address
- 🔴 Blocking issues
- 🔵 Not yet evaluated

## Automation Rules

### Auto-Stage Transitions
- First commit → "In Progress"
- All tests pass → "Ready for Review"  
- PR approved → "Done"
- Quality gate fail → "Blocked"

### Smart Notifications
- Blocker detected → Alert team
- Tests failing > 30min → Suggest help
- Velocity drop > 20% → Review process
- Dependencies complete → Unblock waiting issues

## CLI Options

```bash
--dashboard     # Open web dashboard
--json         # Output as JSON
--watch        # Live updates
--metrics      # Show detailed metrics
--export       # Export progress report
--notify       # Send notifications
```

## Success Patterns

The system identifies and promotes successful patterns:
- Optimal issue sizing (4-8 hours)
- Effective parallelization strategies
- High-quality commit patterns
- Efficient review cycles

This creates a self-improving development process that gets faster and more reliable over time.