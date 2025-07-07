# Git History Cleanup Pre-Flight Checklist

## Before You Start

### 1. Verify Current State
```bash
# Run the verification script to see what needs cleaning
./verify_cleanup.sh
```

### 2. Check Disk Space
```bash
# Ensure you have enough space for backups (need ~2x repository size)
du -sh ~/Desktop/GembaFix
df -h ~/Desktop
```

### 3. Save Important Information
- [ ] Note current branch: `github-workflow-implementation`
- [ ] Note current commit: Run `git rev-parse HEAD`
- [ ] List any uncommitted changes: `git status`
- [ ] Save any important stashed work: `git stash list`

### 4. Team Communication
- [ ] Notify team members about the upcoming history rewrite
- [ ] Ensure no one is actively pushing commits
- [ ] Share the new clone instructions they'll need

## Quick Start Commands

If you're ready to proceed, here's the condensed version:

```bash
# 1. Create backup
cd ~/Desktop
tar -czf GembaFix_backup_$(date +%Y%m%d_%H%M%S).tar.gz GembaFix/

# 2. Enter repository
cd GembaFix

# 3. Save MCP files
cp .mcp.json ~/.mcp.json.backup

# 4. Install git-filter-repo
pip3 install git-filter-repo

# 5. Remove remote
git remote remove origin

# 6. Clean history
git filter-repo --path .mcp.json --path .cursor/mcp.json --invert-paths --force

# 7. Restore MCP file
cp ~/.mcp.json.backup .mcp.json

# 8. Re-add remote
git remote add origin https://github.com/jamesmb80/GEMBA.git

# 9. Force push
git push --force --all origin
git push --force --tags origin

# 10. Verify
./verify_cleanup.sh
```

## Emergency Contacts

If something goes wrong:
1. **Don't Panic** - You have backups
2. **Check the full plan** - Read GIT_CLEANUP_PLAN.md
3. **Restore from backup** if needed

## Expected Outcome

After successful cleanup:
- ✅ No API keys in Git history
- ✅ GitHub push protection removed
- ✅ All commits preserved (with new hashes)
- ✅ Local MCP files still working
- ✅ Can push to GitHub normally

## Time Estimate

- ⏱️ Full process: 30-35 minutes
- ⏱️ Quick process (if confident): 15 minutes
- ⏱️ Rollback (if needed): 5 minutes