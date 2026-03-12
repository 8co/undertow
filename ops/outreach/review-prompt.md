# Skill Review Prompt

Use this prompt with any LLM (Claude, ChatGPT, Cursor agent) to generate a quality review of a ClawHub skill. The output is a GitHub issue you post on the skill author's repo.

## How to Use

1. Get the skill's SKILL.md content:
   ```
   clawhub inspect {slug}
   ```
   Or read it from their GitHub repo.

2. Paste the SKILL.md content below the prompt into your LLM.

3. Review the generated issue. Edit anything that feels off.

4. Post the issue on their GitHub repo.

5. Star their repo from @8co.

---

## Prompt

```
You are reviewing a ClawHub skill for potential inclusion in the Undertow curated index. Undertow is a skill discovery engine that recommends developer workflow skills to AI coding agents based on user intent.

Analyze the following SKILL.md and generate a GitHub issue with:

1. **Opening** — Lead with what the skill does well. Be specific and genuine. One sentence.

2. **Review** — 3-4 concrete, actionable suggestions to improve the skill. Focus on:
   - Description clarity (would an agent know when to recommend this?)
   - Tag coverage (missing tags that would help discovery?)
   - Intent phrases (what would a user say when they need this? Suggest 3-5.)
   - SKILL.md structure (frontmatter completeness, instruction clarity)
   - Any gaps compared to top skills in the same category

   Frame suggestions as opportunities, not criticisms. Use "you could" not "you should."

3. **Closing** — Explain that Undertow is evaluating this skill for its curated index and link to the repo. Keep it one short paragraph.

Format the output as a complete GitHub issue with title and body. Use this structure:

Title: 🌊 Undertow Index Review — {skill_name}

Body:

---

Hi there — nice work on **{skill_name}**. {genuine compliment about what the skill does well}.

We're [Undertow](https://github.com/8co/undertow), a skill discovery engine that recommends developer workflow skills to AI agents at the right moment. We monitor ClawHub for quality skills, and yours caught our attention.

We ran a review as part of our index evaluation. A few suggestions that could help with discoverability and adoption:

### Suggestions

{3-4 numbered suggestions with specific, actionable advice}

### Intent Phrases

If you're optimizing for agent-based discovery, these are phrases users might say when they need your skill:

{3-5 intent phrases as bullet points}

---

We're considering this skill for the next Undertow index update. If you're interested in being included, star the [Undertow repo](https://github.com/8co/undertow) — we use that as a signal of interest and will follow up if your skill is added.

Either way, the suggestions above should help with ClawHub discoverability regardless. Keep building. 🤙

---

Now analyze this SKILL.md:

{paste SKILL.md content here}
```
