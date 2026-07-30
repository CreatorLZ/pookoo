import * as ts from "typescript";
import { Usage, CallType } from "@pookoo/shared";

export interface ParseTypeScriptOptions {
  filePath: string;
}

export function parseTypeScriptSource(content: string, options: ParseTypeScriptOptions): Usage[] {
  const usages: Usage[] = [];
  const sourceFile = ts.createSourceFile(options.filePath, content, ts.ScriptTarget.Latest, true);

  function getLineAndColumn(
    pos: number,
    endPos: number
  ): { lineNumber: number; columnRange: [number, number] } {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
    const endChar = sourceFile.getLineAndCharacterOfPosition(endPos).character;
    return {
      lineNumber: line + 1,
      columnRange: [character + 1, endChar + 1]
    };
  }

  function extractFallback(node: ts.Node): string | undefined {
    const parent = node.parent;
    if (parent && ts.isBinaryExpression(parent)) {
      const operator = parent.operatorToken.kind;
      if (
        operator === ts.SyntaxKind.BarBarToken ||
        operator === ts.SyntaxKind.QuestionQuestionToken
      ) {
        if (parent.left === node) {
          return parent.right.getText(sourceFile).replace(/^['"]|['"]$/g, "");
        }
      }
    }
    return undefined;
  }

  function visit(node: ts.Node) {
    // 1. Direct Member Expression: process.env.FOO or import.meta.env.FOO
    if (ts.isPropertyAccessExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);
      const isProcessEnv = expressionText === "process.env";
      const isImportMetaEnv = expressionText === "import.meta.env";

      if (isProcessEnv || isImportMetaEnv) {
        const itemKey = node.name.getText(sourceFile);
        const { lineNumber, columnRange } = getLineAndColumn(
          node.getStart(sourceFile),
          node.getEnd()
        );
        const callType: CallType = isImportMetaEnv ? "FRAMEWORK_PUBLIC" : "DIRECT_MEMBER";
        const fallbackValue = extractFallback(node);

        usages.push({
          id: `${options.filePath}:${lineNumber}:${columnRange[0]}`,
          itemKey,
          sourceLocation: {
            filePath: options.filePath,
            lineNumber,
            columnRange
          },
          accessorPattern: node.getText(sourceFile),
          callType,
          fallbackValue
        });
      }
    }

    // 2. Element Access Expression: process.env['FOO'] or process.env[dynamicKey]
    if (ts.isElementAccessExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);
      if (expressionText === "process.env" || expressionText === "import.meta.env") {
        const argument = node.argumentExpression;
        const { lineNumber, columnRange } = getLineAndColumn(
          node.getStart(sourceFile),
          node.getEnd()
        );

        if (ts.isStringLiteral(argument)) {
          const itemKey = argument.text;
          usages.push({
            id: `${options.filePath}:${lineNumber}:${columnRange[0]}`,
            itemKey,
            sourceLocation: {
              filePath: options.filePath,
              lineNumber,
              columnRange
            },
            accessorPattern: node.getText(sourceFile),
            callType: "DIRECT_MEMBER",
            fallbackValue: extractFallback(node)
          });
        } else {
          // Dynamic Computed Indexing: process.env[variable]
          usages.push({
            id: `${options.filePath}:${lineNumber}:${columnRange[0]}`,
            itemKey: "<DYNAMIC_COMPUTED>",
            sourceLocation: {
              filePath: options.filePath,
              lineNumber,
              columnRange
            },
            accessorPattern: node.getText(sourceFile),
            callType: "DYNAMIC_COMPUTED"
          });
        }
      }
    }

    // 3. Object Destructuring: const { PORT, HOST } = process.env
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const initText = node.initializer.getText(sourceFile);
      if (initText === "process.env" || initText === "import.meta.env") {
        if (ts.isObjectBindingPattern(node.name)) {
          for (const element of node.name.elements) {
            if (ts.isBindingElement(element)) {
              const itemKey = element.propertyName
                ? element.propertyName.getText(sourceFile)
                : element.name.getText(sourceFile);

              const { lineNumber, columnRange } = getLineAndColumn(
                element.getStart(sourceFile),
                element.getEnd()
              );
              const fallbackValue = element.initializer
                ? element.initializer.getText(sourceFile).replace(/^['"]|['"]$/g, "")
                : undefined;

              usages.push({
                id: `${options.filePath}:${lineNumber}:${columnRange[0]}`,
                itemKey,
                sourceLocation: {
                  filePath: options.filePath,
                  lineNumber,
                  columnRange
                },
                accessorPattern: `const { ${itemKey} } = ${initText}`,
                callType: "DESTRUCTURED",
                fallbackValue
              });
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return usages;
}
