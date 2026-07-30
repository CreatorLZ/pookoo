/**
 * Core Domain Primitive Types for Pookoo
 * Defined per GLOSSARY.md specifications.
 */

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type CallType =
  | "DIRECT_MEMBER" // process.env.FOO
  | "DESTRUCTURED" // const { FOO } = process.env
  | "FRAMEWORK_PUBLIC" // import.meta.env.VITE_FOO
  | "UTILITY_WRAPPER" // config.get('FOO')
  | "DYNAMIC_COMPUTED"; // process.env[computedKey]

export interface SourceLocation {
  filePath: string;
  lineNumber: number;
  columnRange: [number, number];
}

export interface ConfigurationItem {
  key: string;
  sourceLocation: SourceLocation;
  defaultValue?: string;
  isRequired: boolean;
  typeSignature?: string;
  inferredFramework?: string;
  rawComment?: string;
}

export interface Usage {
  id: string;
  itemKey: string;
  sourceLocation: SourceLocation;
  accessorPattern: string;
  callType: CallType;
  fallbackValue?: string;
  enclosingFunction?: string;
}

export interface Finding {
  id: string;
  ruleId: string;
  severity: Severity;
  targetKey: string;
  message: string;
  explanation: string;
  remediation: string;
  codeSnippet?: string;
  sourceLocation?: SourceLocation;
}

export type NodeKind = "ConfigurationItem" | "CallSite" | "File" | "Schema" | "ServiceBoundary";
export type EdgeKind = "DECLARES" | "CONSUMES" | "VALIDATES_WITH" | "OVERRIDES" | "DEPENDS_ON";

export interface KnowledgeGraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  metadata: Record<string, unknown>;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: EdgeKind;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  defaultSeverity: Severity;
  evaluate: (graph: KnowledgeGraphData) => Finding[];
}

export interface ScanResult {
  knowledgeGraph: KnowledgeGraphData;
  findings: Finding[];
  healthScore: number;
  scannedFilesCount: number;
}
