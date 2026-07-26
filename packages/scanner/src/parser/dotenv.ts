import { ConfigurationItem } from "@pookoo/shared";

export interface ParseDotenvOptions {
  filePath: string;
}

export function parseDotenv(content: string, options: ParseDotenvOptions): ConfigurationItem[] {
  const items: ConfigurationItem[] = [];
  const lines = content.split(/\r?\n/);

  let precedingComment = "";

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      precedingComment = "";
      continue;
    }

    if (trimmed.startsWith("#")) {
      const commentText = trimmed.replace(/^#\s*/, "");
      precedingComment = precedingComment ? `${precedingComment}\n${commentText}` : commentText;
      continue;
    }

    // Strip leading 'export ' if present
    let lineToParse = trimmed;
    if (lineToParse.startsWith("export ")) {
      lineToParse = lineToParse.substring(7).trim();
    }

    const equalIndex = lineToParse.indexOf("=");
    if (equalIndex === -1) {
      precedingComment = "";
      continue;
    }

    const key = lineToParse.substring(0, equalIndex).trim();

    // Key validation: standard identifier (e.g. ALPHA_NUMERIC_UNDERSCORE)
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      precedingComment = "";
      continue;
    }

    let valPart = lineToParse.substring(equalIndex + 1).trim();
    let rawComment = precedingComment;
    let defaultValue: string | undefined;

    // Check for inline comment
    let inlineComment = "";
    if (valPart.startsWith('"')) {
      const closingQuote = valPart.indexOf('"', 1);
      if (closingQuote !== -1) {
        defaultValue = valPart.substring(1, closingQuote);
        const remainder = valPart.substring(closingQuote + 1).trim();
        if (remainder.startsWith("#")) {
          inlineComment = remainder.replace(/^#\s*/, "");
        }
      } else {
        defaultValue = valPart.substring(1);
      }
    } else if (valPart.startsWith("'")) {
      const closingQuote = valPart.indexOf("'", 1);
      if (closingQuote !== -1) {
        defaultValue = valPart.substring(1, closingQuote);
        const remainder = valPart.substring(closingQuote + 1).trim();
        if (remainder.startsWith("#")) {
          inlineComment = remainder.replace(/^#\s*/, "");
        }
      } else {
        defaultValue = valPart.substring(1);
      }
    } else {
      const hashIndex = valPart.indexOf("#");
      if (hashIndex !== -1) {
        inlineComment = valPart.substring(hashIndex + 1).trim();
        valPart = valPart.substring(0, hashIndex).trim();
      }
      defaultValue = valPart;
    }

    if (inlineComment) {
      rawComment = rawComment ? `${rawComment}\n${inlineComment}` : inlineComment;
    }

    items.push({
      key,
      sourceLocation: {
        filePath: options.filePath,
        lineNumber: lineNum,
        columnRange: [1, rawLine.length + 1]
      },
      defaultValue: defaultValue || undefined,
      isRequired: !defaultValue,
      rawComment: rawComment || undefined
    });

    precedingComment = "";
  }

  return items;
}

