#!/bin/bash

# Git History Cleanup Verification Script
# This script verifies that sensitive files have been removed from Git history

echo "Git History Cleanup Verification"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Files to check
SENSITIVE_FILES=(
    ".mcp.json"
    ".cursor/mcp.json"
    "*.env"
    "*.env.local"
    "*api*key*"
)

echo "Checking for sensitive files in Git history..."
echo ""

FOUND_ISSUES=0

for pattern in "${SENSITIVE_FILES[@]}"; do
    echo -n "Checking for $pattern... "
    
    # Check if file exists in any commit
    if git log --all --oneline -- "$pattern" 2>/dev/null | grep -q .; then
        echo -e "${RED}FOUND${NC}"
        echo "  Found in commits:"
        git log --all --oneline -- "$pattern" | head -5 | sed 's/^/    /'
        FOUND_ISSUES=$((FOUND_ISSUES + 1))
        echo ""
    else
        echo -e "${GREEN}CLEAN${NC}"
    fi
done

echo ""
echo "Checking commit messages for sensitive keywords..."
echo ""

KEYWORDS=("api key" "API key" "secret" "token" "password" "credential")

for keyword in "${KEYWORDS[@]}"; do
    echo -n "Searching for '$keyword' in commit messages... "
    COUNT=$(git log --all --grep="$keyword" --oneline 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${YELLOW}Found $COUNT occurrences${NC}"
        git log --all --grep="$keyword" --oneline | head -3 | sed 's/^/    /'
        echo ""
    else
        echo -e "${GREEN}CLEAN${NC}"
    fi
done

echo ""
echo "Checking current .gitignore..."
echo ""

REQUIRED_IGNORES=(
    ".mcp.json"
    ".cursor/mcp.json"
    ".env"
    ".env.local"
)

for ignore in "${REQUIRED_IGNORES[@]}"; do
    echo -n "Checking if '$ignore' is in .gitignore... "
    if grep -q "^${ignore}$\|/${ignore}$\|^${ignore/\//\\/}$" .gitignore 2>/dev/null; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${RED}NO${NC}"
        FOUND_ISSUES=$((FOUND_ISSUES + 1))
    fi
done

echo ""
echo "================================"
if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Your Git history appears to be clean."
else
    echo -e "${RED}✗ Found $FOUND_ISSUES issues${NC}"
    echo "Please run the cleanup process before pushing to GitHub."
fi
echo ""

# Check if sensitive files exist locally but are ignored
echo "Checking local sensitive files (should exist but be ignored)..."
echo ""

if [ -f ".mcp.json" ]; then
    echo -e "${GREEN}✓${NC} .mcp.json exists locally (good for development)"
else
    echo -e "${YELLOW}!${NC} .mcp.json not found locally (may need to restore from backup)"
fi

if [ -f ".cursor/mcp.json" ]; then
    echo -e "${GREEN}✓${NC} .cursor/mcp.json exists locally"
else
    echo -e "${YELLOW}!${NC} .cursor/mcp.json not found locally"
fi