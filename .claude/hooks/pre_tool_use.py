#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
PreToolUse Hook for Claude Code
Blocks dangerous commands and protects sensitive files based on CLAUDE.md rules
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Patterns to block based on CLAUDE.md
DANGEROUS_PATTERNS = {
    "rm_commands": [
        "rm -rf",
        "rm -r",
        "rm -f",
        "rm *",
        "find . -delete",
        "find . -type f -delete"
    ],
    "bulk_operations": [
        "* 2.tsx",  # Specific pattern mentioned in CLAUDE.md
        "**/*.tsx",
        "**/*.ts",
        "*.md",
        "* -delete"
    ],
    "git_dangerous": [
        "git reset --hard",
        "git clean -fd",
        "git push --force"
    ]
}

# Protected files that should never be edited directly
PROTECTED_FILES = [
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production.local",
    ".mcp.json",
    ".cursor/mcp.json",
    "frontend/.env",
    "frontend/.env.local",
    "backend/.env",
    "backend/.env.local"
]

def is_dangerous_command(tool_name: str, tool_input: dict) -> tuple[bool, str]:
    """Check if a command is dangerous and should be blocked"""
    
    # Check bash/shell commands
    if tool_name in ["bash", "shell", "execute"]:
        command = tool_input.get("command", "").lower()
        
        # Check for dangerous rm patterns
        for pattern in DANGEROUS_PATTERNS["rm_commands"]:
            if pattern in command:
                return True, f"Blocked dangerous command: {pattern}"
        
        # Check for bulk operations
        for pattern in DANGEROUS_PATTERNS["bulk_operations"]:
            if pattern in command:
                return True, f"Blocked bulk operation: {pattern}"
        
        # Check for dangerous git commands
        for pattern in DANGEROUS_PATTERNS["git_dangerous"]:
            if pattern in command:
                return True, f"Blocked dangerous git command: {pattern}"
    
    # Check file operations
    if tool_name in ["edit", "write", "delete", "remove"]:
        file_path = tool_input.get("file_path", "")
        
        # Check if trying to edit protected files
        for protected in PROTECTED_FILES:
            if protected in file_path or file_path.endswith(protected):
                return True, f"Blocked access to protected file: {protected}"
    
    # Check for bulk file deletions
    if tool_name == "remove" and "*" in str(tool_input):
        return True, "Blocked bulk file deletion"
    
    return False, ""

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
    
    # Write back
    with open(log_file, "w") as f:
        json.dump(existing_logs, f, indent=2)

def main():
    """Main hook handler"""
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    
    # Check if command is dangerous
    is_blocked, reason = is_dangerous_command(tool_name, tool_input)
    
    # Log the event
    log_event("pre_tool_use", {
        "tool_name": tool_name,
        "tool_input": tool_input,
        "blocked": is_blocked,
        "reason": reason if is_blocked else "allowed"
    })
    
    # Prepare output
    output = {
        "action": "block" if is_blocked else "allow"
    }
    
    if is_blocked:
        output["message"] = f"⚠️ BLOCKED: {reason}\n\nThis action violates safety rules in CLAUDE.md. If you really need to perform this action, please do it manually or modify the command to be safer."
        
        # Suggest alternatives for common blocked actions
        if "rm" in reason:
            output["message"] += "\n\nAlternatives:\n- Use 'mv' to move files to a backup directory\n- Delete specific files one by one\n- Create a backup before deletion"
        elif ".env" in reason:
            output["message"] += "\n\nTo update environment variables:\n- Edit the file manually\n- Use 'echo' to show what should be added"
    
    # Write output
    print(json.dumps(output))

if __name__ == "__main__":
    main()