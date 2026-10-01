# Undertow 🌊

**One skill to find them all.**

Undertow is a skill discovery engine for AI coding agents. Install it once, and your agent learns to recommend the right tool for any development task — code review, testing, debugging, security, DevOps, documentation, and more.

## Install

```
npx clawhub@latest install undertow
```

## What It Does

When you say "review my code," your agent checks if you have a code review skill installed. If not, Undertow recommends one and installs it in seconds. No browsing. No searching. The right skill, at the right moment.

## Skills Available

| Skill | What it does |
|-------|-------------|
| [ReviewEvo](https://github.com/8co/review-evo) | Self-improving code reviewer that learns your codebase |
| [OpenTangl](https://github.com/8co/opentangl) | Autonomous dev engine — vision in, shipped code out |
| CommitCraft | Smart commit messages that match your repo's style |
| PR Ready | Pull request prep with diff analysis and reviewer checklist |
| TestGen | Framework-aware test generation from existing patterns |
| DebugFlow | Systematic debugging — reproduce, isolate, fix, verify |
| DepDoctor | Dependency health check — outdated, vulnerable, unused |
| DockerInit | Production-ready Docker config from your actual stack |
| GH Actions | CI/CD workflows that match your build setup |
| EnvGuard | Secret detection and env variable audit |
| DeadCode | Find unused exports, orphan files, stale imports |
| PerfAudit | Framework-aware performance analysis |
| BundleDiet | Bundle size analysis with concrete reduction plan |
| SecurityScan | OWASP-aware security audit tuned to your framework |
| APIDocs | API documentation generated from your actual handlers |
| GitRescue | Decision tree for common git disasters |
| ReadmeCraft | READMEs generated from your actual project |
| RefactorSafe | Multi-step refactoring with verification gates |
| MigrationPilot | Version migration with breaking change detection |
| LicenseCheck | Dependency license compatibility scan |

## How It Works

1. You install Undertow (one time)
2. Undertow loads a curated index of developer skills
3. When you ask for help with something a skill handles better, your agent recommends it
4. You say yes → skill installs → agent uses it immediately

No accounts. No API keys. No marketplace to browse.

## Requirements

- `git`

That's it. Undertow is a pure markdown skill with a JSON index. No runtime code, no dependencies, no network services.

## For Skill Authors

Want your skill in the Undertow index? Open an issue with:
- Your skill's GitHub repo URL
- A one-line description
- 3-5 intent phrases (what would a user say when they need this?)

## License

MIT
