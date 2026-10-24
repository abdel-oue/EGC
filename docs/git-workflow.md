# Git workflow: branch, commit, push, pull request

[← Back to the manual](../README.md)

Repository: https://github.com/abdel-oue/EGC

**Rule:** never commit directly to `main`. Every change goes through a feature branch and a pull request.

## 1. Start from an up-to-date `main`

```powershell
git checkout main
git pull
```

## 2. Create a branch

```powershell
git checkout -b feat/short-description
```

| Prefix      | Use for                         |
| ----------- | ------------------------------- |
| `feat/`     | New feature or page             |
| `fix/`      | Bug fix                         |
| `docs/`     | Documentation only              |
| `chore/`    | Tooling, dependencies, config   |
| `refactor/` | Code change without new behavior |

## 3. Work, then check

```powershell
npm run lint
npm test
npm run build
```

For user-visible changes, add a line to [CHANGELOG.md](../CHANGELOG.md) under `[Unreleased]`. If you add or remove a public route, update the sitemap.

## 4. Commit (Conventional Commits)

```powershell
git status
git add <files>
git commit -m "feat: add tournament bracket page"
```

Format: `type: short summary in lowercase`. Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.

Check `git status` before `git add .`, so env files or build output never get committed (they are git-ignored, but check anyway).

## 5. Push the branch

First push of a new branch:

```powershell
git push -u origin feat/short-description
```

Later pushes on the same branch: `git push`.

## 6. Open a pull request

With the GitHub CLI:

```powershell
gh pr create --base main --fill
```

Or open https://github.com/abdel-oue/EGC/pulls and click **Compare & pull request**.

## 7. Merge and clean up

After review, merge on GitHub (squash merge keeps `main` tidy), then:

```powershell
git checkout main
git pull
git branch -d feat/short-description
```

## 8. Deploy

Deploy from an up-to-date `main` only. See [Deploying to Cloudflare Workers](deploy-cloudflare.md).

## Common fixes

| Problem                                  | Fix                                                        |
| ---------------------------------------- | ---------------------------------------------------------- |
| Committed on `main` by mistake (not pushed) | `git branch feat/x` then `git reset --hard origin/main` then `git checkout feat/x` |
| `main` moved while you worked            | `git checkout main; git pull; git checkout feat/x; git merge main` |
| Push rejected (remote has new commits)   | `git pull` then `git push`                                 |
| Undo the last commit, keep the changes   | `git reset --soft HEAD~1`                                  |
