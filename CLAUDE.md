# CLAUDE.md

Sole maintainer. No pull requests. Commit on a branch in a worktree, then fast-forward main and push it.

- Fast-forward only: from the main checkout, `git pull --ff-only`, then `git merge --ff-only <branch>` and
  `git push origin main`. If main has moved since the branch started, rebase the branch (or cherry-pick its commits)
  onto main first. Never force-push, and never rewrite main.
- Then delete the branch, locally and on origin, and remove its worktree.
- Pull requests are not used; do not open one.
- Releases stay as the README describes (`## Deploy`): built from a clean, committed main, previewed on a channel,
  checked with `scripts/check-live.sh`, then cloned to live.
