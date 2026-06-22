import { describe, it, expect } from 'vitest';
import { URL } from 'node:url';
import {
  INTEGRATIONS,
  isUnconfigured,
  type IntegrationField,
} from '../../src/config/integrations.js';

/**
 * The integration registry (`src/config/integrations.ts`) is the single source
 * of truth for `stackr config` and the docs guide. These tests lock down its
 * structural invariants and the `isUnconfigured` placeholder check so the
 * command and doc tooling can rely on them.
 */
describe('integration registry', () => {
  describe('structural integrity', () => {
    it('has unique integration ids', () => {
      const ids = INTEGRATIONS.map((spec) => spec.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('gives every field at least one placeholder', () => {
      for (const spec of INTEGRATIONS) {
        for (const field of spec.fields) {
          expect(
            field.placeholders.length,
            `${spec.id} → ${field.key} has no placeholders`
          ).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('gives every field a non-empty key', () => {
      for (const spec of INTEGRATIONS) {
        for (const field of spec.fields) {
          expect(field.key.trim(), `${spec.id} has an empty field key`).not.toBe('');
        }
      }
    });

    it('has a dashboardUrl that parses via new URL() for every spec', () => {
      for (const spec of INTEGRATIONS) {
        expect(
          () => new URL(spec.dashboardUrl),
          `${spec.id} has an unparseable dashboardUrl: ${spec.dashboardUrl}`
        ).not.toThrow();
      }
    });
  });

  describe('isUnconfigured', () => {
    // A representative field from the registry to exercise the placeholder path.
    const field: IntegrationField = {
      key: 'GOOGLE_WEB_CLIENT_ID',
      label: 'Web client ID',
      placeholders: ['YOUR_GOOGLE_WEB_CLIENT_ID'],
      required: true,
    };

    it('returns true for undefined', () => {
      expect(isUnconfigured(undefined, field)).toBe(true);
    });

    it('returns true for an empty string', () => {
      expect(isUnconfigured('', field)).toBe(true);
    });

    it('returns true for whitespace-only', () => {
      expect(isUnconfigured('   ', field)).toBe(true);
      expect(isUnconfigured('\t\n ', field)).toBe(true);
    });

    it('returns true for each known placeholder (even with surrounding whitespace)', () => {
      for (const spec of INTEGRATIONS) {
        for (const f of spec.fields) {
          for (const placeholder of f.placeholders) {
            expect(isUnconfigured(placeholder, f), `${spec.id} → ${f.key}`).toBe(true);
            // Trimming is applied before comparison.
            expect(isUnconfigured(`  ${placeholder}  `, f), `${spec.id} → ${f.key}`).toBe(true);
          }
        }
      }
    });

    it('returns false for a realistic real value', () => {
      expect(isUnconfigured('1234567890-abcdefg.apps.googleusercontent.com', field)).toBe(false);
    });

    it('returns false for a real value that merely contains a placeholder as a substring', () => {
      // The check is an exact (trimmed) match, not a substring match.
      expect(isUnconfigured('YOUR_GOOGLE_WEB_CLIENT_ID_real_suffix', field)).toBe(false);
    });
  });
});
