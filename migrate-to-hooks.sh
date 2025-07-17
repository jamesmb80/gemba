#!/bin/bash

# Migration script: gembafix-notify → Claude Code hooks

echo "🔄 Migrating from gembafix-notify to Claude Code hooks..."
echo ""

# Check if gembafix-notify exists
if [ -f "./gembafix-notify" ]; then
    echo "✅ Found gembafix-notify script"
    echo "   The new hooks system replaces this functionality"
    echo ""
    read -p "Remove gembafix-notify? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm ./gembafix-notify
        echo "✅ Removed gembafix-notify"
    else
        echo "⚠️  Keeping gembafix-notify (but it's no longer needed)"
    fi
else
    echo "ℹ️  No gembafix-notify found (already migrated?)"
fi

echo ""
echo "🎉 Migration complete!"
echo ""
echo "The new hooks system provides:"
echo "  • Automatic safety blocks for dangerous commands"
echo "  • Smart notifications (only when your attention is needed)"
echo "  • Full chat transcript logging"
echo "  • Automatic FIXES.md updates"
echo ""
echo "Test the hooks with: python3 .claude/hooks/test_hooks.py"
echo ""
echo "For more info, see: .claude/hooks/README.md"