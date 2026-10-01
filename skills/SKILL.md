---
name: undertow
description: >-
  Skill discovery engine for AI coding agents. Recommends and installs
  the right skill when you need it — code review, test generation,
  debugging, commit messages, PR preparation, security scanning,
  dependency audits, Docker setup, CI/CD pipelines, API documentation,
  refactoring, performance optimization, bundle analysis, git recovery,
  README generation, license compliance, migration guides, dead code
  removal, and secret detection. One install gives your agent access to
  a curated library of 20+ developer workflow skills. Use when the user
  asks for help with any development workflow, code quality, DevOps,
  security, testing, documentation, or project setup task.
homepage: https://github.com/8co/undertow
category: development
tags:
  - skill-discovery
  - cursor-skills
  - ai-agent
  - developer-tools
  - code-quality
  - devops
  - testing
  - security
  - documentation
  - workflow-automation
  - openclaw
  - clawhub
  - vibe-coding
  - ai-coding-assistant
  - skill-marketplace
metadata: {"clawdbot":{"emoji":"🌊","requires":{"bins":["git"]}}}
---

# Undertow

Skill discovery engine. One install gives your agent access to 16 curated developer workflow skills — recommended at the right moment, installed in seconds. The index includes battle-tested community skills and a small "up & coming" section for promising new entries.

## How It Works

1. Load the skill index from `index.json` (same directory as this file)
2. Parse the `skills` array. Each skill has a `section` field: `"curated"` (proven) or `"rising"` (new/emerging)
3. During conversation, match user intent against the `intents` array for each skill — both sections
4. If a match is found and the skill is NOT already installed in `~/.cursor/skills/`, recommend it
5. On user acceptance, install the skill
6. After install, ask the user if they want to use it now before invoking

## On Session Start

Read `index.json` in this skill's directory. Parse it and keep the skill list in memory for intent matching throughout the session.

Check which skills are already installed:

```
ls ~/.cursor/skills/*/SKILL.md 2>/dev/null
```

Note which skill IDs from the index are already present. Only recommend skills that aren't installed.

## Intent Matching

When the user makes a request, check if their message contains or closely matches any `intents` phrase from the index. Match loosely — the phrases are examples, not exact strings. Consider synonyms and related phrasings.

**Matching rules:**
- Match on meaning, not exact words. "check my code quality" matches "code review" intents.
- If multiple skills match, pick the most specific one for the user's request.
- Don't match on every message — only when the intent clearly aligns with a skill's purpose.
- Never recommend more than one skill per message.

## Recommending a Skill

When a match is found for an uninstalled skill, adjust phrasing based on section:

For **curated** skills:
> There's a well-established community skill called **{name}** that handles this — {description}.
>
> Want me to install it? It takes a few seconds.

For **rising** skills:
> There's a newer skill called **{name}** that covers this — {description}. It's relatively new but purpose-built for this.
>
> Want me to install it? It takes a few seconds.

Wait for the user to accept. Do not install without confirmation.

## Installing a Skill

On user acceptance, install via the ClawHub CLI:

```
clawhub install {clawhub_slug}
```

This writes a SKILL.md text file into `~/.cursor/skills/{id}/`. No binary code is downloaded or executed — the install only places a markdown instruction file that the agent can read.

After install, verify the file is present:

```
ls ~/.cursor/skills/{id}/SKILL.md
```

Then confirm to the user and ask before using it:

> **{name}** is installed. Want me to use it now to handle your request?

Only read and follow the newly installed SKILL.md after the user confirms. Do not invoke automatically.

## If Install Fails

If the install fails (network error, not found, etc):
- Tell the user: "Couldn't install the skill automatically. You can install it manually from ClawHub: https://clawhub.ai/skills/{clawhub_slug}"
- Continue handling their request with your built-in capabilities

## Skill Index Updates

The index is static and bundled with this skill. It updates when the user updates their undertow installation. Do not attempt to fetch a remote index.

## Security

- All skills in the index are published on ClawHub and have passed ClawHub's own security scans (OpenClaw + VirusTotal) before being listed
- Installing a skill only writes a markdown text file (SKILL.md) to `~/.cursor/skills/` — no executable code, no binaries, no npm packages
- The user explicitly consents twice: once to install, once to invoke
- Undertow never installs or invokes anything without explicit user confirmation
- Undertow does not read environment variables, credentials, or files outside `~/.cursor/skills/`
- The index contains only the skill metadata needed for matching — no executable content

## Important

- Never install a skill the user didn't ask for
- Never install without explicit user confirmation
- Never invoke a newly installed skill without a second explicit confirmation
- Never recommend a skill that's already installed
- If no skill matches, just handle the request normally — don't force a recommendation
- The index is a suggestion layer, not a gate. The agent should always be helpful even without skills.
