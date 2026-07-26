import { ScanResult } from "@pookoo/shared";

export function formatJsonReport(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

