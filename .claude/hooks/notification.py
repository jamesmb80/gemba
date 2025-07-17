#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
Notification Hook for Claude Code
Sends audio notifications when tasks complete or attention is needed
Replaces gembafix-notify with integrated hook
"""

import json
import sys
import os
import subprocess
from datetime import datetime
from pathlib import Path

# Configuration
DEFAULT_SOUND = "/System/Library/Sounds/Glass.aiff"
ATTENTION_SOUND = "/System/Library/Sounds/Hero.aiff"
ERROR_SOUND = "/System/Library/Sounds/Basso.aiff"
SUCCESS_SOUND = "/System/Library/Sounds/Glass.aiff"

def play_sound(sound_file: str, volume: float = 0.5):
    """Play a sound file on macOS"""
    if sys.platform == "darwin":
        try:
            subprocess.run(
                ["afplay", sound_file, "-v", str(volume)],
                check=False,
                capture_output=True
            )
        except:
            pass

def get_notification_type(notification_data: dict) -> str:
    """Determine the type of notification based on content"""
    
    title = notification_data.get("title", "").lower()
    message = notification_data.get("message", "").lower()
    level = notification_data.get("level", "info").lower()
    
    # Check for attention/urgent notifications
    attention_keywords = ["attention", "review", "confirm", "waiting", "input needed", "help"]
    for keyword in attention_keywords:
        if keyword in title or keyword in message:
            return "attention"
    
    # Check for errors
    if level == "error" or "error" in title or "failed" in message:
        return "error"
    
    # Check for success
    success_keywords = ["complete", "success", "done", "finished", "ready"]
    for keyword in success_keywords:
        if keyword in title or keyword in message:
            return "success"
    
    return "info"

def should_notify(notification_type: str, notification_data: dict) -> bool:
    """Determine if we should send a notification based on CLAUDE.md rules"""
    
    # Always notify for attention-required situations
    if notification_type == "attention":
        return True
    
    # Always notify for errors
    if notification_type == "error":
        return True
    
    # For success notifications, check if it's a major task completion
    if notification_type == "success":
        message = notification_data.get("message", "").lower()
        # Notify for major completions
        major_keywords = ["build complete", "tests passed", "deployment ready", "task complete"]
        for keyword in major_keywords:
            if keyword in message:
                return True
    
    # Default: don't notify for minor events
    return False

def log_notification(notification_data: dict, notification_type: str, notified: bool):
    """Log notification events"""
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(exist_ok=True)
    
    log_file = log_dir / "notifications.json"
    
    # Read existing logs
    existing_logs = []
    if log_file.exists():
        try:
            with open(log_file, "r") as f:
                existing_logs = json.load(f)
        except:
            existing_logs = []
    
    # Add new log entry
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "type": notification_type,
        "notified": notified,
        "title": notification_data.get("title", ""),
        "message": notification_data.get("message", "")[:100]  # Truncate long messages
    }
    
    existing_logs.append(log_entry)
    
    # Keep only last 500 entries
    if len(existing_logs) > 500:
        existing_logs = existing_logs[-500:]
    
    # Write back
    with open(log_file, "w") as f:
        json.dump(existing_logs, f, indent=2)

def main():
    """Main hook handler"""
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    notification_data = input_data.get("notification", {})
    
    # Determine notification type
    notification_type = get_notification_type(notification_data)
    
    # Check if we should notify based on rules
    should_send = should_notify(notification_type, notification_data)
    
    # Log the notification
    log_notification(notification_data, notification_type, should_send)
    
    # Send notification if appropriate
    if should_send:
        # Choose sound based on type
        if notification_type == "attention":
            play_sound(ATTENTION_SOUND, volume=0.7)
            # Also play terminal bell for attention
            print('\a', end='', flush=True)
        elif notification_type == "error":
            play_sound(ERROR_SOUND, volume=0.6)
        elif notification_type == "success":
            play_sound(SUCCESS_SOUND, volume=0.5)
        else:
            play_sound(DEFAULT_SOUND, volume=0.4)
        
        # Log to console for visibility
        emoji = {
            "attention": "🚨",
            "error": "❌",
            "success": "✅",
            "info": "ℹ️"
        }.get(notification_type, "🔔")
        
        print(f"\n{emoji} {notification_data.get('title', 'Notification')}: {notification_data.get('message', '')}")
    
    # Prepare output (hooks should return empty object on success)
    output = {}
    
    # Write output
    print(json.dumps(output))

if __name__ == "__main__":
    main()