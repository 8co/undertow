# Claude Code — Undertow

Undertow is a skill discovery engine for AI coding agents. It's a curated index of 20+ developer workflow skills that the agent recommends contextually during conversation.

## How It Works

The entire product is `skills/SKILL.md` + `skills/index.json`. The SKILL.md teaches the agent how to match user intents against the index and install skills on demand. There is no runtime code.

## Contributing

### Rules
1. Read before writing.
2. The SKILL.md must stay under 500 lines.
3. The index.json must stay valid JSON.
4. No scripts, no binaries, no npm dependencies.
5. No network calls except the GitHub raw URL fetch during skill install.
6. Every skill in the index must have a real, public GitHub repo.
7. Intent phrases should reflect how real people talk, not marketing copy.

### Adding a Skill to the Index
1. Add the entry to `skills/index.json`
2. Ensure the repo exists and has a `skills/SKILL.md` (or whatever `path` points to)
3. Add 3-5 intent phrases — these should be things a user would naturally say
4. Update the skills table in `README.md`
5. Bump the `updated` date in `index.json`

### Security Constraints
- No `curl`, `wget`, or network-fetching commands in the SKILL.md itself (install uses curl, but that's agent-executed with user consent)
- No `eval`, `exec`, or dynamic code execution
- No environment variable reading
- No file operations outside `~/.cursor/skills/`
