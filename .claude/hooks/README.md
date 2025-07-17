# Claude Code Hooks System

This directory contains the Claude Code hooks implementation for the GembaFix project, providing safety guardrails, automated logging, and smart notifications.

## Overview

The hooks system replaces the previous `gembafix-notify` script with an integrated solution that:
- Blocks dangerous operations before they execute
- Logs all tool usage and chat transcripts
- Provides intelligent audio notifications (only when your attention is needed)
- Automatically updates FIXES.md for debugging activities

## Hooks

### 1. PreToolUse Hook (`pre_tool_use.py`)
**Purpose**: Blocks dangerous commands before execution

**Blocks**:
- Dangerous rm commands (`rm -rf`, `rm -r`, etc.)
- Bulk file operations (`* 2.tsx`, `**/*.tsx`)
- Dangerous git commands (`git reset --hard`, `git push --force`)
- Direct editing of protected files (`.env`, `.mcp.json`)

**Logs**: `logs/pre_tool_use.json`

### 2. PostToolUse Hook (`post_tool_use.py`)
**Purpose**: Updates FIXES.md when debugging activities are detected

**Triggers on**:
- Edit/Write operations on files with debug-related names
- Running test/lint commands
- Any tool operation that results in an error

**Logs**: `logs/post_tool_use.json`

### 3. Stop Hook (`stop.py`)
**Purpose**: Saves complete chat transcripts when conversations end

**Features**:
- Saves full conversation history with timestamps
- Generates conversation summaries (tools used, files modified, errors)
- Creates daily activity logs
- Maintains a "latest" symlink for easy access

**Logs**: 
- Individual transcripts: `logs/transcripts/chat_YYYYMMDD_HHMMSS.json`
- Daily summaries: `logs/daily/YYYY-MM-DD.json`
- Latest transcript: `logs/transcripts/latest.json`

### 4. Notification Hook (`notification.py`)
**Purpose**: Provides audio alerts only when your attention is needed

**Notifications sent for**:
- Attention required (user input, reviews, confirmations)
- Errors and failures
- Major task completions (build complete, tests passed)

**Does NOT notify for**:
- Minor progress updates
- Individual file edits
- Routine operations

**Sounds**:
- Attention: Hero.aiff (louder)
- Error: Basso.aiff
- Success: Glass.aiff

**Logs**: `logs/notifications.json`

## Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "preToolUse": ".claude/hooks/pre_tool_use.py",
    "postToolUse": ".claude/hooks/post_tool_use.py",
    "stop": ".claude/hooks/stop.py",
    "notification": ".claude/hooks/notification.py"
  }
}
```

## Testing

Run the test suite to verify all hooks are working:

```bash
python3 .claude/hooks/test_hooks.py
```

This will:
- Test each hook with sample inputs
- Verify blocking behavior works correctly
- Play notification sounds (on macOS)
- Create test log entries

## Logs Directory Structure

```
logs/
├── pre_tool_use.json      # Blocked/allowed tool operations
├── post_tool_use.json     # Tool execution results
├── notifications.json     # Notification history
├── transcripts/          # Full chat transcripts
│   ├── chat_20250707_221800.json
│   └── latest.json       # Symlink to most recent
└── daily/               # Daily activity summaries
    └── 2025-07-07.json
```

## Viewing Logs

### Recent blocked operations
```bash
tail -n 50 .claude/hooks/logs/pre_tool_use.json | jq '.'
```

### Today's activity summary
```bash
cat .claude/hooks/logs/daily/$(date +%Y-%m-%d).json | jq '.'
```

### Latest chat transcript
```bash
cat .claude/hooks/logs/transcripts/latest.json | jq '.summary'
```

## Troubleshooting

### No notification sounds
- Check macOS System Settings > Sound > Sound Effects volume
- Verify with: `afplay /System/Library/Sounds/Glass.aiff`

### Hooks not running
- Ensure UV is installed: `brew install uv`
- Check file permissions: `chmod +x .claude/hooks/*.py`
- Verify settings.json has correct hook paths

### FIXES.md not updating
- Ensure FIXES.md exists in project root
- Check post_tool_use.json logs for errors

## Migration from gembafix-notify

The hooks system completely replaces `gembafix-notify`. You can safely remove:
- The `gembafix-notify` script
- Any aliases or PATH entries for it

The notification hook provides the same audio alerts but with smarter filtering to reduce notification fatigue.