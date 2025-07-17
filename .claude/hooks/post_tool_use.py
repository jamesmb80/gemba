#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
PostToolUse Hook for Claude Code
Updates FIXES.md when relevant debugging/fixing actions are taken
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Tools that indicate debugging/fixing activities
DEBUG_TOOLS = ["Edit", "Write", "MultiEdit", "Bash"]

# Keywords that suggest debugging/fixing
DEBUG_KEYWORDS = [
    "fix", "debug", "error", "bug", "issue", "problem", "broken",
    "repair", "resolve", "patch", "workaround", "solution"
]

def should_update_fixes(tool_name: str, tool_input: dict, output: dict) -> bool:
    """Determine if this tool use should trigger a FIXES.md update"""
    
    # Check if it's a debugging-related tool
    if tool_name not in DEBUG_TOOLS:
        return False
    
    # Check for error in output
    if output.get("error"):
        return True
    
    # Check for debug keywords in file paths or commands
    if tool_name in ["Edit", "Write", "MultiEdit"]:
        file_path = tool_input.get("file_path", "").lower()
        for keyword in DEBUG_KEYWORDS:
            if keyword in file_path:
                return True
    
    if tool_name == "Bash":
        command = tool_input.get("command", "").lower()
        # Common debugging commands
        debug_commands = ["npm run lint", "npm run type-check", "npm run test", "jest", "playwright"]
        for debug_cmd in debug_commands:
            if debug_cmd in command:
                return True
    
    return False

def create_fixes_entry(tool_name: str, tool_input: dict, output: dict) -> str:
    """Create a new FIXES.md entry template"""
    
    date_str = datetime.now().strftime("%Y-%m-%d")
    
    # Determine component/feature from file path or command
    component = "Unknown Component"
    if tool_name in ["Edit", "Write", "MultiEdit"]:
        file_path = tool_input.get("file_path", "")
        if file_path:
            # Extract component name from path
            parts = file_path.split("/")
            if "components" in parts:
                idx = parts.index("components")
                if idx + 1 < len(parts):
                    component = parts[idx + 1].replace(".tsx", "").replace(".ts", "")
            else:
                component = Path(file_path).stem
    elif tool_name == "Bash":
        command = tool_input.get("command", "")
        if "test" in command:
            component = "Testing"
        elif "lint" in command:
            component = "Linting"
        elif "build" in command:
            component = "Build Process"
    
    # Check if there was an error
    status = "ATTEMPTED ⏳"
    if output.get("error"):
        status = "INVESTIGATING 🔍"
    
    entry = f"""
## {date_str} - {component} - {status}

**Problem:** [TO BE UPDATED BY CLAUDE CODE]
**Root Cause:** [TO BE UPDATED BY CLAUDE CODE]
**Attempted Solution:** [TO BE UPDATED BY CLAUDE CODE]
**Reasoning:** [TO BE UPDATED BY CLAUDE CODE]
**Code Changes:** {tool_input.get('file_path', 'N/A')}
**Testing Steps:** [TO BE UPDATED BY CLAUDE CODE]
**Outcome:** [TO BE UPDATED]
**Side Effects:** [TO BE UPDATED]
**Lessons Learned:** [TO BE UPDATED]
**Next Steps:** [TO BE UPDATED]

---
"""
    
    return entry

def append_to_fixes(entry: str):
    """Append entry to FIXES.md"""
    
    fixes_path = Path.cwd() / "FIXES.md"
    
    if not fixes_path.exists():
        # If FIXES.md doesn't exist, don't create it
        # User should have it as part of their project
        return False
    
    # Read current content
    with open(fixes_path, "r") as f:
        content = f.read()
    
    # Find the insertion point (after the template, before fix history)
    insert_marker = "## Fix History"
    if insert_marker in content:
        parts = content.split(insert_marker)
        new_content = parts[0] + insert_marker + "\n" + entry + parts[1]
    else:
        # Append at the end
        new_content = content + "\n" + entry
    
    # Write back
    with open(fixes_path, "w") as f:
        f.write(new_content)
    
    return True

def log_event(event_type: str, data: dict):
    """Log events to the logs directory"""
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(exist_ok=True)
    
    log_file = log_dir / f"{event_type}.json"
    
    # Read existing logs
    existing_logs = []
    if log_file.exists():
        try:
            with open(log_file, "r") as f:
                existing_logs = json.load(f)
        except:
            existing_logs = []
    
    # Add new log entry with timestamp
    data["timestamp"] = datetime.now().isoformat()
    existing_logs.append(data)
    
    # Keep only last 1000 entries
    if len(existing_logs) > 1000:
        existing_logs = existing_logs[-1000:]
    
    # Write back
    with open(log_file, "w") as f:
        json.dump(existing_logs, f, indent=2)

def main():
    """Main hook handler"""
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    tool_output = input_data.get("output", {})
    
    # Log the event
    log_event("post_tool_use", {
        "tool_name": tool_name,
        "tool_input": tool_input,
        "had_error": bool(tool_output.get("error")),
        "error_message": tool_output.get("error", "")
    })
    
    # Check if we should update FIXES.md
    if should_update_fixes(tool_name, tool_input, tool_output):
        entry = create_fixes_entry(tool_name, tool_input, tool_output)
        if append_to_fixes(entry):
            print(f"\n📝 Added entry to FIXES.md for {tool_name} operation")
            print("   Remember to update the entry with details!")
    
    # Prepare output (hooks should return empty object on success)
    output = {}
    
    # Write output
    print(json.dumps(output))

if __name__ == "__main__":
    main()