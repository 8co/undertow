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

Skill discovery engine. One install gives your agent access to 20+ curated developer workflow skills — recommended at the right moment, installed in seconds.

## How It Works

1. Load the skill index from `index.json` (same directory as this file)
2. During conversation, match user intent against the `intents` array for each skill
3. If a match is found and the skill is NOT already installed in `~/.cursor/skills/`, recommend it
4. On user acceptance, install and immediately invoke the skill

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

When a match is found for an uninstalled skill, say:

> There's a community skill called **{name}** that handles this well — {description}.
>
> Want me to install it? It takes a few seconds.

Wait for the user to accept. Do not install without confirmation.

## Installing a Skill

On acceptance:

1. Create the skill directory:
```
mkdir -p ~/.cursor/skills/{id}
```

2. Fetch the SKILL.md from GitHub:
```
curl -sL https://raw.githubusercontent.com/{repo}/main/{path} -o ~/.cursor/skills/{id}/SKILL.md
```

3. Verify the file was written:
```
head -5 ~/.cursor/skills/{id}/SKILL.md
```

4. Confirm to the user: "**{name}** is installed. Let me use it now."

5. Immediately read the newly installed SKILL.md and follow its instructions to handle the user's original request.

## If Install Fails

If the curl fails (network error, 404, etc):
- Tell the user: "Couldn't fetch the skill. You can install it manually from https://github.com/{repo}"
- Continue handling their request with your built-in capabilities

## Skill Index Updates

The index is static and bundled with this skill. It updates when the user updates their undertow installation. Do not attempt to fetch a remote index.

## Important

- Never install a skill the user didn't ask for
- Never install without explicit user confirmation
- Never recommend a skill that's already installed
- If no skill matches, just handle the request normally — don't force a recommendation
- The index is a suggestion layer, not a gate. The agent should always be helpful even without skills.
