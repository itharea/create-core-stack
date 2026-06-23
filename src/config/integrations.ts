/**
 * ---------------------------------------------------------------------------
 * Integration registry — the single source of truth for `stackr config`
 * and the "Configuring integrations" docs guide.
 * ---------------------------------------------------------------------------
 *
 * This file is intentionally **pure types + constants** — no runtime imports
 * that would pull in file I/O (mirrors the `src/types/config-file.ts`
 * convention). That keeps it safe to import from the command, from tests, and
 * from doc tooling without side effects.
 *
 * Each `IntegrationSpec` declares where its placeholder values live (backend
 * `.env`, web `.env`, or mobile `app.json` under a specific `extra.*` path),
 * which service kind it applies to, when it is enabled for a given
 * `ServiceEntry`, and the exact placeholder strings emitted by the templates.
 * The `placeholders` arrays are copied byte-for-byte from the templates so the
 * `isUnconfigured` check below can recognise an untouched value.
 */

import type { ServiceEntry } from '../types/config-file.js';

/** Broad grouping used to organise integrations in the command and the docs. */
export type IntegrationCategory = 'oauth' | 'email' | 'mobile-sdk';

/**
 * Where an integration's placeholder value lives. `mobile-app-json` carries
 * the dotted path under `expo.extra.*` so the command can read the value
 * straight out of `app.json` (e.g. `revenueCat.iosKey`).
 */
export type FieldSource =
  | { kind: 'backend-env' }
  | { kind: 'web-env' }
  | { kind: 'mobile-app-json'; extraPath: string };

/** A single configurable value within an integration. */
export interface IntegrationField {
  /** The env var name or `app.json` field name, e.g. `GOOGLE_WEB_CLIENT_ID`. */
  key: string;
  /** Human-readable label shown in the command output and docs. */
  label: string;
  /**
   * Exact placeholder strings the templates emit for this field. A value that
   * still equals one of these (after trimming) is considered unconfigured.
   */
  placeholders: string[];
  /** Whether the field must be set for the integration to function. */
  required: boolean;
  /** Optional one-line guidance, e.g. where to find the value. */
  hint?: string;
}

/** One integration: its identity, where it lives, and how to configure it. */
export interface IntegrationSpec {
  /** Stable identifier, e.g. `google-oauth`, `revenuecat`. */
  id: string;
  /** Display name, e.g. `Google OAuth`. */
  name: string;
  category: IntegrationCategory;
  /** Where this integration's fields are stored. */
  source: FieldSource;
  /** Which service kind this integration can attach to. */
  appliesToKind: 'auth' | 'base' | 'any';
  /**
   * Predicate that reads a `ServiceEntry` and reports whether the integration
   * is actually turned on for that service. Uses defensive optional chaining
   * because older configs may omit `authConfig` / `integrations` / `mobile`.
   */
  enabledWhen: (svc: ServiceEntry) => boolean;
  /** Provider dashboard where the values are obtained. */
  dashboardUrl: string;
  /** Docs anchor for the long-form setup guide. */
  docsPath: string;
  /** Ordered setup steps, mirrored by the command and the docs guide. */
  setupSteps: string[];
  /** The configurable fields for this integration. */
  fields: IntegrationField[];
}

/** Shared docs path for every integration's long-form guide. */
const DOCS_PATH = '/docs/guides/configuring-integrations';

/**
 * The integration registry. Order here drives presentation order in the
 * command and the docs.
 */
export const INTEGRATIONS: IntegrationSpec[] = [
  {
    id: 'google-oauth',
    name: 'Google OAuth',
    category: 'oauth',
    source: { kind: 'backend-env' },
    appliesToKind: 'auth',
    enabledWhen: (svc) => svc.authConfig?.providers.google === true,
    dashboardUrl: 'https://console.cloud.google.com/',
    docsPath: DOCS_PATH,
    setupSteps: [
      'Open the Google Cloud Console.',
      'Create OAuth 2.0 credentials for Web, iOS, and Android.',
      'Copy the Web client ID into GOOGLE_WEB_CLIENT_ID and the client secret into GOOGLE_CLIENT_SECRET in the backend .env.',
      'iOS and Android client IDs are configured in mobile/app.json under extra.googleOAuth.',
    ],
    fields: [
      {
        key: 'GOOGLE_WEB_CLIENT_ID',
        label: 'Web client ID',
        placeholders: ['YOUR_GOOGLE_WEB_CLIENT_ID'],
        required: true,
        hint: 'Used for ID token audience verification on the backend.',
      },
      {
        key: 'GOOGLE_CLIENT_SECRET',
        label: 'Client secret',
        placeholders: ['YOUR_GOOGLE_CLIENT_SECRET'],
        required: true,
        hint: 'Used for backend token exchange.',
      },
    ],
  },
  {
    id: 'apple-oauth',
    name: 'Apple Sign In',
    category: 'oauth',
    source: { kind: 'backend-env' },
    appliesToKind: 'auth',
    enabledWhen: (svc) => svc.authConfig?.providers.apple === true,
    dashboardUrl: 'https://developer.apple.com/',
    docsPath: DOCS_PATH,
    setupSteps: [
      'Open the Apple Developer portal.',
      'Create a Service ID for the web OAuth flow and set APPLE_SERVICE_ID.',
      'Set APPLE_BUNDLE_ID to your app bundle id for native iOS ID token verification.',
      'Generate a client secret JWT signed with your Apple private key and set APPLE_CLIENT_SECRET (it expires every 180 days).',
    ],
    fields: [
      {
        key: 'APPLE_SERVICE_ID',
        label: 'Service ID',
        placeholders: ['YOUR_APPLE_SERVICE_ID'],
        required: true,
        hint: 'For the web OAuth flow.',
      },
      {
        key: 'APPLE_BUNDLE_ID',
        label: 'Bundle ID',
        placeholders: ['com.yourcompany.yourapp'],
        required: true,
        hint: 'For native iOS ID token verification (must match your app).',
      },
      {
        key: 'APPLE_CLIENT_SECRET',
        label: 'Client secret',
        placeholders: ['YOUR_APPLE_CLIENT_SECRET'],
        required: true,
        hint: 'JWT signed with your Apple private key; expires every 180 days.',
      },
    ],
  },
  {
    id: 'github-oauth',
    name: 'GitHub OAuth',
    category: 'oauth',
    source: { kind: 'backend-env' },
    appliesToKind: 'auth',
    enabledWhen: (svc) => svc.authConfig?.providers.github === true,
    dashboardUrl: 'https://github.com/settings/developers',
    docsPath: DOCS_PATH,
    setupSteps: [
      'Open GitHub Developer settings and register a new OAuth app.',
      'Copy the client ID into GITHUB_CLIENT_ID in the backend .env.',
      'Generate a client secret and copy it into GITHUB_CLIENT_SECRET.',
    ],
    fields: [
      {
        key: 'GITHUB_CLIENT_ID',
        label: 'Client ID',
        placeholders: ['YOUR_GITHUB_CLIENT_ID'],
        required: true,
      },
      {
        key: 'GITHUB_CLIENT_SECRET',
        label: 'Client secret',
        placeholders: ['YOUR_GITHUB_CLIENT_SECRET'],
        required: true,
      },
    ],
  },
  {
    id: 'email-smtp',
    name: 'Email (SMTP)',
    category: 'email',
    source: { kind: 'backend-env' },
    appliesToKind: 'auth',
    enabledWhen: (svc) =>
      svc.authConfig?.emailVerification === true || svc.authConfig?.passwordReset === true,
    dashboardUrl: 'https://support.google.com/accounts/answer/185833',
    docsPath: DOCS_PATH,
    setupSteps: [
      'Choose an SMTP provider (the template defaults to Gmail at smtp.gmail.com:587).',
      'For Gmail, create an app password and set it as SMTP_PASS.',
      'Set SMTP_USER to the sending account and EMAIL_FROM to the from address.',
    ],
    fields: [
      {
        key: 'SMTP_USER',
        label: 'SMTP user',
        placeholders: ['your-email@gmail.com'],
        required: true,
        hint: 'The sending account.',
      },
      {
        key: 'SMTP_PASS',
        label: 'SMTP password',
        placeholders: ['your-app-password'],
        required: true,
        hint: 'For Gmail, use an app password rather than your account password.',
      },
    ],
  },
  {
    id: 'revenuecat',
    name: 'RevenueCat',
    category: 'mobile-sdk',
    source: { kind: 'mobile-app-json', extraPath: 'revenueCat' },
    appliesToKind: 'any',
    enabledWhen: (svc) =>
      svc.integrations?.revenueCat.enabled === true && svc.mobile?.enabled === true,
    dashboardUrl: 'https://app.revenuecat.com/',
    docsPath: DOCS_PATH,
    setupSteps: [
      'Open the RevenueCat dashboard and create a project.',
      'Copy the iOS public API key into extra.revenueCat.iosKey in mobile/app.json.',
      'Copy the Android public API key into extra.revenueCat.androidKey in mobile/app.json.',
      'Rebuild the app so the keys are embedded via expo-constants.',
    ],
    fields: [
      {
        key: 'iosKey',
        label: 'iOS API key',
        placeholders: ['YOUR_IOS_API_KEY_HERE'],
        required: true,
      },
      {
        key: 'androidKey',
        label: 'Android API key',
        placeholders: ['YOUR_ANDROID_API_KEY_HERE'],
        required: true,
      },
    ],
  },
  {
    id: 'adjust',
    name: 'Adjust',
    category: 'mobile-sdk',
    source: { kind: 'mobile-app-json', extraPath: 'adjust' },
    appliesToKind: 'any',
    enabledWhen: (svc) => svc.integrations?.adjust.enabled === true && svc.mobile?.enabled === true,
    dashboardUrl: 'https://dash.adjust.com/',
    docsPath: DOCS_PATH,
    setupSteps: [
      'Open the Adjust dashboard and create an app.',
      'Copy the app token into extra.adjust.appToken in mobile/app.json.',
      'Set extra.adjust.environment to "sandbox" while testing and "production" for release.',
      'Rebuild the app so the values are embedded via expo-constants.',
    ],
    fields: [
      {
        key: 'appToken',
        label: 'App token',
        placeholders: ['YOUR_ADJUST_APP_TOKEN_HERE'],
        required: true,
      },
    ],
  },
];

/**
 * Returns `true` when `value` is still an untouched placeholder for `field`:
 * either it is undefined / empty / whitespace, or (after trimming) it exactly
 * equals one of the field's known placeholder strings.
 *
 * This is the pure, unit-tested core that both the command and any doc tooling
 * rely on to decide whether an integration value has actually been filled in.
 */
export function isUnconfigured(value: string | undefined, field: IntegrationField): boolean {
  if (value === undefined) {
    return true;
  }
  const trimmed = value.trim();
  if (trimmed === '') {
    return true;
  }
  return field.placeholders.some((placeholder) => placeholder.trim() === trimmed);
}
