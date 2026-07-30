import { Finding, KnowledgeGraphData, RuleDefinition } from "@pookoo/shared";

/**
 * Sensitive keywords that strongly indicate private credentials.
 * Deliberately excludes "KEY", "TOKEN", and "AUTH" because they produce
 * excessive false positives on legitimately public variables like
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
const SENSITIVE_KEYWORDS = ["SECRET", "PASSWORD", "PRIVATE"];

/**
 * Known variable name patterns that are safe for client-side exposure
 * despite containing words that might otherwise trigger the rule.
 * These are well-documented SDK patterns where the provider explicitly
 * designs the value for browser/client usage.
 */
const KNOWN_SAFE_PATTERNS: RegExp[] = [
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?CLERK_PUBLISHABLE_KEY$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?STRIPE_PUBLISHABLE_KEY$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?GOOGLE_MAPS_API_KEY$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?GOOGLE_ANALYTICS_ID$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?SENTRY_DSN$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?MIXPANEL_TOKEN$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?POSTHOG_KEY$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?SEGMENT_WRITE_KEY$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?ALGOLIA_APP_ID$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?ALGOLIA_SEARCH_KEY$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?RECAPTCHA_SITE_KEY$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?HOTJAR_ID$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?GTM_ID$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?GA_TRACKING_ID$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?INTERCOM_APP_ID$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?CRISP_WEBSITE_ID$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?CLOUDINARY_CLOUD_NAME$/,
  /^(NEXT_PUBLIC_|VITE_|REACT_APP_)?MAPBOX_ACCESS_TOKEN$/
];

export const publicSecretRiskRule: RuleDefinition = {
  id: "PUBLIC_PREFIX_SECRET_RISK",
  name: "Public Client Secret Leak Risk",
  description:
    "Detects variables using public framework client prefixes that contain genuinely sensitive credential keywords.",
  defaultSeverity: "CRITICAL",
  evaluate(graph: KnowledgeGraphData): Finding[] {
    const findings: Finding[] = [];
    const itemNodes = graph.nodes.filter((n) => n.kind === "ConfigurationItem");

    for (const itemNode of itemNodes) {
      const key = itemNode.label;
      const upperKey = key.toUpperCase();
      const isPublicPrefix =
        upperKey.startsWith("NEXT_PUBLIC_") ||
        upperKey.startsWith("VITE_") ||
        upperKey.startsWith("REACT_APP_");

      if (!isPublicPrefix) continue;

      // 1. Only flag if a genuinely sensitive keyword is present
      const matchedKeywords = SENSITIVE_KEYWORDS.filter((kw) => upperKey.includes(kw));
      if (matchedKeywords.length === 0) continue;

      // 2. Check if the name contains a known-safe SDK pattern (anchored)
      const isKnownSafe = KNOWN_SAFE_PATTERNS.some((pattern) => pattern.test(upperKey));
      if (isKnownSafe) continue;

      // 3. We do NOT apply SAFE_MODIFIERS suppression here if a sensitive keyword was found.
      // For example, NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY will trigger a flag because
      // the generic "PUBLISHABLE" modifier should not hide the explicit "SECRET" keyword.

      findings.push({
        id: `finding:publicsecret:${key}`,
        ruleId: "PUBLIC_PREFIX_SECRET_RISK",
        severity: "CRITICAL",
        targetKey: key,
        message: `Public client variable '${key}' contains a sensitive keyword (${matchedKeywords.join(", ")}). This may expose private credentials to the browser.`,
        explanation:
          "Public client framework prefixes expose variables to client-side browser bundles, creating credential leak risks.",
        remediation: `Rename '${key}' to a server-only variable without public client prefixes if it contains private credentials.`
      });
    }

    return findings;
  }
};
