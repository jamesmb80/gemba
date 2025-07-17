#!/usr/bin/env python3
"""
Test script for Claude Code hooks
Tests each hook individually with sample inputs
"""

import json
import subprocess
import sys
from pathlib import Path

def test_hook(hook_path: str, input_data: dict) -> dict:
    """Test a single hook with given input"""
    result = subprocess.run(
        ["python3", hook_path],
        input=json.dumps(input_data),
        capture_output=True,
        text=True
    )
    
    print(f"\n{'='*60}")
    print(f"Testing: {hook_path}")
    print(f"Input: {json.dumps(input_data, indent=2)}")
    print(f"Exit code: {result.returncode}")
    print(f"Stdout: {result.stdout}")
    if result.stderr:
        print(f"Stderr: {result.stderr}")
    
    if result.returncode == 0 and result.stdout:
        try:
            return json.loads(result.stdout.splitlines()[-1])
        except:
            return {"error": "Failed to parse output"}
    else:
        return {"error": f"Hook failed with code {result.returncode}"}

def main():
    hooks_dir = Path(__file__).parent
    
    print("Claude Code Hooks Test Suite")
    print("="*60)
    
    # Test PreToolUse hook
    print("\n1. Testing PreToolUse Hook")
    
    # Test dangerous command (should block)
    result = test_hook(
        str(hooks_dir / "pre_tool_use.py"),
        {
            "tool_name": "bash",
            "tool_input": {"command": "rm -rf /"}
        }
    )
    assert result.get("action") == "block", "Should block dangerous rm command"
    
    # Test safe command (should allow)
    result = test_hook(
        str(hooks_dir / "pre_tool_use.py"),
        {
            "tool_name": "bash",
            "tool_input": {"command": "ls -la"}
        }
    )
    assert result.get("action") == "allow", "Should allow safe ls command"
    
    # Test PostToolUse hook
    print("\n2. Testing PostToolUse Hook")
    
    result = test_hook(
        str(hooks_dir / "post_tool_use.py"),
        {
            "tool_name": "Edit",
            "tool_input": {"file_path": "/path/to/bugfix.ts"},
            "output": {"success": True}
        }
    )
    assert result == {}, "PostToolUse should return empty dict on success"
    
    # Test Notification hook
    print("\n3. Testing Notification Hook")
    
    # Test attention notification
    result = test_hook(
        str(hooks_dir / "notification.py"),
        {
            "notification": {
                "title": "User Input Required",
                "message": "Please review the changes before proceeding",
                "level": "warning"
            }
        }
    )
    assert result == {}, "Notification should return empty dict on success"
    
    # Test Stop hook
    print("\n4. Testing Stop Hook")
    
    result = test_hook(
        str(hooks_dir / "stop.py"),
        {
            "messages": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi! How can I help?"},
                {"role": "user", "content": "Create a test file"},
                {
                    "role": "assistant", 
                    "content": "I'll create that for you",
                    "tool_calls": [{
                        "function": {
                            "name": "Write",
                            "arguments": {"file_path": "/test.txt", "content": "test"}
                        }
                    }]
                }
            ]
        }
    )
    assert result == {}, "Stop should return empty dict on success"
    
    print("\n" + "="*60)
    print("✅ All hooks tested successfully!")
    print("\nNote: You should hear notification sounds if running on macOS")
    print("Check .claude/hooks/logs/ for generated log files")

if __name__ == "__main__":
    main()