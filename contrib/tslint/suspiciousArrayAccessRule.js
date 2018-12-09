"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var ts = require("typescript");
// When making changes, remember to recompile:
// $ tsc contrib/tslint/suspiciousArrayAccessRule.ts
// @see https://palantir.github.io/tslint/develop/custom-rules/
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ArrayAccessWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ArrayAccessWalker = /** @class */ (function (_super) {
    __extends(ArrayAccessWalker, _super);
    function ArrayAccessWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ArrayAccessWalker.prototype.visitElementAccessExpression = function (node) {
        if (node.argumentExpression.kind === ts.SyntaxKind.NumericLiteral) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), 'suspicious array access with number literal; use e.g. first() instead; see https://github.com/Microsoft/TypeScript/issues/9235'));
        }
        _super.prototype.visitElementAccessExpression.call(this, node); // call the base version of this visitor to actually parse this node
    };
    return ArrayAccessWalker;
}(Lint.RuleWalker));
