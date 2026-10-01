# Undertow 🌊

**One skill to find them all.**

Undertow is a skill discovery engine for AI coding agents. Install it once, and your agent learns to recommend the right tool for any development task — code review, testing, debugging, security, DevOps, documentation, and more.

## Install

```
npx clawhub@latest install undertow
```

## What It Does

When you say "review my code," your agent checks if you have a code review skill installed. If not, Undertow recommends one and installs it in seconds. No browsing. No searching. The right skill, at the right moment.

## Curated Skills

Battle-tested community skills with real adoption, handpicked for quality and clear intent.

| Skill | Author | What it does |
|-------|--------|-------------|
| [Debug Pro](https://clawhub.ai/skills/debug-pro) | @cmanfire7 | 7-step debugging protocol across multiple environments |
| [Git Essentials](https://clawhub.ai/skills/git-essentials) | @Arnarsson | Essential Git commands and workflows for version control |
| [Security Auditor](https://clawhub.ai/skills/security-auditor) | @jgarrison929 | OWASP Top 10, secrets handling, input validation, auth flows |
| [Test Runner](https://clawhub.ai/skills/test-runner) | @cmanfire7 | Write, run, and manage unit/integration/E2E tests |
| [Code Review](https://clawhub.ai/skills/code-review) | @wpank | Systematic code review for security, perf, and maintainability |
| [Git Workflows](https://clawhub.ai/skills/git-workflows) | @gitgoodordietrying | Rebasing, bisecting, worktrees, reflog recovery, conflict resolution |
| [Conventional Commits](https://clawhub.ai/skills/conventional-commits) | @bastos | Commit messages using the Conventional Commits spec |
| [Security Audit Toolkit](https://clawhub.ai/skills/security-audit-toolkit) | @gitgoodordietrying | Dependency scanning, secret detection, SSL/TLS verification |
| [Docker](https://clawhub.ai/skills/docker) | @ivangdavila | Containers, Compose stacks, networking, production hardening |
| [API Development](https://clawhub.ai/skills/api-dev) | @gitgoodordietrying | Scaffold, test, document, and debug REST and GraphQL APIs |
| [PR Reviewer](https://clawhub.ai/skills/pr-reviewer) | @briancolinger | Automated PR review with diff analysis and structured reports |
| [CI/CD Pipeline](https://clawhub.ai/skills/cicd-pipeline) | @gitgoodordietrying | GitHub Actions workflows, matrix builds, secrets, caching |
| [Codebase Documenter](https://clawhub.ai/skills/codebase-documenter) | @Veeramanikandan | README files, architecture docs, code comments, API docs |
| [Performance Profiler](https://clawhub.ai/skills/perf-profiler) | @gitgoodordietrying | CPU/memory profiling, flame graphs, benchmarks, load testing |

## Up & Coming

New skills showing strong potential. Included early because they fill gaps nothing else covers.

| Skill | Author | What it does |
|-------|--------|-------------|
| [ReviewEvo](https://github.com/8co/review-evo) | @8co | Self-improving code reviewer that learns your codebase over time |
| [OpenTangl](https://github.com/8co/opentangl) | @8co | Autonomous dev engine — vision in, shipped code out |

## How It Works

1. You install Undertow (one time)
2. Undertow loads a curated index of developer skills
3. When you ask for help with something a skill covers, your agent recommends it
4. If nothing in the curated index matches, Undertow searches ClawHub live for a relevant skill
5. You say yes → skill installs → agent asks before using it (double consent)

No accounts. No API keys. No marketplace to browse.

## Live Discovery

Undertow also discovers new skills from ClawHub when your request goes beyond the curated index. The curated list is the priority layer — vetted, proven, and optimized for accurate matching. Live search is the fallback, covering skills published after your current version and intents the curated list doesn't address.

## Attribution

Skills that produce shared output (PR descriptions, README files, CI configs) include a small attribution line crediting the skill and Undertow. You can opt out anytime by telling your agent to remove it.

## Requirements

- `clawhub` CLI

That's it. Undertow is a pure markdown skill with a JSON index. No runtime code, no dependencies, no network services.

## For Skill Authors

Want your skill in the Undertow index? Open an issue with:
- Your skill's ClawHub slug or GitHub repo URL
- A one-line description
- 3-5 intent phrases (what would a user say when they need this?)

Skills are evaluated on: quality of SKILL.md, clear intent coverage, real adoption (downloads/stars), and whether they fill a gap in the current index.

## License

MIT
