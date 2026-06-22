import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import { runConfig } from '../../src/commands/config.js';
import { INTEGRATIONS } from '../../src/config/integrations.js';
import { STACKR_CONFIG_FILENAME, type StackrConfigFile } from '../../src/types/config-file.js';

/**
 * `stackr config` — reads stackr.config.json + the on-disk .env / app.json,
 * runs the integration registry's `isUnconfigured` over every enabled field,
 * and (interactively) writes accepted answers back. These tests drive it
 * against a hand-built minimal fixture so we exercise the report path, the
 * disabled-provider filtering, the "now filled in" transition, and the
 * interactive write-back with comment preservation.
 *
 * NOTE: vi.mock must be top-level (vitest hoists it) — see vitest.config.ts.
 */
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

/** A minimal valid v1 config with a single auth service. */
function makeConfig(
  authConfig: NonNullable<StackrConfigFile['services'][number]['authConfig']>
): StackrConfigFile {
  return {
    version: 1,
    stackrVersion: '0.7.1-test',
    projectName: 'config-test',
    createdAt: '2026-06-22T00:00:00.000Z',
    packageManager: 'bun',
    orm: 'prisma',
    aiTools: ['codex'],
    appScheme: 'configtest',
    services: [
      {
        name: 'auth',
        kind: 'auth',
        backend: {
          port: 3333,
          eventQueue: false,
          imageUploads: false,
          authMiddleware: 'none',
          tests: false,
        },
        web: null,
        mobile: null,
        authConfig,
        generatedAt: '2026-06-22T00:00:00.000Z',
        generatedBy: '0.7.1-test',
      },
    ],
  };
}

const PLACEHOLDER_ENV = `# Auth service backend env
DATABASE_URL=postgresql://app:s3cret@localhost:5432/auth
BETTER_AUTH_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# OAuth — Google
GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# OAuth — GitHub
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
`;

describe('stackr config', () => {
  let tempDir: string;
  let projectDir: string;
  let cwdSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-test-'));
    projectDir = path.join(tempDir, 'config-test');
    await fs.ensureDir(path.join(projectDir, 'auth', 'backend'));
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
    // Quiet the command's console output during tests.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(inquirer.prompt).mockReset();
  });

  afterEach(async () => {
    cwdSpy.mockRestore();
    vi.restoreAllMocks();
    await fs.remove(tempDir);
  });

  /** Write the auth service config + a backend .env with the given contents. */
  async function writeFixture(
    authConfig: NonNullable<StackrConfigFile['services'][number]['authConfig']>,
    envContents: string
  ): Promise<void> {
    await fs.writeJson(path.join(projectDir, STACKR_CONFIG_FILENAME), makeConfig(authConfig));
    await fs.writeFile(path.join(projectDir, 'auth', 'backend', '.env'), envContents);
  }

  const googleGithubAuth: NonNullable<StackrConfigFile['services'][number]['authConfig']> = {
    providers: { emailPassword: true, google: true, apple: false, github: true },
    emailVerification: false,
    passwordReset: false,
    twoFactor: false,
    adminDashboard: false,
    additionalUserFields: [],
    provisioningTargets: [],
  };

  describe('report mode', () => {
    it('flags enabled google + github placeholders, not disabled apple nor filled values', async () => {
      await writeFixture(googleGithubAuth, PLACEHOLDER_ENV);

      const result = await runConfig({});

      const flagged = result.findings.map((f) => f.field.key).sort();
      expect(flagged).toEqual(
        [
          'GITHUB_CLIENT_ID',
          'GITHUB_CLIENT_SECRET',
          'GOOGLE_CLIENT_SECRET',
          'GOOGLE_WEB_CLIENT_ID',
        ].sort()
      );

      // Apple is disabled → its fields are never checked or flagged.
      expect(result.findings.some((f) => f.spec.id === 'apple-oauth')).toBe(false);
      expect(flagged).not.toContain('APPLE_SERVICE_ID');

      // The filled-in DATABASE_URL / BETTER_AUTH_SECRET are not registry fields
      // and the generic scan must not flag their realistic values either.
      expect(
        result.generic.some((g) => g.tokens.some((t) => t.includes('app') || t.includes('secret')))
      ).toBe(false);
    });

    it('no longer flags a field once its placeholder is replaced with a real value', async () => {
      await writeFixture(googleGithubAuth, PLACEHOLDER_ENV);

      const before = await runConfig({});
      expect(before.findings.some((f) => f.field.key === 'GOOGLE_WEB_CLIENT_ID')).toBe(true);

      // Rewrite the .env with a real Google web client ID.
      const real = PLACEHOLDER_ENV.replace(
        'GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID',
        'GOOGLE_WEB_CLIENT_ID=1234567890-abcdefg.apps.googleusercontent.com'
      );
      await fs.writeFile(path.join(projectDir, 'auth', 'backend', '.env'), real);

      const after = await runConfig({});
      expect(after.findings.some((f) => f.field.key === 'GOOGLE_WEB_CLIENT_ID')).toBe(false);
      // The other three placeholders are still flagged.
      expect(after.findings.some((f) => f.field.key === 'GOOGLE_CLIENT_SECRET')).toBe(true);
      expect(after.findings.some((f) => f.field.key === 'GITHUB_CLIENT_ID')).toBe(true);
    });
  });

  describe('interactive write-back', () => {
    it('writes accepted values back to the .env and preserves comments', async () => {
      await writeFixture(googleGithubAuth, PLACEHOLDER_ENV);

      // Supply a real value for every prompted field. Findings are processed in
      // registry order (google web id, google secret, github id, github secret).
      const answers = [
        '1234567890-abcdefg.apps.googleusercontent.com',
        'GOCSPX-real-google-secret',
        'Iv1.real_github_id',
        'real_github_secret_value',
      ];
      let i = 0;
      vi.mocked(inquirer.prompt).mockImplementation(async () => ({ value: answers[i++] }));

      await runConfig({ interactive: true });

      const envPath = path.join(projectDir, 'auth', 'backend', '.env');
      const written = await fs.readFile(envPath, 'utf-8');

      // Values were written in place.
      expect(written).toContain(
        'GOOGLE_WEB_CLIENT_ID=1234567890-abcdefg.apps.googleusercontent.com'
      );
      expect(written).toContain('GOOGLE_CLIENT_SECRET=GOCSPX-real-google-secret');
      expect(written).toContain('GITHUB_CLIENT_ID=Iv1.real_github_id');
      expect(written).toContain('GITHUB_CLIENT_SECRET=real_github_secret_value');

      // Comments and untouched lines are preserved.
      expect(written).toContain('# OAuth — Google');
      expect(written).toContain('# OAuth — GitHub');
      expect(written).toContain('# Auth service backend env');
      expect(written).toContain(
        'BETTER_AUTH_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      );

      // A follow-up report now finds nothing.
      const after = await runConfig({});
      expect(after.findings).toEqual([]);
    });

    it('skips fields left blank (idempotent — placeholder stays)', async () => {
      await writeFixture(googleGithubAuth, PLACEHOLDER_ENV);

      // Empty answers → every field skipped, nothing written.
      vi.mocked(inquirer.prompt).mockResolvedValue({ value: '' });

      await runConfig({ interactive: true });

      const written = await fs.readFile(path.join(projectDir, 'auth', 'backend', '.env'), 'utf-8');
      expect(written).toContain('GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID');
    });
  });

  describe('docs drift guard', () => {
    it('mentions every registry integration name and field key in the docs guide', async () => {
      const guidePath = path.join(
        __dirname,
        '..',
        '..',
        'docs',
        'app',
        'docs',
        'guides',
        'configuring-integrations',
        'page.mdx'
      );
      const guide = await fs.readFile(guidePath, 'utf-8');

      for (const spec of INTEGRATIONS) {
        expect(guide, `docs guide is missing integration name "${spec.name}"`).toContain(spec.name);
        for (const field of spec.fields) {
          expect(guide, `docs guide is missing field key "${field.key}" (${spec.id})`).toContain(
            field.key
          );
        }
      }
    });
  });
});
