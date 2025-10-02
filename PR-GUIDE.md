# Complete Pull Request & CodeRabbit Workflow Guide

> A comprehensive guide for creating, managing, and merging Pull Requests with CodeRabbit AI code review integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Pull Request](#creating-a-pull-request)
3. [Understanding CodeRabbit](#understanding-coderabbit)
4. [Checking PR Status](#checking-pr-status)
5. [Addressing CodeRabbit Feedback](#addressing-coderabbit-feedback)
6. [Vercel Deployment Checks](#vercel-deployment-checks)
7. [Merging Pull Requests](#merging-pull-requests)
8. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
9. [GitHub CLI Commands Reference](#github-cli-commands-reference)
10. [CodeRabbit Commands Reference](#coderabbit-commands-reference)

---

## Prerequisites

### Required Tools

```bash
# Install GitHub CLI
brew install gh

# Verify installation
gh --version

# Authenticate with GitHub
gh auth login
```

### Repository Setup

- Ensure you have write access to the repository
- CodeRabbit must be installed on the repository (GitHub App)
- Vercel integration (if using automated deployments)

---

## Creating a Pull Request

### Method 1: Using GitHub CLI (Recommended)

```bash
# 1. Ensure you're on the feature branch
git checkout your-feature-branch

# 2. Stage and commit your changes
git add -A
git commit -m "Your descriptive commit message"

# 3. Push to remote
git push origin your-feature-branch

# 4. Create PR using gh CLI
gh pr create --title "Your PR Title" --body "$(cat <<'EOF'
## Summary
- Bullet point summary of changes

## Changes
- Detailed list of changes

## Test plan
- [ ] Test item 1
- [ ] Test item 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Method 2: After Pushing to Branch

```bash
# 1. Push your branch
git push origin your-feature-branch

# 2. Create PR from pushed branch
gh pr create --title "PR Title" --body "PR description"

# The CLI will return the PR URL and number
# Example output: https://github.com/user/repo/pull/3
```

### Method 3: From GitHub Web Interface

1. Push your branch: `git push origin your-feature-branch`
2. Visit your repository on GitHub
3. Click "Compare & pull request" button
4. Fill in title and description
5. Click "Create pull request"

---

## Understanding CodeRabbit

### How CodeRabbit Works

**CodeRabbit** is an AI-powered code reviewer that automatically reviews every pull request:

1. **Automatic Trigger**: Reviews are triggered when:
   - A new PR is created
   - New commits are pushed to an existing PR
   - You manually request a review with `@coderabbitai review`

2. **Review Timeline**:
   - Initial scan: ~30-60 seconds after PR creation/commit
   - Full review: 1-3 minutes depending on PR size
   - Re-reviews happen automatically on new commits

3. **Review Types**:
   - **Actionable comments**: Critical issues that must be fixed
   - **Nitpick comments**: Optional improvements for code quality
   - **Duplicate comments**: Previously mentioned issues still present

4. **Review States**:
   - `COMMENTED`: CodeRabbit provided feedback
   - `SUCCESS`: Review completed (check passes)
   - `REVIEW_REQUIRED`: Waiting for human approval

### CodeRabbit Response Format

CodeRabbit posts reviews with:
- **Actionable comments posted**: Number (e.g., "Actionable comments posted: 3")
- **Line-by-line comments**: Specific code suggestions with file:line references
- **Summary**: Overview of all changes reviewed
- **Pre-merge checks**: Optional checks like docstring coverage

---

## Checking PR Status

### Basic PR Information

```bash
# View PR summary
gh pr view <PR_NUMBER>

# View PR in browser
gh pr view <PR_NUMBER> --web

# Example output:
# title:	Merge room page design updates
# state:	OPEN
# author:	username
# reviewers:	coderabbitai (Commented)
# url:	https://github.com/user/repo/pull/3
```

### Check All Build/Review Status

```bash
# Check all PR checks (CodeRabbit, Vercel, CI/CD)
gh pr checks <PR_NUMBER>

# Example output:
# CodeRabbit	pass	0		Review completed
# Vercel	pass	0	https://vercel.com/...	Deployment has completed
# Vercel Preview Comments	pass	0	https://vercel.com/github
```

### Check Review Decision

```bash
# Get detailed review status
gh pr view <PR_NUMBER> --json reviewDecision,state,mergeable,statusCheckRollup

# Example output:
# {
#   "mergeable": "MERGEABLE",
#   "reviewDecision": "REVIEW_REQUIRED",
#   "state": "OPEN",
#   "statusCheckRollup": [...]
# }
```

### Check CodeRabbit Reviews

```bash
# Get all reviews with details
gh pr view <PR_NUMBER> --json reviews --jq '.reviews | map({author: .author.login, state: .state, commit: .commit.oid[:7], time: .submittedAt})'

# Get latest review
gh pr view <PR_NUMBER> --json reviews --jq '.reviews[-1] | {author: .author.login, state: .state, commit: .commit.oid[:7]}'

# Check for actionable comments count
gh api repos/OWNER/REPO/pulls/<PR_NUMBER>/reviews --jq '.[] | select(.commit_id | startswith("COMMIT_SHA")) | .body' | grep "Actionable comments posted"
```

### Check Latest Commits

```bash
# View recent commits on the PR
gh pr view <PR_NUMBER> --json commits --jq '.commits[-3:] | .[] | {sha: .oid[:7], message: .messageHeadline, author: .authors[0].name, date: .committedDate}'

# Example output:
# {"author":"username","date":"2025-10-02T07:15:13Z","message":"Fix CodeRabbit issues","sha":"6444b2c"}
```

### View PR Comments

```bash
# View all PR comments
gh pr view <PR_NUMBER> --comments

# View last N comments
gh pr view <PR_NUMBER> --json comments --jq '.comments[-5:]'

# Filter CodeRabbit comments only
gh pr view <PR_NUMBER> --json comments --jq '.comments[] | select(.author.login == "coderabbitai")'
```

---

## Addressing CodeRabbit Feedback

### Step-by-Step Workflow

#### 1. Wait for Initial Review

```bash
# After pushing commits, wait for CodeRabbit to review
sleep 90  # Wait 90 seconds for review to complete

# Check if review is posted
gh pr checks <PR_NUMBER>
```

**Important Timing Notes**:
- Initial review after PR creation: **60-120 seconds**
- Review after new commits: **60-90 seconds**
- Manual review request response: **30-60 seconds** (acknowledgment), then 60-90s for full review

#### 2. Check Review Feedback

```bash
# View the PR to see CodeRabbit's comments
gh pr view <PR_NUMBER> --comments | less

# Or view in browser for better formatting
gh pr view <PR_NUMBER> --web
```

#### 3. Identify Issues to Fix

CodeRabbit feedback typically includes:

**Actionable Comments** (Must Fix):
```
**Actionable comments posted: 3**
```

**Example Issues**:
- Hook violations (e.g., "useRouter() called inside cell renderer")
- Type errors (e.g., "Type 'string' is not assignable to type Permission")
- Missing async/await
- Stale state in forms

**Nitpick Comments** (Optional but Recommended):
- Code style improvements
- Better type safety
- Performance optimizations

#### 4. Fix the Issues

```bash
# Edit files to address feedback
# (Use your code editor or Edit tool)

# Example: Fix a hook violation
# Before: Calling useRouter() inside cell renderer
# After: Extract to separate component where hooks can be called

# Stage changes
git add -A

# Commit with descriptive message referencing the fixes
git commit -m "Fix CodeRabbit review issues

- Fixed React Hooks violations by extracting components
- Improved TypeScript type safety
- Added proper async/await error handling

Addresses CodeRabbit feedback from PR #<NUMBER>"
```

#### 5. Push Fixes to Same Branch

```bash
# Push to the SAME branch (not a new PR)
git push origin your-feature-branch

# CodeRabbit will automatically detect new commits and re-review
```

**⚠️ IMPORTANT**: Always push to the **same branch/PR**. Do NOT create a new PR.

#### 6. Request Re-Review (Optional)

```bash
# Manually trigger CodeRabbit review (optional, auto-review usually happens)
gh pr comment <PR_NUMBER> --body "@coderabbitai review"

# Wait for acknowledgment (30 seconds)
sleep 30

# Check for response
gh pr view <PR_NUMBER> --json comments --jq '.comments[-1] | {author: .author.login, body: .body[:100]}'
```

#### 7. Wait for Re-Review

```bash
# Wait for CodeRabbit to complete review
sleep 90

# Check review status
gh pr checks <PR_NUMBER>

# Verify actionable comments count
gh api repos/OWNER/REPO/pulls/<PR_NUMBER>/reviews --jq '.[-1].body' | grep "Actionable comments posted"
```

#### 8. Iterate Until Approved

Repeat steps 2-7 until you see:
```
Actionable comments posted: 0
```

This means CodeRabbit has no more critical issues!

### Checking if All Issues are Resolved

```bash
# Method 1: Check PR checks
gh pr checks <PR_NUMBER>
# Look for: CodeRabbit	pass	0		Review completed

# Method 2: Check latest review body
gh api repos/OWNER/REPO/pulls/<PR_NUMBER>/reviews --jq '.[-1].body' | grep "Actionable comments posted"
# Should show: Actionable comments posted: 0

# Method 3: Check review decision
gh pr view <PR_NUMBER> --json reviewDecision
# Note: May still show "REVIEW_REQUIRED" if human approval needed
```

---

## Vercel Deployment Checks

### Understanding Vercel Integration

Vercel automatically deploys every commit to preview environments:

1. **Deployment Trigger**: Happens on every push
2. **Deployment Time**: 2-5 minutes depending on build complexity
3. **Deployment States**:
   - `pending`: Build in progress
   - `success`: Build and deployment successful
   - `failure`: Build failed (check logs)

### Check Vercel Status

```bash
# Check all PR checks including Vercel
gh pr checks <PR_NUMBER>

# Example output:
# Vercel	pass	0	https://vercel.com/...	Deployment has completed
# Vercel Preview Comments	pass	0	https://vercel.com/github
```

### Check Specific Vercel Deployment

```bash
# Get Vercel deployment URL and status
gh api repos/OWNER/REPO/commits/COMMIT_SHA/statuses --jq '.[] | select(.context | contains("Vercel")) | {context: .context, state: .state, description: .description, url: .target_url}'

# Example output:
# {
#   "context": "Vercel",
#   "state": "success",
#   "description": "Deployment has completed",
#   "url": "https://vercel.com/..."
# }
```

### Wait for Vercel Deployment

```bash
# After pushing changes, wait for Vercel
sleep 30  # Initial check

gh pr checks <PR_NUMBER>
# If still pending, wait longer
sleep 90

gh pr checks <PR_NUMBER>
# Should now show success or failure
```

### Handling Vercel Failures

If Vercel shows `failure`:

```bash
# 1. Get the Vercel deployment URL
gh pr checks <PR_NUMBER>
# Copy the Vercel URL from output

# 2. Open in browser to see build logs
# Click the URL or run:
gh api repos/OWNER/REPO/commits/COMMIT_SHA/statuses --jq '.[] | select(.context == "Vercel") | .target_url' | xargs open

# 3. Common Vercel failures:
# - TypeScript errors (fix type issues)
# - Missing environment variables (set in Vercel dashboard)
# - Build command failures (check package.json scripts)
# - Dependency installation errors (check package.json)
```

**Example Vercel Error (TypeScript)**:
```
Failed to compile.
Type error: Type 'any' is not assignable to type 'Table<Data>'
```

**Fix**: Update types and push again
```bash
# Fix the type error in code
git add -A
git commit -m "Fix TypeScript type error in component"
git push origin your-feature-branch

# Wait for new Vercel deployment
sleep 120
gh pr checks <PR_NUMBER>
```

---

## Merging Pull Requests

### Pre-Merge Checklist

Before merging, ensure:

```bash
# 1. All checks pass
gh pr checks <PR_NUMBER>
# All should show: pass

# 2. CodeRabbit approved (0 actionable comments)
gh api repos/OWNER/REPO/pulls/<PR_NUMBER>/reviews --jq '.[-1].body' | grep "Actionable comments posted: 0"

# 3. PR is mergeable
gh pr view <PR_NUMBER> --json mergeable
# Should show: "MERGEABLE"

# 4. No merge conflicts
gh pr view <PR_NUMBER> --json mergeStateStatus
# Should NOT show: "BLOCKED" due to conflicts
```

### Merge Methods

#### Method 1: Using GitHub CLI (Recommended)

```bash
# Squash merge (combines all commits into one)
gh pr merge <PR_NUMBER> --squash --delete-branch

# Regular merge (preserves all commits)
gh pr merge <PR_NUMBER> --merge --delete-branch

# Rebase merge (reapplies commits on top of base branch)
gh pr merge <PR_NUMBER> --rebase --delete-branch

# With custom commit message
gh pr merge <PR_NUMBER> --squash --delete-branch \
  --subject "feat: Add new feature" \
  --body "Detailed description of changes"
```

#### Method 2: Auto-Merge

```bash
# Enable auto-merge (merges when all checks pass)
gh pr merge <PR_NUMBER> --auto --squash --delete-branch

# PR will merge automatically when:
# 1. All required checks pass
# 2. Required approvals received
# 3. No conflicts exist
```

#### Method 3: Admin Override

If you have admin permissions and need to bypass branch protection:

```bash
# Merge with admin privileges
gh pr merge <PR_NUMBER> --merge --admin --delete-branch

# Note: This bypasses required reviews and checks
# Use only when necessary and you're confident in the changes
```

### Handling Merge Restrictions

**Error**: `Pull request is not mergeable: the base branch policy prohibits the merge`

**Reason**: Branch protection rules require:
- Approving reviews from team members
- Status checks to pass
- No merge conflicts

**Solutions**:

1. **Get Required Approvals**:
```bash
# Ask team member with write access to approve
# They should run:
gh pr review <PR_NUMBER> --approve --body "LGTM! All checks passing."
```

2. **Check Branch Protection Rules**:
```bash
# View repository settings
gh api repos/OWNER/REPO/branches/main/protection

# Or visit in browser:
# https://github.com/OWNER/REPO/settings/rules
```

3. **Temporarily Disable Protection** (Admin only):
   - Go to repository settings → Rules
   - Edit or disable the branch protection rule
   - Merge the PR
   - Re-enable the protection rule

### Post-Merge Actions

```bash
# 1. Verify merge was successful
gh pr view <PR_NUMBER>
# Should show: state: MERGED

# 2. Update local repository
git checkout main
git pull origin main

# 3. Delete local feature branch (if not auto-deleted)
git branch -d your-feature-branch

# 4. Verify deployment (if applicable)
# Check production deployment status on Vercel dashboard
```

---

## Common Issues & Troubleshooting

### Issue 1: CodeRabbit Not Reviewing

**Symptoms**:
- No review appears after 5+ minutes
- CodeRabbit status shows pending indefinitely

**Solutions**:

```bash
# 1. Manually trigger review
gh pr comment <PR_NUMBER> --body "@coderabbitai review"

# 2. Wait for acknowledgment
sleep 30

# 3. Check if CodeRabbit bot has access
gh api repos/OWNER/REPO/installation
# Should show CodeRabbit in installed apps

# 4. Check PR size (CodeRabbit may skip very large PRs)
gh pr view <PR_NUMBER> --json additions,deletions
# If >10,000 lines changed, may need to split PR
```

### Issue 2: Stale CodeRabbit Review

**Symptoms**:
- CodeRabbit shows review for old commit
- New commits not reviewed

**Solutions**:

```bash
# 1. Check latest reviewed commit
gh pr view <PR_NUMBER> --json reviews --jq '.reviews[-1] | {commit: .commit.oid[:7]}'

# 2. Check latest commit on PR
gh pr view <PR_NUMBER> --json commits --jq '.commits[-1].oid[:7]'

# 3. If mismatch, trigger manual review
gh pr comment <PR_NUMBER> --body "@coderabbitai review"

# 4. Wait for new review
sleep 90
gh pr checks <PR_NUMBER>
```

### Issue 3: Vercel Build Failing

**Common Causes & Fixes**:

**TypeScript Errors**:
```bash
# View error details
gh pr checks <PR_NUMBER>
# Click Vercel URL to see full error

# Common fix: Type mismatches
# Example: Change `any` to proper type
# Before: table: any
# After: table: Table<DataType>
```

**Missing Dependencies**:
```bash
# Ensure all dependencies installed
pnpm install

# Commit package lock file
git add pnpm-lock.yaml
git commit -m "Update dependencies"
git push origin your-feature-branch
```

**Environment Variables**:
- Check Vercel dashboard → Project Settings → Environment Variables
- Ensure all required env vars are set
- Redeploy after adding variables

### Issue 4: Merge Conflicts

**Symptoms**:
```bash
gh pr view <PR_NUMBER> --json mergeStateStatus
# Shows: "CONFLICTING"
```

**Solutions**:

```bash
# 1. Update your branch with latest main
git checkout your-feature-branch
git fetch origin main
git merge origin/main

# 2. Resolve conflicts in your editor
# (Look for <<<<<<, =======, >>>>>> markers)

# 3. Stage resolved files
git add -A

# 4. Complete the merge
git commit -m "Resolve merge conflicts with main"

# 5. Push resolution
git push origin your-feature-branch

# 6. Verify conflict resolved
sleep 30
gh pr view <PR_NUMBER> --json mergeStateStatus
# Should show: "CLEAN" or "MERGEABLE"
```

### Issue 5: "Can't Approve Your Own PR"

**Symptoms**:
```bash
gh pr review <PR_NUMBER> --approve
# Error: Can not approve your own pull request
```

**Solutions**:

1. **Get Team Approval** (Recommended):
   - Ask a teammate with write access to approve
   - They run: `gh pr review <PR_NUMBER> --approve`

2. **Use Admin Override** (If you're admin):
   ```bash
   gh pr merge <PR_NUMBER> --admin --merge --delete-branch
   ```

3. **Adjust Repository Settings** (Admin only):
   - Go to Settings → Rules
   - Modify "Require approvals" setting
   - Allow PR creators to approve their own PRs (not recommended for production)

### Issue 6: "GraphQL Error" When Merging

**Error Examples**:
- `Squash merges are not allowed on this repository`
- `Repository rule violations found`

**Solutions**:

```bash
# 1. Check allowed merge methods
gh api repos/OWNER/REPO | jq '{
  allow_squash_merge: .allow_squash_merge,
  allow_merge_commit: .allow_merge_commit,
  allow_rebase_merge: .allow_rebase_merge
}'

# 2. Use allowed method
# If squash not allowed, try regular merge:
gh pr merge <PR_NUMBER> --merge --delete-branch

# If merge not allowed, try rebase:
gh pr merge <PR_NUMBER> --rebase --delete-branch

# 3. If all blocked, check branch protection rules
# Visit: https://github.com/OWNER/REPO/settings/rules
```

---

## GitHub CLI Commands Reference

### Quick Command Cheat Sheet

```bash
# Create PR
gh pr create --title "Title" --body "Description"

# View PR
gh pr view <PR_NUMBER>
gh pr view <PR_NUMBER> --web
gh pr view <PR_NUMBER> --json FIELD1,FIELD2

# Check PR status
gh pr checks <PR_NUMBER>
gh pr status

# View PR comments
gh pr view <PR_NUMBER> --comments

# Add comment to PR
gh pr comment <PR_NUMBER> --body "Comment text"

# Review PR
gh pr review <PR_NUMBER> --approve
gh pr review <PR_NUMBER> --comment --body "Feedback"
gh pr review <PR_NUMBER> --request-changes --body "Changes needed"

# Merge PR
gh pr merge <PR_NUMBER> --squash --delete-branch
gh pr merge <PR_NUMBER> --merge --delete-branch
gh pr merge <PR_NUMBER> --rebase --delete-branch
gh pr merge <PR_NUMBER> --auto --squash

# Close PR
gh pr close <PR_NUMBER>

# Reopen PR
gh pr reopen <PR_NUMBER>

# List PRs
gh pr list
gh pr list --state open
gh pr list --author USERNAME
```

### Useful JSON Field Queries

```bash
# Available fields for --json flag:
# additions, assignees, author, autoMergeRequest, baseRefName, baseRefOid,
# body, changedFiles, closed, closedAt, closingIssuesReferences, comments,
# commits, createdAt, deletions, files, headRefName, headRefOid, id,
# isCrossRepository, isDraft, labels, latestReviews, maintainerCanModify,
# mergeCommit, mergeStateStatus, mergeable, mergedAt, mergedBy, milestone,
# number, potentialMergeCommit, projectCards, projectItems, reactionGroups,
# reviewDecision, reviewRequests, reviews, state, statusCheckRollup, title,
# updatedAt, url

# Example queries:
gh pr view <PR_NUMBER> --json reviews,reviewDecision,mergeable
gh pr view <PR_NUMBER> --json commits --jq '.commits[-3:]'
gh pr view <PR_NUMBER> --json statusCheckRollup --jq '.statusCheckRollup[] | select(.context == "Vercel")'
```

---

## CodeRabbit Commands Reference

### Available Commands

Use these commands by commenting on the PR:

```bash
# Request full review
@coderabbitai review

# Request full comprehensive review
@coderabbitai full review

# Pause automatic reviews
@coderabbitai pause

# Resume automatic reviews
@coderabbitai resume

# Ignore this PR (no automatic reviews)
@coderabbitai ignore

# Resolve all comments
@coderabbitai resolve

# Update PR summary
@coderabbitai summary

# Generate sequence diagram
@coderabbitai generate sequence diagram

# Show configuration
@coderabbitai configuration

# Show help
@coderabbitai help
```

### Using Commands

```bash
# Via GitHub CLI
gh pr comment <PR_NUMBER> --body "@coderabbitai review"

# Via GitHub Web Interface
# 1. Open PR: https://github.com/OWNER/REPO/pull/NUMBER
# 2. Scroll to comment box
# 3. Type: @coderabbitai review
# 4. Click "Comment"
```

### CodeRabbit Review Lifecycle

1. **PR Created/Updated** → CodeRabbit auto-reviews (60-120s)
2. **Review Posted** → Check for "Actionable comments posted: X"
3. **Fix Issues** → Commit and push to same branch
4. **CodeRabbit Auto Re-reviews** → New commits trigger new review (60-90s)
5. **Manual Review** → Use `@coderabbitai review` if needed
6. **Iterate** → Repeat until "Actionable comments posted: 0"
7. **Approved** → Ready to merge

---

## Best Practices

### 1. Always Push to Same Branch

❌ **Wrong**:
```bash
# Don't create new PR for each fix
git checkout -b fix-attempt-2
git push origin fix-attempt-2
gh pr create --title "Second attempt"
```

✅ **Correct**:
```bash
# Push fixes to same branch
git checkout your-feature-branch
git add -A
git commit -m "Address CodeRabbit feedback"
git push origin your-feature-branch
# CodeRabbit automatically re-reviews
```

### 2. Wait for Reviews to Complete

```bash
# After pushing, don't immediately check
# Wait for processing time

git push origin your-feature-branch

# Wait for CodeRabbit (90 seconds)
sleep 90

# Then check status
gh pr checks <PR_NUMBER>

# For Vercel (120 seconds)
sleep 120
gh pr checks <PR_NUMBER>
```

### 3. Descriptive Commit Messages

❌ **Poor**:
```bash
git commit -m "fixes"
git commit -m "update"
```

✅ **Good**:
```bash
git commit -m "Fix React Hooks violations in table columns

- Moved useAuthContext out of cell renderers
- Passed hasPermission through table meta
- Addresses CodeRabbit feedback on PR #3"
```

### 4. Check Before Merging

```bash
# Always verify before merge:

# 1. All checks pass
gh pr checks <PR_NUMBER>

# 2. No actionable comments
gh api repos/OWNER/REPO/pulls/<PR_NUMBER>/reviews --jq '.[-1].body' | grep "Actionable comments posted: 0"

# 3. PR is mergeable
gh pr view <PR_NUMBER> --json mergeable,mergeStateStatus

# 4. Up to date with base branch
gh pr view <PR_NUMBER> --json baseRefName,headRefName
```

### 5. Clean Up After Merge

```bash
# After successful merge:

# 1. Switch to main
git checkout main

# 2. Pull latest
git pull origin main

# 3. Delete merged branch
git branch -d your-feature-branch

# 4. Prune remote branches
git remote prune origin
```

---

## Workflow Summary

### Complete End-to-End Workflow

```bash
# 1. CREATE FEATURE BRANCH
git checkout -b feature/new-feature
# ... make changes ...
git add -A
git commit -m "Implement new feature"
git push origin feature/new-feature

# 2. CREATE PULL REQUEST
gh pr create --title "Add new feature" --body "Description"
# Note the PR number (e.g., #42)

# 3. WAIT FOR CODERABBIT INITIAL REVIEW (90 seconds)
sleep 90
gh pr checks 42

# 4. CHECK REVIEW FEEDBACK
gh pr view 42 --comments
# Look for "Actionable comments posted: X"

# 5. ADDRESS FEEDBACK (if issues found)
# ... fix issues in code ...
git add -A
git commit -m "Address CodeRabbit feedback"
git push origin feature/new-feature

# 6. WAIT FOR RE-REVIEW (90 seconds)
sleep 90
gh pr checks 42

# 7. VERIFY ALL CHECKS PASS
gh pr checks 42
# Should show:
# CodeRabbit	pass
# Vercel	pass

# 8. VERIFY NO ACTIONABLE COMMENTS
gh api repos/OWNER/REPO/pulls/42/reviews --jq '.[-1].body' | grep "Actionable comments posted: 0"

# 9. GET APPROVAL (if required)
# Ask team member: "Please review PR #42"
# They run: gh pr review 42 --approve

# 10. MERGE
gh pr merge 42 --squash --delete-branch

# 11. CLEANUP
git checkout main
git pull origin main
git branch -d feature/new-feature
```

---

## Timing Guidelines

### Expected Wait Times

| Action | Expected Time | Command to Check |
|--------|--------------|------------------|
| CodeRabbit initial review | 60-120 seconds | `gh pr checks <PR>` |
| CodeRabbit re-review | 60-90 seconds | `gh pr checks <PR>` |
| CodeRabbit manual review response | 30-60 seconds | Check comments |
| Vercel deployment | 120-300 seconds | `gh pr checks <PR>` |
| GitHub checks update | 10-30 seconds | `gh pr view <PR>` |
| PR merge operation | 5-10 seconds | `gh pr view <PR>` |

### Sleep Commands for Automation

```bash
# After creating PR, wait for initial review
gh pr create ...
sleep 90
gh pr checks <PR_NUMBER>

# After pushing fixes, wait for re-review
git push origin branch
sleep 90
gh pr checks <PR_NUMBER>

# After manual review request
gh pr comment <PR_NUMBER> --body "@coderabbitai review"
sleep 30  # Wait for acknowledgment
sleep 90  # Wait for full review
gh pr checks <PR_NUMBER>

# After merge, wait for GitHub to update
gh pr merge <PR_NUMBER> ...
sleep 10
gh pr view <PR_NUMBER>  # Verify merged state
```

---

## Additional Resources

### Official Documentation

- **GitHub CLI**: https://cli.github.com/manual/
- **CodeRabbit**: https://docs.coderabbit.ai/
- **Vercel**: https://vercel.com/docs

### Useful Links

- GitHub CLI cheat sheet: https://github.com/cli/cli/blob/trunk/docs/command-line-reference.md
- CodeRabbit commands: https://docs.coderabbit.ai/guides/commands
- Pull Request best practices: https://github.com/blog/2019-02-14-introducing-draft-pull-requests

---

## Quick Troubleshooting Checklist

When things go wrong, run through this checklist:

```bash
# 1. Is PR created correctly?
gh pr view <PR_NUMBER>

# 2. Are all checks visible?
gh pr checks <PR_NUMBER>

# 3. Did CodeRabbit review?
gh pr view <PR_NUMBER> --json reviews --jq '.reviews[-1]'

# 4. Are there actionable comments?
gh api repos/OWNER/REPO/pulls/<PR_NUMBER>/reviews --jq '.[-1].body' | grep "Actionable"

# 5. Is Vercel deploying/deployed?
gh pr checks <PR_NUMBER> | grep Vercel

# 6. Are there merge conflicts?
gh pr view <PR_NUMBER> --json mergeStateStatus

# 7. Is PR mergeable?
gh pr view <PR_NUMBER> --json mergeable

# 8. What's blocking the merge?
gh pr view <PR_NUMBER> --json reviewDecision,statusCheckRollup

# 9. Can I merge with current permissions?
gh pr merge <PR_NUMBER> --help
```

---

## Summary

This guide covers the complete workflow for:
- ✅ Creating pull requests
- ✅ Working with CodeRabbit AI reviews
- ✅ Checking PR and deployment status
- ✅ Addressing feedback iteratively
- ✅ Handling common issues
- ✅ Successfully merging PRs

Remember: **Always push fixes to the same branch**, wait for automated reviews to complete, and verify all checks pass before merging.

For questions or issues not covered here, consult the official documentation or your team's contribution guidelines.
