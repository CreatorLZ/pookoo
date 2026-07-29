import { Finding, KnowledgeGraphData, RuleDefinition } from "@pookoo/shared";

/**
 * Variables implicitly consumed by Node.js runtime or framework internals
 * without requiring explicit process.env references in user source code.
 */
const IMPLICIT_VARIABLES = new Set([
  "NODE_ENV",
  "NODE_OPTIONS",
  "NODE_PATH",
  "NODE_DEBUG",
  "NODE_NO_WARNINGS",
  "NODE_EXTRA_CA_CERTS",
  "NODE_TLS_REJECT_UNAUTHORIZED",
  "PORT",
  "HOST",
  "HOSTNAME",
  "TZ",
  "CI",
  "DEBUG",
]);

/**
 * Well-known SDK prefixes whose variables are consumed internally by
 * their respective packages inside node_modules. Since the scanner
 * intentionally skips node_modules, these variables appear unreferenced
 * even though they are actively used at runtime.
 *
 * Instead of maintaining an ever-growing allowlist of individual variable
 * names, we match by prefix and downgrade the finding to INFO severity.
 */
const SDK_PREFIXES = [
  "CLERK_",
  "NEXT_PUBLIC_CLERK_",
  "STRIPE_",
  "NEXT_PUBLIC_STRIPE_",
  "FIREBASE_",
  "NEXT_PUBLIC_FIREBASE_",
  "SENTRY_",
  "NEXT_PUBLIC_SENTRY_",
  "AUTH0_",
  "SUPABASE_",
  "NEXT_PUBLIC_SUPABASE_",
  "UPLOADTHING_",
  "RESEND_",
  "UPSTASH_",
  "VERCEL_",
  "NEXTAUTH_",
  "GOOGLE_",
  "NEXT_PUBLIC_GOOGLE_",
  "AWS_",
  "AZURE_",
  "REDIS_",
  "POSTMARK_",
  "SENDGRID_",
  "TWILIO_",
  "PUSHER_",
  "NEXT_PUBLIC_PUSHER_",
  "ALGOLIA_",
  "NEXT_PUBLIC_ALGOLIA_",
  "CLOUDINARY_",
  "NEXT_PUBLIC_CLOUDINARY_",
  "MIXPANEL_",
  "NEXT_PUBLIC_MIXPANEL_",
  "POSTHOG_",
  "NEXT_PUBLIC_POSTHOG_",
  "MAPBOX_",
  "NEXT_PUBLIC_MAPBOX_",
  "VITE_CLERK_",
  "VITE_STRIPE_",
  "VITE_FIREBASE_",
  "VITE_SENTRY_",
  "VITE_SUPABASE_",
  "VITE_GOOGLE_",
  "REACT_APP_",
];

function matchesSdkPrefix(key: string): string | undefined {
  for (const prefix of SDK_PREFIXES) {
    if (key.startsWith(prefix)) {
      return prefix.replace(/_$/, "");
    }
  }
  return undefined;
}

export const noStaticReferenceRule: RuleDefinition = {
  id: "NO_STATIC_REFERENCE_FOUND",
  name: "No Static Reference Found",
  description: "Detects declared configuration variables for which no static source-code reference was found.",
  defaultSeverity: "INFO",
  evaluate(graph: KnowledgeGraphData): Finding[] {
    const findings: Finding[] = [];
    const itemNodes = graph.nodes.filter((n) => n.kind === "ConfigurationItem");
    const consumesEdges = graph.edges.filter((e) => e.kind === "CONSUMES");

    for (const itemNode of itemNodes) {
      const key = itemNode.label;

      // Skip variables implicitly consumed by runtime/framework
      if (IMPLICIT_VARIABLES.has(key)) continue;

      const isConsumed = consumesEdges.some((e) => e.targetId === itemNode.id);
      if (isConsumed) continue;

      // Check if this variable matches a known SDK prefix
      const sdkMatch = matchesSdkPrefix(key);

      if (sdkMatch) {
        findings.push({
          id: `finding:noreference:${key}`,
          ruleId: "NO_STATIC_REFERENCE_FOUND",
          severity: "INFO",
          targetKey: key,
          message: `No static source-code reference found for '${key}'. It matches the ${sdkMatch} SDK prefix and is likely consumed internally.`,
          explanation: `This variable is likely consumed internally by the ${sdkMatch} package within node_modules, which is not scanned.`,
          remediation: `Verify that '${key}' is required by the ${sdkMatch} SDK documentation. Remove it only if you have confirmed it is no longer needed.`
        });
      } else {
        findings.push({
          id: `finding:noreference:${key}`,
          ruleId: "NO_STATIC_REFERENCE_FOUND",
          severity: "INFO",
          targetKey: key,
          message: `No static source-code reference found for '${key}'.`,
          explanation: "No direct process.env reference was found in scanned source files. The variable may still be consumed by dependencies, scripts, or runtime configuration.",
          remediation: `Investigate whether '${key}' is still required. Do not remove it based solely on this finding.`
        });
      }
    }

    return findings;
  }
};
