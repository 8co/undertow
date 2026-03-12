# Outreach Playbook

Growth engine for the Undertow curated index. The strategy: find quality new skills, give their authors genuine value (a free review), and let curiosity do the rest.

## The Loop

```
Monitor ClawHub → Spot quality skill → Review with LLM → Post issue → Star repo → Author discovers Undertow
```

## Daily Workflow (10 minutes)

### 1. Monitor

Browse ClawHub for recently published skills in relevant categories:

```
clawhub search "code review" --limit 10
clawhub search "testing" --limit 10
clawhub search "devops" --limit 10
clawhub search "security audit" --limit 10
clawhub search "documentation" --limit 10
```

Or browse https://clawhub.ai/skills sorted by newest.

Look for:
- Developer workflow skills (not general-purpose or novelty)
- Has a GitHub repo linked
- Recently published (ideally within the last week)
- Shows effort in the SKILL.md (not a one-liner)

### 2. Review

For each candidate, generate a review using the prompt in `review-prompt.md`:

```
clawhub inspect {slug}
```

Paste the SKILL.md content into your LLM along with the review prompt. Review the output — edit anything generic or off-tone.

### 3. Post

Open the issue on their GitHub repo. Use the exact output from the review.

### 4. Star

Star their repo from @8co. This triggers a GitHub notification — the author sees @8co, clicks the profile, discovers Undertow.

### 5. Track

Log the outreach in `ops/outreach/log.md`:

```
| Date | Skill | Slug | Repo | Issue | Response |
```

## Rules

- **Max 2-3 per week.** This is handcrafted outreach, not volume plays.
- **Every review must be genuine.** If you can't find something good to say, skip it.
- **Never automate the posting.** Human reviews every issue before it goes out.
- **Never post on skills you wouldn't actually consider indexing.** The review must be honest.
- **Starring is genuine.** Only star repos you actually evaluated and found promising.
- **No follow-ups.** Post once. If they engage, respond. If they don't, move on.

## Why This Works

1. **Timing** — New skill authors are in their highest-intent window. They want feedback, stars, and visibility more than anything.
2. **Value first** — The review is genuinely useful regardless of Undertow. Better tags, descriptions, and intent phrases help their ClawHub discoverability.
3. **Authority positioning** — "We're evaluating skills for our curated index" frames Undertow as the curator, not the competitor.
4. **The star notification** — @8co starring their repo creates a discovery moment. They click the profile, see Undertow pinned, connect the dots.
5. **No ask** — We're not asking them to install anything. "Star if interested" is the softest possible CTA and gives THEM the agency.

## TOS Safety

- GitHub issues are a core platform feature. One genuine issue per repo is community engagement, not spam.
- Starring is a native GitHub action. No TOS issue.
- Volume stays low (2-3/week). This is clearly manual, not automated.
- Every issue contains genuine value (actionable review feedback). Not a template blast.
