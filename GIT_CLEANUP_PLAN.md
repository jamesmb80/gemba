# Git History Cleanup Plan - Remove API Keys from Commits

## Current Situation Analysis

### Affected Commits
- **Commit 3c34429**: Contains `.cursor/mcp.json` with API keys
- **Commit 360c30b**: Contains `.mcp.json` with API keys
- **Current Branch**: `github-workflow-implementation`
- **GitHub Protection**: Push protection is blocking all pushes due to detected secrets

### Files Status
- `.mcp.json`: Exists locally (needed for development)
- `.cursor/mcp.json`: Not found locally (may have been removed)
- Both files are now in `.gitignore` (as of commit 38ea172)

## Cleanup Strategy

We'll use **git filter-repo** (recommended by Git team) as it's safer and faster than deprecated alternatives.

## Step-by-Step Cleanup Process

### Phase 1: Preparation and Backup

#### 1.1 Create Full Backup
```bash
# Create a backup directory
mkdir -p ~/Desktop/GembaFix_backup_$(date +%Y%m%d_%H%M%S)

# Copy entire repository
cp -R ~/Desktop/GembaFix ~/Desktop/GembaFix_backup_$(date +%Y%m%d_%H%M%S)/

# Also create a zip archive
cd ~/Desktop
tar -czf GembaFix_backup_$(date +%Y%m%d_%H%M%S).tar.gz GembaFix/
```

#### 1.2 Save Current Work
```bash
cd ~/Desktop/GembaFix

# Stash any uncommitted changes
git stash save "Pre-cleanup stash $(date +%Y%m%d_%H%M%S)"

# Create a tag for current state
git tag pre-cleanup-$(date +%Y%m%d_%H%M%S)
```

#### 1.3 Backup MCP Config Files
```bash
# Backup existing MCP files that we need to preserve
cp .mcp.json ~/.mcp.json.backup 2>/dev/null || echo "No .mcp.json to backup"
cp .cursor/mcp.json ~/.cursor-mcp.json.backup 2>/dev/null || echo "No .cursor/mcp.json to backup"
```

### Phase 2: Install git-filter-repo

#### Option A: Using pip (Recommended)
```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Verify installation
git filter-repo --version
```

#### Option B: Using Homebrew (macOS)
```bash
# Install via Homebrew
brew install git-filter-repo

# Verify installation
git filter-repo --version
```

### Phase 3: Clean Git History

#### 3.1 Remove GitHub Remote (Required by git-filter-repo)
```bash
# List current remotes
git remote -v

# Remove origin remote (we'll add it back later)
git remote remove origin
```

#### 3.2 Run git-filter-repo to Remove Files
```bash
# Remove both MCP config files from entire history
git filter-repo --path .mcp.json --path .cursor/mcp.json --invert-paths --force
```

#### 3.3 Verify Cleanup
```bash
# Check that files are removed from history
git log --all --oneline -- .mcp.json .cursor/mcp.json
# Should return nothing

# Verify commits still exist but without the sensitive files
git log --oneline -20
```

### Phase 4: Restore Local Configuration

#### 4.1 Restore MCP Files
```bash
# Restore the backed up MCP files
cp ~/.mcp.json.backup .mcp.json 2>/dev/null || echo "No .mcp.json backup to restore"
mkdir -p .cursor
cp ~/.cursor-mcp.json.backup .cursor/mcp.json 2>/dev/null || echo "No .cursor/mcp.json backup to restore"
```

#### 4.2 Verify .gitignore
```bash
# Ensure .gitignore contains the MCP files
grep -E "(\.mcp\.json|\.cursor/mcp\.json)" .gitignore
```

### Phase 5: Re-establish Repository Connection

#### 5.1 Add Remote Back
```bash
# Add the GitHub remote back
git remote add origin https://github.com/jamesmb80/GEMBA.git

# Verify remote
git remote -v
```

#### 5.2 Force Push Cleaned History
```bash
# DANGER: This will rewrite history on GitHub
# Make sure all team members are aware before proceeding

# Force push all branches
git push --force --all origin

# Force push all tags
git push --force --tags origin
```

### Phase 6: Cleanup and Verification

#### 6.1 Verify Push Success
```bash
# Fetch latest from remote
git fetch origin

# Check that local and remote are in sync
git status
```

#### 6.2 Test Clone
```bash
# Clone to a temporary directory to verify
cd /tmp
git clone https://github.com/jamesmb80/GEMBA.git gemba-test
cd gemba-test

# Verify sensitive files are not in history
git log --all --oneline -- .mcp.json .cursor/mcp.json
# Should return nothing
```

#### 6.3 Restore Stashed Changes
```bash
cd ~/Desktop/GembaFix

# List stashes
git stash list

# Apply the most recent stash
git stash pop
```

## Rollback Plan

If something goes wrong at any stage:

### Option 1: Restore from Local Backup
```bash
# Remove corrupted repository
cd ~/Desktop
rm -rf GembaFix

# Restore from backup
cp -R ~/Desktop/GembaFix_backup_[TIMESTAMP]/ ~/Desktop/GembaFix/

# Or extract from tar
tar -xzf GembaFix_backup_[TIMESTAMP].tar.gz
```

### Option 2: Re-clone and Cherry-pick
```bash
# Clone fresh from GitHub
cd ~/Desktop
git clone https://github.com/jamesmb80/GEMBA.git GembaFix_fresh

# Cherry-pick recent work from backup
cd GembaFix_fresh
git remote add backup ../GembaFix_backup_[TIMESTAMP]
git fetch backup
git cherry-pick [commit-hash]
```

## Important Warnings

1. **This process rewrites Git history** - All commit SHashes will change
2. **Coordinate with team members** - Everyone must re-clone after cleanup
3. **GitHub forks will be out of sync** - Forks need to be updated manually
4. **CI/CD may need updates** - Any hardcoded commit references will break
5. **Local branches need rebasing** - All local branches must be rebased onto new history

## Post-Cleanup Checklist

- [ ] All team members notified of history rewrite
- [ ] GitHub push protection no longer blocking
- [ ] MCP config files exist locally but not in Git
- [ ] `.gitignore` properly configured
- [ ] All branches successfully pushed
- [ ] CI/CD pipelines working
- [ ] Local development environment functional
- [ ] Backup archived for safety

## Alternative: Starting Fresh (Nuclear Option)

If the cleanup proves too complex:

```bash
# 1. Archive current repository
cd ~/Desktop
mv GembaFix GembaFix_old

# 2. Create new repository
mkdir GembaFix
cd GembaFix
git init

# 3. Copy all files except .git
cp -R ../GembaFix_old/* .
cp ../GembaFix_old/.gitignore .
cp ../GembaFix_old/.* . 2>/dev/null || true

# 4. Remove sensitive files
rm -f .mcp.json .cursor/mcp.json

# 5. Initial commit
git add .
git commit -m "Initial commit - cleaned history"

# 6. Push to new repository or force to existing
git remote add origin https://github.com/jamesmb80/GEMBA.git
git push --force origin main
```

## Estimated Time

- Backup: 5 minutes
- Installation: 5 minutes
- Cleanup: 10-15 minutes
- Verification: 10 minutes
- **Total: ~30-35 minutes**

## Support Resources

- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner Alternative](https://rtyley.github.io/bfg-repo-cleaner/)