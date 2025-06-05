# Potpie GitHub Setup Guide

## Important: Potpie Analyzes GitHub Repos, Not Local Code

The Potpie API requires your code to be on GitHub. It cannot analyze local folders directly.

## Steps to Use Potpie

### 1. Push Your Code to GitHub

```bash
# If you haven't created a GitHub repo yet:
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pilotta-game.git
git branch -M main
git push -u origin main
```

### 2. Update the Repository Name

Edit `/src/analysis/quick-insights.ts` line 12:
```typescript
const REPO_NAME = 'YOUR_GITHUB_USERNAME/pilotta-game';
```

For example:
```typescript
const REPO_NAME = 'johndoe/pilotta-game';
```

### 3. Make Sure Your Repo is Public

Potpie needs to access your repository. Either:
- Make your repository public on GitHub, OR
- If using a private repo, ensure Potpie has access (check their documentation)

### 4. Run the Analysis

```bash
npm run dev
```

Then in browser console:
```javascript
await potpieInsights.quick()
```

## What Gets Analyzed

Potpie will analyze:
- The code in your **GitHub repository**
- The specific branch you specify (default: 'main')
- All files not in .gitignore

## Important Notes

1. **Local Changes**: Any changes you haven't pushed to GitHub won't be analyzed
2. **Branch Selection**: Make sure you're analyzing the right branch
3. **Parse Time**: First-time parsing can take a few minutes
4. **Caching**: Potpie caches parsed projects, so subsequent queries are faster

## Alternative for Local Development

If you need to analyze local changes frequently:

1. **Use a development branch**:
   ```bash
   git checkout -b dev-analysis
   git add .
   git commit -m "WIP: Analysis checkpoint"
   git push origin dev-analysis
   ```

2. **Update the branch in analysis**:
   ```typescript
   const { project_id } = await potpie.parseRepository(REPO_NAME, 'dev-analysis');
   ```

3. **Clean up when done**:
   ```bash
   git checkout main
   git branch -d dev-analysis
   git push origin --delete dev-analysis
   ```

## Quick Check

To verify your setup:
```javascript
// In browser console after npm run dev
const testRepo = 'your-username/pilotta-game';
console.log(`Testing with repo: ${testRepo}`);
// If this matches your GitHub repo, you're ready!