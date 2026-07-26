import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { requireProjectRoot } from '../utils/project-root.js';
import { loadStackrConfig } from '../utils/config-file.js';
import {
  INTEGRATIONS,
  isUnconfigured,
  type IntegrationField,
  type IntegrationSpec,
} from '../config/integrations.js';
import type { ServiceEntry } from '../types/config-file.js';

export interface ConfigOptions {
  /** Prompt for and write back each unconfigured value. */
  interactive?: boolean;
  /** Make `runConfig` report a non-zero `missingRequired` for CI gating. */
  strict?: boolean;
  /** Restrict the check to a single service by name. */
  service?: string;
}

/** One unconfigured field discovered for a given service × integration. */
export interface ConfigFinding {
  /** The service this finding belongs to. */
  serviceName: string;
  /** The integration spec the field comes from. */
  spec: IntegrationSpec;
  /** The unconfigured field. */
  field: IntegrationField;
  /** Project-relative path of the file the value lives in. */
  rel: string;
  /** Absolute path of the file the value lives in. */
  filePath: string;
  /**
   * `true` when we fell back to reading `.env.example` because the real
   * `.env` (or `.env.local`) was missing — the user still needs to run setup.
   */
  fromExample: boolean;
}

/**
 * A leftover placeholder token found by the generic fallback scan that the
 * registry did not already flag (e.g. a value the registry doesn't model).
 */
export interface GenericFinding {
  rel: string;
  /** The matched placeholder tokens, de-duplicated. */
  tokens: string[];
}

export interface ConfigResult {
  /** Every registry-driven unconfigured field. */
  findings: ConfigFinding[];
  /** Leftover placeholder tokens the registry didn't model. */
  generic: GenericFinding[];
  /** How many of the findings are for `required` fields. */
  missingRequired: number;
  /** Total number of integration values that were checked. */
  totalChecked: number;
}

/**
 * Regex used by the generic fallback scan. Matches the placeholder shapes the
 * templates emit (`YOUR_…`, `your-…`, `change-me-…`, the default bundle id)
 * so values the registry doesn't model still get a generic warning.
 */
const GENERIC_PLACEHOLDER = /YOUR_[A-Z0-9_]+|your-[a-z-]+|change-me-|com\.yourcompany\.yourapp/g;

/**
 * `stackr config [--interactive] [--strict] [--service <name>]` — surface the
 * OAuth / third-party integration values that are still placeholders.
 *
 * The integration registry (`src/config/integrations.ts`) is the single source
 * of truth: for each enabled integration we read the target file, run
 * `isUnconfigured` over its fields, and collect what is still untouched. A
 * generic fallback scan then warns about any remaining placeholder tokens the
 * registry doesn't model.
 *
 * Returns a structured result; the CLI layer maps `strict && missingRequired`
 * to a non-zero exit code so `stackr config --strict` is CI-gateable (mirrors
 * how `stackr doctor` gates on unfixed drift).
 */
export async function runConfig(options: ConfigOptions = {}): Promise<ConfigResult> {
  const root = await requireProjectRoot(process.cwd());
  const config = await loadStackrConfig(root);

  const services = options.service
    ? config.services.filter((svc) => svc.name === options.service)
    : config.services;

  if (options.service && services.length === 0) {
    console.log(chalk.yellow(`No service named "${options.service}" in stackr.config.json.`));
  }

  const findings: ConfigFinding[] = [];
  let totalChecked = 0;

  // Files we touched (real .env / app.json / fallback .env.example) — feeds the
  // generic fallback scan so it only re-reads what the registry already looked
  // at, and never double-flags a value the registry handled.
  const scannedFiles = new Map<string, { rel: string; flagged: Set<string> }>();

  // Cache parsed file contents per absolute path so multiple integrations
  // sharing a backend .env (Google + Apple + SMTP) parse it once.
  const envCache = new Map<string, Record<string, string>>();
  const jsonCache = new Map<string, unknown>();

  for (const svc of services) {
    for (const spec of INTEGRATIONS) {
      if (!appliesTo(spec, svc.kind)) continue;
      if (!spec.enabledWhen(svc)) continue;

      const resolved = await resolveTargetFile(root, svc, spec);
      // No file at all (not even an example) — record the missing fields as
      // findings so the user knows the integration is unconfigured, and note
      // that setup hasn't run yet.
      const note = resolved.fromExample;

      const scanEntry = scannedFiles.get(resolved.filePath) ?? {
        rel: resolved.rel,
        flagged: new Set<string>(),
      };
      scannedFiles.set(resolved.filePath, scanEntry);

      for (const field of spec.fields) {
        totalChecked += 1;
        const current = await readFieldValue(resolved, spec, field, envCache, jsonCache);
        if (isUnconfigured(current, field)) {
          findings.push({
            serviceName: svc.name,
            spec,
            field,
            rel: resolved.rel,
            filePath: resolved.filePath,
            fromExample: note,
          });
          // Record every placeholder this field could hold so the generic
          // scan below doesn't re-warn about a token the registry owns.
          for (const placeholder of field.placeholders) {
            scanEntry.flagged.add(placeholder);
          }
        }
      }
    }
  }

  const missingRequired = findings.filter((f) => f.field.required).length;

  // Interactive write-back happens before the generic scan / report so the
  // report reflects only what the user chose to leave unconfigured.
  if (options.interactive && findings.length > 0) {
    await runInteractive(findings);
  }

  const generic = await runGenericScan(scannedFiles);

  printReport({ findings, generic, missingRequired, totalChecked }, options);

  return { findings, generic, missingRequired, totalChecked };
}

// ---------------------------------------------------------------------------
// Target-file resolution + reading
// ---------------------------------------------------------------------------

/** Whether `spec` applies to a service of the given kind (`'any'` matches both). */
function appliesTo(spec: IntegrationSpec, kind: ServiceEntry['kind']): boolean {
  return spec.appliesToKind === 'any' || spec.appliesToKind === kind;
}

interface ResolvedTarget {
  filePath: string;
  rel: string;
  /** `true` when we fell back to reading the `.example` template. */
  fromExample: boolean;
  /** `'env'` for KEY=VALUE files, `'json'` for app.json. */
  format: 'env' | 'json';
}

/**
 * Resolve the on-disk file an integration's values live in. For env sources we
 * prefer the real `.env` (or `web/.env.local`) and fall back to the committed
 * `.example` when the real file is missing (user hasn't run setup yet).
 */
async function resolveTargetFile(
  root: string,
  svc: ServiceEntry,
  spec: IntegrationSpec
): Promise<ResolvedTarget> {
  if (spec.source.kind === 'mobile-app-json') {
    const filePath = path.join(root, svc.name, 'mobile', 'app.json');
    return { filePath, rel: path.relative(root, filePath), fromExample: false, format: 'json' };
  }

  const real =
    spec.source.kind === 'web-env'
      ? path.join(root, svc.name, 'web', '.env.local')
      : path.join(root, svc.name, 'backend', '.env');

  if (await fs.pathExists(real)) {
    return { filePath: real, rel: path.relative(root, real), fromExample: false, format: 'env' };
  }

  // Fall back to the committed example so we can still report placeholders.
  const example =
    spec.source.kind === 'web-env'
      ? path.join(root, svc.name, 'web', '.env.example')
      : path.join(root, svc.name, 'backend', '.env.example');

  return { filePath: example, rel: path.relative(root, example), fromExample: true, format: 'env' };
}

/** Read the current value for `field` out of the resolved target. */
async function readFieldValue(
  resolved: ResolvedTarget,
  spec: IntegrationSpec,
  field: IntegrationField,
  envCache: Map<string, Record<string, string>>,
  jsonCache: Map<string, unknown>
): Promise<string | undefined> {
  if (resolved.format === 'json') {
    if (spec.source.kind !== 'mobile-app-json') return undefined;
    let parsed = jsonCache.get(resolved.filePath);
    if (parsed === undefined) {
      parsed = (await fs.pathExists(resolved.filePath))
        ? await fs.readJson(resolved.filePath).catch(() => ({}))
        : {};
      jsonCache.set(resolved.filePath, parsed);
    }
    const extra = readExpoExtra(parsed);
    const group = extra?.[spec.source.extraPath];
    if (group && typeof group === 'object') {
      const value = (group as Record<string, unknown>)[field.key];
      return typeof value === 'string' ? value : undefined;
    }
    return undefined;
  }

  let parsed = envCache.get(resolved.filePath);
  if (parsed === undefined) {
    parsed = (await fs.pathExists(resolved.filePath))
      ? parseEnv(await fs.readFile(resolved.filePath, 'utf-8'))
      : {};
    envCache.set(resolved.filePath, parsed);
  }
  return parsed[field.key];
}

/** Pull `expo.extra` out of a parsed app.json, tolerant of either shape. */
function readExpoExtra(parsed: unknown): Record<string, unknown> | undefined {
  if (!parsed || typeof parsed !== 'object') return undefined;
  const expo = (parsed as Record<string, unknown>).expo;
  if (!expo || typeof expo !== 'object') return undefined;
  const extra = (expo as Record<string, unknown>).extra;
  return extra && typeof extra === 'object' ? (extra as Record<string, unknown>) : undefined;
}

/**
 * Minimal `KEY=VALUE` env parser: ignores blank lines and `#` comments,
 * splits on the first `=`, and strips one layer of surrounding quotes.
 */
function parseEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Interactive write-back
// ---------------------------------------------------------------------------

/**
 * Prompt for each unconfigured field and write accepted non-empty answers
 * back to disk. Empty input skips the field. Writes are idempotent and never
 * touch a value that isn't one of these flagged findings.
 */
async function runInteractive(findings: ConfigFinding[]): Promise<void> {
  console.log();
  console.log(chalk.bold('Filling in integration values (leave blank to skip):'));

  // Group answers per file so each file is written once.
  const envEdits = new Map<string, { rel: string; values: Map<string, string> }>();
  const jsonEdits = new Map<
    string,
    { rel: string; values: Array<{ extraPath: string; key: string; value: string }> }
  >();

  for (const finding of findings) {
    const { spec, field } = finding;
    console.log();
    console.log(`  ${chalk.cyan(spec.name)} → ${chalk.bold(field.key)} (${finding.rel})`);
    if (field.hint) console.log(chalk.gray(`    ${field.hint}`));
    console.log(chalk.gray(`    Dashboard: ${spec.dashboardUrl}`));

    const { value } = await inquirer.prompt<{ value: string }>([
      {
        type: 'input',
        name: 'value',
        message: `    ${field.label}:`,
      },
    ]);

    const trimmed = (value ?? '').trim();
    if (trimmed === '') continue;

    if (spec.source.kind === 'mobile-app-json') {
      const entry = jsonEdits.get(finding.filePath) ?? { rel: finding.rel, values: [] };
      entry.values.push({ extraPath: spec.source.extraPath, key: field.key, value: trimmed });
      jsonEdits.set(finding.filePath, entry);
    } else {
      const entry = envEdits.get(finding.filePath) ?? { rel: finding.rel, values: new Map() };
      entry.values.set(field.key, trimmed);
      envEdits.set(finding.filePath, entry);
    }
  }

  for (const [filePath, edit] of envEdits) {
    await writeEnvValues(filePath, edit.values);
    console.log(chalk.green(`✓ Updated ${edit.rel}`));
  }
  for (const [filePath, edit] of jsonEdits) {
    await writeAppJsonValues(filePath, edit.values);
    console.log(chalk.green(`✓ Updated ${edit.rel}`));
  }
}

/**
 * Replace each `KEY=...` line in place, preserving comments and ordering. Keys
 * absent from the file are appended under a generated `stackr config` section.
 * Skips blanks (callers already filter those out).
 */
async function writeEnvValues(filePath: string, values: Map<string, string>): Promise<void> {
  const existing = (await fs.pathExists(filePath)) ? await fs.readFile(filePath, 'utf-8') : '';
  const lines = existing.split('\n');
  const remaining = new Map(values);

  const updated = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) return line;
    const eq = line.indexOf('=');
    if (eq === -1) return line;
    const key = line.slice(0, eq).trim();
    if (remaining.has(key)) {
      const value = remaining.get(key)!;
      remaining.delete(key);
      return `${key}=${value}`;
    }
    return line;
  });

  if (remaining.size > 0) {
    // Append any keys the file didn't already declare under a clear section.
    if (updated.length > 0 && updated[updated.length - 1].trim() !== '') updated.push('');
    updated.push('# Added by `stackr config`');
    for (const [key, value] of remaining) {
      updated.push(`${key}=${value}`);
    }
  }

  await fs.writeFile(filePath, updated.join('\n'));
}

/** Set `extra.<extraPath>.<key>` for each value and write app.json back at 2-space indent. */
async function writeAppJsonValues(
  filePath: string,
  values: Array<{ extraPath: string; key: string; value: string }>
): Promise<void> {
  const parsed = (await fs.pathExists(filePath))
    ? ((await fs.readJson(filePath)) as Record<string, unknown>)
    : {};

  const expo = (parsed.expo as Record<string, unknown>) ?? (parsed.expo = {});
  const extra = (expo.extra as Record<string, unknown>) ?? (expo.extra = {});
  for (const { extraPath, key, value } of values) {
    const group = (extra[extraPath] as Record<string, unknown>) ?? (extra[extraPath] = {});
    group[key] = value;
  }

  await fs.writeJson(filePath, parsed, { spaces: 2 });
}

// ---------------------------------------------------------------------------
// Generic fallback scan
// ---------------------------------------------------------------------------

/**
 * Re-scan every file the registry looked at for leftover placeholder tokens
 * the registry didn't already flag. Only env files are scanned this way —
 * app.json placeholders are surfaced field-by-field by the registry.
 */
async function runGenericScan(
  scannedFiles: Map<string, { rel: string; flagged: Set<string> }>
): Promise<GenericFinding[]> {
  const generic: GenericFinding[] = [];
  for (const [filePath, info] of scannedFiles) {
    if (!filePath.includes(`${path.sep}.env`)) continue; // env files only
    if (!(await fs.pathExists(filePath))) continue;
    const content = await fs.readFile(filePath, 'utf-8');
    const flagged = [...info.flagged];
    const tokens = new Set<string>();
    for (const match of content.matchAll(GENERIC_PLACEHOLDER)) {
      const token = match[0];
      // Skip tokens the registry already owns — either an exact placeholder
      // match or a substring of one (e.g. the `your-email` portion of the
      // SMTP placeholder `your-email@gmail.com`).
      if (!flagged.some((p) => p === token || p.includes(token))) tokens.add(token);
    }
    if (tokens.size > 0) {
      generic.push({ rel: info.rel, tokens: [...tokens] });
    }
  }
  return generic;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function printReport(result: ConfigResult, options: ConfigOptions): void {
  const { findings, generic, totalChecked } = result;

  if (findings.length === 0 && generic.length === 0) {
    console.log(chalk.green('✓ All integration values are configured.'));
    return;
  }

  // Group findings service → integration so each integration prints once.
  const byKey = new Map<string, ConfigFinding[]>();
  const order: string[] = [];
  for (const finding of findings) {
    const key = `${finding.serviceName} ${finding.spec.id}`;
    if (!byKey.has(key)) {
      byKey.set(key, []);
      order.push(key);
    }
    byKey.get(key)!.push(finding);
  }

  if (findings.length > 0) {
    console.log(
      chalk.yellow(
        `Integration values still need configuration (${findings.length} value${findings.length === 1 ? '' : 's'}):`
      )
    );
  }

  let needsSetup = false;
  for (const key of order) {
    const group = byKey.get(key)!;
    const first = group[0];
    const { spec, serviceName } = first;
    console.log();
    console.log(`  ${chalk.bold(spec.name)} ${chalk.gray(`(${serviceName})`)}`);
    console.log(`    ${chalk.gray('file:')}      ${first.rel}`);
    console.log(`    ${chalk.gray('dashboard:')} ${spec.dashboardUrl}`);
    console.log(`    ${chalk.gray('missing:')}   ${group.map((g) => g.field.key).join(', ')}`);
    if (first.fromExample) {
      needsSetup = true;
      console.log(
        chalk.yellow(`    ⚠️  No real .env yet — run \`npm run setup\` first, then re-check.`)
      );
    }
    console.log(chalk.gray('    setup:'));
    spec.setupSteps.forEach((step, i) => {
      console.log(chalk.gray(`      ${i + 1}. ${step}`));
    });
  }

  if (generic.length > 0) {
    console.log();
    console.log(chalk.yellow('Other placeholder values detected (not tracked by the registry):'));
    for (const g of generic) {
      console.log(`  ${g.rel} ${chalk.gray(`→ ${g.tokens.join(', ')}`)}`);
    }
  }

  if (findings.length > 0) {
    console.log();
    console.log(
      `${findings.length} of ${totalChecked} integration value${totalChecked === 1 ? '' : 's'} still need configuration.`
    );
    if (needsSetup) {
      console.log(
        chalk.gray('Run `npm run setup` to materialise real .env files before configuring.')
      );
    }
    if (!options.interactive) {
      console.log(chalk.gray('Run `stackr config --interactive` to fill these in now.'));
    }
  }
}
