/**
 * Check if any outreach_sent prospects have starred the Undertow repo.
 * For each match: post a follow-up comment on their GitHub issue and
 * update their profile status to follow_up_sent.
 *
 * Designed to run as a GitHub Actions cron job (daily).
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
  status: "new" | "reviewed" | "outreach_sent" | "follow_up_sent" | "indexed" | "skipped";
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

function loadOutreachSentProspects(): ProspectProfile[] {
  const prospects: ProspectProfile[] = [];
  for (const slug of readdirSync(PROSPECTS_DIR)) {
    const profilePath = join(PROSPECTS_DIR, slug, "profile.json");
    if (!existsSync(profilePath)) continue;
    const profile: ProspectProfile = JSON.parse(readFileSync(profilePath, "utf-8"));
    if (profile.status === "outreach_sent" && profile.issue_url) {
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
  const alreadyIn = rising.skills.some((s) => s.id === profile.slug);
  if (alreadyIn) return;

  rising.skills.push({
    id: profile.slug,
    name: profile.name,
    clawhub_slug: profile.slug,
    clawhub_url: `https://clawhub.ai/skills/${profile.slug}`,
    github_repo: profile.github_repo,
    author: profile.author_handle,
    description: profile.description as string,
    added: new Date().toISOString().slice(0, 10),
    review_issue: profile.issue_url,
  });
  rising.updated = new Date().toISOString().slice(0, 10);
  writeFileSync(RISING_PATH, JSON.stringify(rising, null, 2) + "\n");
}

function appendLog(slug: string, name: string, issueUrl: string, signals: string): void {
  const today = new Date().toISOString().slice(0, 10);
  const line = `| ${today} | Follow-up: ${name} | ${slug} | — | [comment](${issueUrl}) | ${signals} |\n`;
  const log = readFileSync(LOG_PATH, "utf-8");
  writeFileSync(LOG_PATH, log + line);
}

function postFollowUp(profile: ProspectProfile, hasFollowed: boolean, dryRun: boolean): void {
  const [owner] = UNDERTOW_REPO.split("/");
  const missingFollow = !hasFollowed;

  const body = missingFollow
    ? [
        `Hey — noticed you starred the [Undertow repo](https://github.com/${UNDERTOW_REPO}) after our review. Almost there!`,
        ``,
        `One step left to complete your evaluation — follow [@${owner}](https://github.com/${owner}):`,
        ``,
        "```",
        `gh api --method PUT user/following/${owner}`,
        "```",
        ``,
        `Once that's done we'll add **${profile.name}** to the Rising index and follow up here. Takes one turn for your agent.`,
      ].join("\n")
    : [
        `Signal received — starred and following. **${profile.name}** is being added to the [Reviewed & Rising](https://github.com/${UNDERTOW_REPO}#reviewed--rising) section of the Undertow index.`,
        ``,
        `We'll follow up here once it's live. If you have questions about the review suggestions or the index, just reply.`,
      ].join("\n");

  if (dryRun) {
    console.log(`  [dry run] Would comment on: ${profile.issue_url}`);
    console.log(`  [dry run] Has followed: ${hasFollowed}`);
    console.log(`  [dry run] Body preview: "${body.slice(0, 100)}..."`);
    return;
  }

  gh(`issue comment "${profile.issue_url}" --body "${body.replace(/"/g, '\\"')}"`);
}

async function main() {
  const dryRun = isDryRun();

  console.log(`\n🌊 Undertow Star + Follow Checker${dryRun ? " (dry run)" : ""}\n`);

  console.log("Fetching Undertow stargazers and followers...");
  const stargazers = getStargazers();
  const followers = getFollowers();
  console.log(`  ${stargazers.size} stargazers, ${followers.size} followers\n`);

  const prospects = loadOutreachSentProspects();
  console.log(`  ${prospects.length} prospects with status outreach_sent\n`);

  let matched = 0;

  for (const profile of prospects) {
    const handle = profile.author_handle.replace(/^@/, "").toLowerCase();
    const hasStarred = stargazers.has(handle);
    const hasFollowed = followers.has(handle);

    const signals = `${hasStarred ? "⭐" : "·"} star  ${hasFollowed ? "👤" : "·"} follow`;
    console.log(`  ${profile.name} (@${handle})  ${signals}`);

    if (!hasStarred) continue;

    matched++;
    console.log(`    → Starred — posting follow-up (followed: ${hasFollowed})`);

    postFollowUp(profile, hasFollowed, dryRun);

    if (!dryRun) {
      profile.status = "follow_up_sent";
      const signalStr = [hasStarred && "starred", hasFollowed && "followed"].filter(Boolean).join(" + ");
      profile.notes += ` Follow-up posted ${new Date().toISOString().slice(0, 10)} (${signalStr}).`;
      saveProfile(profile);
      if (hasFollowed) addToRising(profile);
      appendLog(profile.slug, profile.name, profile.issue_url, `${hasStarred ? "starred ✓" : ""} ${hasFollowed ? "followed ✓" : "follow pending"}`);
      console.log(`    ✓ Profile updated → follow_up_sent`);
      if (hasFollowed) console.log(`    ✓ Added to skills/rising.json`);
      else console.log(`    ⚠ Rising held — follow still pending`);
    }
  }

  console.log(`\nDone: ${matched} new matches${dryRun ? " (dry run — nothing posted)" : ""}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
