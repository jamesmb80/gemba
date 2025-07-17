#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
Stop Hook for Claude Code
Logs full chat transcript when conversation ends
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

def save_transcript(messages: list):
    """Save the chat transcript to a JSON file"""
    
    # Create logs directory if it doesn't exist
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(exist_ok=True)
    
    # Create transcripts subdirectory
    transcript_dir = log_dir / "transcripts"
    transcript_dir.mkdir(exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"chat_{timestamp}.json"
    filepath = transcript_dir / filename
    
    # Prepare transcript data
    transcript_data = {
        "timestamp": datetime.now().isoformat(),
        "message_count": len(messages),
        "messages": messages,
        "summary": generate_summary(messages)
    }
    
    # Save to file
    with open(filepath, "w") as f:
        json.dump(transcript_data, f, indent=2)
    
    # Also update the latest transcript link
    latest_link = transcript_dir / "latest.json"
    if latest_link.exists():
        latest_link.unlink()
    latest_link.symlink_to(filepath.name)
    
    return filepath

def generate_summary(messages: list) -> dict:
    """Generate a summary of the conversation"""
    
    summary = {
        "total_messages": len(messages),
        "user_messages": 0,
        "assistant_messages": 0,
        "tools_used": [],
        "files_modified": [],
        "errors_encountered": [],
        "key_topics": []
    }
    
    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")
        
        if role == "user":
            summary["user_messages"] += 1
        elif role == "assistant":
            summary["assistant_messages"] += 1
            
            # Extract tool usage
            if "tool_calls" in msg:
                for tool_call in msg.get("tool_calls", []):
                    tool_name = tool_call.get("function", {}).get("name", "")
                    if tool_name and tool_name not in summary["tools_used"]:
                        summary["tools_used"].append(tool_name)
                    
                    # Track file modifications
                    if tool_name in ["Edit", "Write", "MultiEdit"]:
                        args = tool_call.get("function", {}).get("arguments", {})
                        if isinstance(args, str):
                            try:
                                args = json.loads(args)
                            except:
                                continue
                        file_path = args.get("file_path", "")
                        if file_path and file_path not in summary["files_modified"]:
                            summary["files_modified"].append(file_path)
        
        # Look for error indicators
        if isinstance(content, str):
            error_keywords = ["error", "failed", "exception", "traceback", "broken"]
            for keyword in error_keywords:
                if keyword.lower() in content.lower():
                    summary["errors_encountered"].append({
                        "message_index": messages.index(msg),
                        "keyword": keyword,
                        "preview": content[:100] + "..." if len(content) > 100 else content
                    })
                    break
    
    return summary

def create_daily_log(filepath: Path, summary: dict):
    """Append to daily activity log"""
    
    log_dir = filepath.parent.parent
    daily_dir = log_dir / "daily"
    daily_dir.mkdir(exist_ok=True)
    
    today = datetime.now().strftime("%Y-%m-%d")
    daily_file = daily_dir / f"{today}.json"
    
    # Read existing daily log
    daily_data = []
    if daily_file.exists():
        try:
            with open(daily_file, "r") as f:
                daily_data = json.load(f)
        except:
            daily_data = []
    
    # Add this session's summary
    session_entry = {
        "time": datetime.now().strftime("%H:%M:%S"),
        "transcript_file": filepath.name,
        "duration_messages": summary["total_messages"],
        "tools_used": summary["tools_used"],
        "files_modified": summary["files_modified"],
        "had_errors": len(summary["errors_encountered"]) > 0
    }
    
    daily_data.append(session_entry)
    
    # Save updated daily log
    with open(daily_file, "w") as f:
        json.dump(daily_data, f, indent=2)

def main():
    """Main hook handler"""
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    messages = input_data.get("messages", [])
    
    # Save the transcript
    filepath = save_transcript(messages)
    
    # Generate summary
    summary = generate_summary(messages)
    
    # Update daily log
    create_daily_log(filepath, summary)
    
    # Log summary to console (visible in Claude Code output)
    print(f"\n📝 Chat transcript saved: {filepath}")
    print(f"   Total messages: {summary['total_messages']}")
    print(f"   Tools used: {len(summary['tools_used'])}")
    print(f"   Files modified: {len(summary['files_modified'])}")
    
    if summary["errors_encountered"]:
        print(f"   ⚠️  Errors detected: {len(summary['errors_encountered'])}")
    
    # Prepare output (hooks should return empty object on success)
    output = {}
    
    # Write output
    print(json.dumps(output))

if __name__ == "__main__":
    main()