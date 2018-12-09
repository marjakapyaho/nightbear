import * as Lint from 'tslint';
import * as ts from 'typescript';

// When making changes, remember to recompile:
// $ tsc contrib/tslint/suspiciousArrayAccessRule.ts

// @see https://palantir.github.io/tslint/develop/custom-rules/
export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ArrayAccessWalker(sourceFile, this.getOptions()));
  }
}

class ArrayAccessWalker extends Lint.RuleWalker {
  public visitElementAccessExpression(node: ts.ElementAccessExpression) {
    if (node.argumentExpression.kind === ts.SyntaxKind.NumericLiteral) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          'suspicious array access with number literal; use e.g. first() instead; see https://github.com/Microsoft/TypeScript/issues/9235',
        ),
      );
    }
    super.visitElementAccessExpression(node); // call the base version of this visitor to actually parse this node
  }
}
