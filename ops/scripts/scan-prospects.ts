/**
 * Scan ClawHub for new skills with low download counts.
 * Creates prospect profiles in ops/prospects/{slug}/profile.json.
 *
 * Usage:
 *   npx tsx scripts/scan-prospects.ts                    # default: newest skills, max downloads 3, limit 50
 *   npx tsx scripts/scan-prospects.ts --max-downloads 5  # custom threshold
 *   npx tsx scripts/scan-prospects.ts --limit 100        # scan more
 *   npx tsx scripts/scan-prospects.ts --sort trending     # sort by trending instead of newest
 *   npx tsx scripts/scan-prospects.ts --dry-run           # print results without writing files
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROSPECTS_DIR = join(__dirname, "..", "prospects");

interface SkillStats {
  comments: number;
  downloads: number;
  installsAllTime: number;
  installsCurrent: number;
  stars: number;
  versions: number;
}

interface ExploreItem {
  slug: string;
  displayName: string;
  summary: string;
  tags: Record<string, string>;
  stats: SkillStats;
  createdAt: number;
  updatedAt: number;
  latestVersion: {
    version: string;
    createdAt: number;
    changelog: string;
    license: string | null;
  };
  metadata: unknown;
}

interface InspectResult {
  skill: {
    slug: string;
    displayName: string;
    summary: string;
    tags: Record<string, string>;
    stats: SkillStats;
    createdAt: number;
    updatedAt: number;
  };
  latestVersion: {
    version: string;
    createdAt: number;
    changelog: string;
    license: string | null;
  };
  owner: {
    handle: string;
    userId: string;
    displayName: string;
    image: string;
  };
}

interface ProspectProfile {
  slug: string;
  name: string;
  author_handle: string;
  author_avatar: string;
  github_profile: string;
  github_repo: string | null;
  clawhub_url: string;
  description: string;
  license: string | null;
  version: string;
  downloads: number;
  installs_all_time: number;
  installs_current: number;
  stars: number;
  versions: number;
  comments: number;
  created_at: string;
  updated_at: string;
  discovered_at: string;
  status: "new" | "reviewed" | "outreach_sent" | "indexed" | "skipped";
  has_skill_md: boolean;
  notes: string;
}

function parseArgs(): {
  maxDownloads: number;
  limit: number;
  sort: string;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  let maxDownloads = 3;
  let limit = 50;
  let sort = "newest";
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--max-downloads" && args[i + 1]) {
      maxDownloads = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--sort" && args[i + 1]) {
      sort = args[i + 1];
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { maxDownloads, limit: Math.min(limit, 200), sort, dryRun };
}

function runClawhub(args: string): string {
  const raw = execSync(`clawhub ${args}`, {
    encoding: "utf-8",
    timeout: 30_000,
  });
  const jsonStart = raw.indexOf("{");
  if (jsonStart === -1) throw new Error(`No JSON in clawhub output: ${raw}`);
  return raw.slice(jsonStart);
}

function explore(limit: number, sort: string): ExploreItem[] {
  const json = runClawhub(`explore --limit ${limit} --sort ${sort} --json`);
  const parsed = JSON.parse(json);
  return parsed.items ?? [];
}

function inspect(slug: string): InspectResult | null {
  try {
    const json = runClawhub(`inspect ${slug} --json`);
    return JSON.parse(json);
  } catch {
    console.error(`  ⚠ Failed to inspect ${slug}`);
    return null;
  }
}

function fetchSkillMd(slug: string): boolean {
  try {
    const output = execSync(`clawhub inspect ${slug} --file SKILL.md`, {
      encoding: "utf-8",
      timeout: 15_000,
    });
    return output.includes("#") || output.includes("---");
  } catch {
    return false;
  }
}

function alreadyProfiled(slug: string): boolean {
  return existsSync(join(PROSPECTS_DIR, slug, "profile.json"));
}

function buildProfile(
  item: ExploreItem,
  detail: InspectResult,
  hasSkillMd: boolean
): ProspectProfile {
  const handle = detail.owner.handle;
  return {
    slug: item.slug,
    name: item.displayName,
    author_handle: `@${handle}`,
    author_avatar: detail.owner.image,
    github_profile: `https://github.com/${handle}`,
    github_repo: null,
    clawhub_url: `https://clawhub.ai/skills/${item.slug}`,
    description: item.summary,
    license: detail.latestVersion.license,
    version: item.latestVersion.version,
    downloads: item.stats.downloads,
    installs_all_time: item.stats.installsAllTime,
    installs_current: item.stats.installsCurrent,
    stars: item.stats.stars,
    versions: item.stats.versions,
    comments: item.stats.comments,
    created_at: new Date(item.createdAt).toISOString(),
    updated_at: new Date(item.updatedAt).toISOString(),
    discovered_at: new Date().toISOString(),
    status: "new",
    has_skill_md: hasSkillMd,
    notes: "",
  };
}

function writeProfile(profile: ProspectProfile): void {
  const dir = join(PROSPECTS_DIR, profile.slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "profile.json"),
    JSON.stringify(profile, null, 2) + "\n"
  );
}

async function main() {
  const { maxDownloads, limit, sort, dryRun } = parseArgs();

  console.log(
    `\n🌊 Undertow Prospect Scanner\n` +
      `   Sort: ${sort} | Max downloads: ${maxDownloads} | Limit: ${limit} | Dry run: ${dryRun}\n`
  );

  console.log("Fetching skills from ClawHub...");
  const items = explore(limit, sort);
  console.log(`  Found ${items.length} skills\n`);

  const candidates = items.filter((s) => s.stats.downloads <= maxDownloads);
  console.log(
    `  ${candidates.length} with ≤ ${maxDownloads} downloads\n`
  );

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of candidates) {
    if (alreadyProfiled(item.slug)) {
      skipped++;
      continue;
    }

    process.stdout.write(`  → ${item.displayName} (${item.slug})... `);

    const detail = inspect(item.slug);
    if (!detail) {
      failed++;
      continue;
    }

    const hasSkillMd = fetchSkillMd(item.slug);
    const profile = buildProfile(item, detail, hasSkillMd);

    if (dryRun) {
      console.log(
        `${profile.downloads} downloads, @${detail.owner.handle}, ` +
          `SKILL.md: ${hasSkillMd ? "yes" : "no"}`
      );
    } else {
      writeProfile(profile);
      console.log("✓ saved");
    }

    created++;
  }

  console.log(
    `\nDone: ${created} new profiles${dryRun ? " (dry run)" : ""}, ` +
      `${skipped} already existed, ${failed} failed\n`
  );
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
