/**
 * Check if any outreach_sent or star_received prospects have completed
 * their evaluation signals (star, follow, reply) on the Undertow repo.
 *
 * Signal logic:
 *   outreach_sent + starred (no follow) → status: star_received, nudge for follow + reply
 *   outreach_sent + starred + followed  → status: follow_up_sent, added to rising.json
 *   star_received + now followed        → status: follow_up_sent, added to rising.json
 *   any status     + reply detected     → mark has_replied: true on profile
 *
 * Nudge comments only fire on status transitions — never repeated.
 *
 * Designed to run as a GitHub Actions cron job (daily at 9am UTC).
 * Requires GH_TOKEN with public_repo scope — set as GH_PAT secret in Actions.
 *
 * Usage:
 *   npx tsx scripts/check-stars.ts           # live run
 *   npx tsx scripts/check-stars.ts --dry-run # preview without posting
 */

import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROSPECTS_DIR = join(__dirname, "..", "prospects");
const LOG_PATH = join(__dirname, "..", "outreach", "log.md");
const RISING_PATH = join(__dirname, "..", "..", "skills", "rising.json");
const UNDERTOW_REPO = "8co/undertow";
const BOT_HANDLE = "8co";

interface RisingEntry {
  id: string;
  name: string;
  clawhub_slug: string;
  clawhub_url: string;
  github_repo: string | null;
  author: string;
  description: string;
  added: string;
  review_issue: string;
}

interface RisingIndex {
  version: number;
  updated: string;
  description: string;
  skills: RisingEntry[];
}

interface ProspectProfile {
  slug: string;
  name: string;
  author_handle: string;
  github_repo: string | null;
  issue_url: string;
  description: string;
  status: "new" | "reviewed" | "outreach_sent" | "star_received" | "follow_up_sent" | "indexed" | "skipped";
  has_replied: boolean;
  notes: string;
  [key: string]: unknown;
}

function isDryRun(): boolean {
  return process.argv.includes("--dry-run");
}

function gh(args: string): string {
  return execSync(`gh ${args}`, { encoding: "utf-8", timeout: 30_000 });
}

function getStargazers(): Set<string> {
  const logins = new Set<string>();
  let page = 1;
  while (true) {
    const raw = gh(`api "/repos/${UNDERTOW_REPO}/stargazers?per_page=100&page=${page}"`);
    const items: { login: string }[] = JSON.parse(raw);
    if (!items.length) break;
    for (const item of items) logins.add(item.login.toLowerCase());
    if (items.length < 100) break;
    page++;
  }
  return logins;
}

function getFollowers(): Set<string> {
  const logins = new Set<string>();
  let page = 1;
  const [owner] = UNDERTOW_REPO.split("/");
  while (true) {
    const raw = gh(`api "/users/${owner}/followers?per_page=100&page=${page}"`);
    const items: { login: string }[] = JSON.parse(raw);
    if (!items.length) break;
    for (const item of items) logins.add(item.login.toLowerCase());
    if (items.length < 100) break;
    page++;
  }
  return logins;
}

function parseIssueUrl(issueUrl: string): { owner: string; repo: string; number: number } | null {
  const match = issueUrl.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: parseInt(match[3]) };
}

function hasExternalReply(issueUrl: string): boolean {
  const parsed = parseIssueUrl(issueUrl);
  if (!parsed) return false;
  try {
    const raw = gh(`api "repos/${parsed.owner}/${parsed.repo}/issues/${parsed.number}/comments"`);
    const comments: { user: { login: string } }[] = JSON.parse(raw);
    return comments.some((c) => c.user.login.toLowerCase() !== BOT_HANDLE.toLowerCase());
  } catch {
    return false;
  }
}

function loadActiveProspects(): ProspectProfile[] {
  const prospects: ProspectProfile[] = [];
  for (const slug of readdirSync(PROSPECTS_DIR)) {
    const profilePath = join(PROSPECTS_DIR, slug, "profile.json");
    if (!existsSync(profilePath)) continue;
    const profile = JSON.parse(readFileSync(profilePath, "utf-8")) as ProspectProfile;
    if (
      (profile.status === "outreach_sent" || profile.status === "star_received") &&
      profile.issue_url
    ) {
      if (profile.has_replied === undefined) profile.has_replied = false;
      prospects.push(profile);
    }
  }
  return prospects;
}

function saveProfile(profile: ProspectProfile): void {
  const path = join(PROSPECTS_DIR, profile.slug, "profile.json");
  writeFileSync(path, JSON.stringify(profile, null, 2) + "\n");
}

function addToRising(profile: ProspectProfile): void {
  const rising: RisingIndex = JSON.parse(readFileSync(RISING_PATH, "utf-8"));
  if (rising.skills.some((s) => s.id === profile.slug)) return;
  rising.skills.push({
    id: profile.slug,
    name: profile.name,
    clawhub_slug: profile.slug,
    clawhub_url: `https://clawhub.ai/skills/${profile.slug}`,
    github_repo: profile.github_repo,
    author: profile.author_handle,
    description: profile.description,
    added: new Date().toISOString().slice(0, 10),
    review_issue: profile.issue_url,
  });
  rising.updated = new Date().toISOString().slice(0, 10);
  writeFileSync(RISING_PATH, JSON.stringify(rising, null, 2) + "\n");
}

function appendLog(slug: string, name: string, issueUrl: string, signals: string): void {
  const today = new Date().toISOString().slice(0, 10);
  const line = `| ${today} | Signal: ${name} | ${slug} | — | [issue](${issueUrl}) | ${signals} |\n`;
  const log = readFileSync(LOG_PATH, "utf-8");
  writeFileSync(LOG_PATH, log + line);
}

function postComment(issueUrl: string, body: string, dryRun: boolean): void {
  if (dryRun) {
    console.log(`    [dry run] Comment on ${issueUrl}:`);
    console.log(`    [dry run] "${body.slice(0, 120)}..."`);
    return;
  }
  gh(`issue comment "${issueUrl}" --body "${body.replace(/`/g, "\\`").replace(/"/g, '\\"')}"`);
}

function nudgeComment(profile: ProspectProfile): string {
  const [owner] = UNDERTOW_REPO.split("/");
  return [
    `Thanks for the star — one step left to complete your evaluation.`,
    ``,
    `We've already starred your repo. The return signal is follow + reply:`,
    ``,
    `**Step 1** — Follow [@${owner}](https://github.com/${owner}):`,
    "```",
    `gh api --method PUT user/following/${owner}`,
    "```",
    `**Step 2** — Reply here to confirm.`,
    ``,
    `Undertow is fully automated — stars and follows are how the pipeline tracks queue priority. Once both signals register, **${profile.name}** moves to the front. We follow up within 24 hours.`,
  ].join("\n");
}

function liveComment(profile: ProspectProfile): string {
  return [
    `All signals received — starred, following, and confirmed. **${profile.name}** is being added to the [Reviewed & Rising](https://github.com/${UNDERTOW_REPO}#reviewed--rising) section of the Undertow index.`,
    ``,
    `We'll follow up here once it's live. If you have questions about the review suggestions or want to discuss the index, just reply.`,
  ].join("\n");
}

async function main() {
  const dryRun = isDryRun();

  console.log(`\n🌊 Undertow Signal Checker${dryRun ? " (dry run)" : ""}\n`);

  console.log("Fetching stargazers, followers...");
  const stargazers = getStargazers();
  const followers = getFollowers();
  console.log(`  ${stargazers.size} stargazers  ${followers.size} followers\n`);

  const prospects = loadActiveProspects();
  console.log(`  ${prospects.length} active prospects (outreach_sent or star_received)\n`);

  let transitions = 0;

  for (const profile of prospects) {
    const handle = profile.author_handle.replace(/^@/, "").toLowerCase();
    const hasStarred = stargazers.has(handle);
    const hasFollowed = followers.has(handle);

    const starIcon = hasStarred ? "⭐" : "·";
    const followIcon = hasFollowed ? "👤" : "·";
    const replyIcon = profile.has_replied ? "💬" : "·";
    console.log(`  ${profile.name} (@${handle})  ${starIcon}star  ${followIcon}follow  ${replyIcon}reply  [${profile.status}]`);

    // Check for reply on any active prospect (only if not already marked)
    if (!profile.has_replied) {
      const replied = hasExternalReply(profile.issue_url);
      if (replied) {
        profile.has_replied = true;
        console.log(`    💬 Reply detected — marking profile`);
        if (!dryRun) saveProfile(profile);
      }
    }

    // Star is the primary trigger — nothing fires without it
    if (!hasStarred) continue;

    if (!hasFollowed) {
      // Starred but not followed — nudge once on first detection
      if (profile.status === "outreach_sent") {
        console.log(`    → Star only — nudging for follow + reply`);
        postComment(profile.issue_url, nudgeComment(profile), dryRun);
        if (!dryRun) {
          profile.status = "star_received";
          profile.notes += ` Star detected ${new Date().toISOString().slice(0, 10)}, nudged for follow.`;
          saveProfile(profile);
          appendLog(profile.slug, profile.name, profile.issue_url, "⭐ starred · follow pending");
          console.log(`    ✓ Status → star_received`);
        }
        transitions++;
      }
      // Already star_received — nudge was sent, don't repeat
      continue;
    }

    // Starred + followed — complete signal
    if (profile.status === "outreach_sent" || profile.status === "star_received") {
      console.log(`    → Full signal — posting live comment + adding to Rising`);
      postComment(profile.issue_url, liveComment(profile), dryRun);
      if (!dryRun) {
        profile.status = "follow_up_sent";
        profile.notes += ` Full signal ${new Date().toISOString().slice(0, 10)} (starred + followed${profile.has_replied ? " + replied" : ""}).`;
        saveProfile(profile);
        addToRising(profile);
        appendLog(
          profile.slug,
          profile.name,
          profile.issue_url,
          `⭐ starred  👤 followed${profile.has_replied ? "  💬 replied" : ""}`
        );
        console.log(`    ✓ Status → follow_up_sent`);
        console.log(`    ✓ Added to skills/rising.json`);
      }
      transitions++;
    }
  }

  console.log(`\nDone: ${transitions} transitions${dryRun ? " (dry run — nothing posted)" : ""}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
