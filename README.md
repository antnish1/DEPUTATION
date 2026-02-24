# DEPUTATION

## Connect this local repo to GitHub (one-time setup)

If `git remote -v` shows nothing, run these commands from a terminal inside this project folder:

```bash
git remote add origin https://github.com/antnish1/DEPUTATION.git
git branch -M main
git remote -v
```

If `origin` already exists and is wrong, update it:

```bash
git remote set-url origin https://github.com/antnish1/DEPUTATION.git
git remote -v
```

## Authenticate so push works

Use one of these methods:

- GitHub CLI: `gh auth login`
- HTTPS with Personal Access Token (PAT)
- SSH key (set remote to `git@github.com:antnish1/DEPUTATION.git`)

## Push changes to make GitHub Pages update

```bash
git add .
git commit -m "Your change message"
git push -u origin main
```

After push, wait for GitHub Pages deployment, then hard refresh the site.
