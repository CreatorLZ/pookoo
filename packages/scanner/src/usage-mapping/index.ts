import { Usage } from "@pookoo/shared";
import { VirtualFile } from "../loader/walker";
import { parseTypeScriptSource } from "../parser/typescript";

export function mapRepositoryUsages(files: VirtualFile[]): Usage[] {
  const allUsages: Usage[] = [];

  for (const file of files) {
    if (file.fileType === "SOURCE") {
      try {
        const fileUsages = parseTypeScriptSource(file.content, { filePath: file.relativePath });
        allUsages.push(...fileUsages);
      } catch {
        // Skip unparseable source files without crashing pipeline
      }
    }
  }

  return allUsages;
}

