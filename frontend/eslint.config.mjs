import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const dynamicIdentifiers = new Set(["params", "searchParams"]);
const asyncHeaderApis = new Set(["headers", "cookies"]);

const serverUtilityAllowList = [
  "frontend/lib/supabase/server.ts",
  "frontend/lib/auth/server-user.ts",
];

const noSyncDynamicApiRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow synchronous access to Next.js dynamic APIs (params, searchParams, headers, cookies).",
    },
    schema: [],
    messages: {
      noMemberAccess: "Do not access `{{name}}` synchronously. Use React.use(...) or await appropriately.",
      noDestructure: "Do not destructure `{{name}}` directly. Wrap with React.use(...) first.",
      noSyncCall: "Call `{{name}}()` via React.use(...) or await it; synchronous usage is disallowed.",
      noAnyCast: "Do not cast `{{name}}` to `any`. Resolve it with React.use(...) instead.",
    },
  },
  create(context) {
    const filename = context.filename || "";
    const isServerUtility = serverUtilityAllowList.some((allowed) => filename.endsWith(allowed));
    const isUseCall = (node) =>
      node &&
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === "use";

    return {
      MemberExpression(node) {
        if (node.computed || node.object.type !== "Identifier") return;
        if (!dynamicIdentifiers.has(node.object.name)) return;
        context.report({
          node,
          messageId: "noMemberAccess",
          data: { name: node.object.name },
        });
      },
      VariableDeclarator(node) {
        if (node.id.type !== "ObjectPattern") return;
        if (node.init?.type === "CallExpression" && isUseCall(node.init)) return;
        if (node.init?.type === "Identifier" && dynamicIdentifiers.has(node.init.name)) {
          context.report({
            node,
            messageId: "noDestructure",
            data: { name: node.init.name },
          });
        }
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier") return;
        const name = node.callee.name;
        if (asyncHeaderApis.has(name)) {
          if (isServerUtility) return;
          const parent = node.parent;
          const isAwaited = parent?.type === "AwaitExpression";
          const wrappedWithUse =
            parent &&
            parent.type === "CallExpression" &&
            parent.callee.type === "Identifier" &&
            parent.callee.name === "use";

          if (!isAwaited && !wrappedWithUse) {
            context.report({
              node,
              messageId: "noSyncCall",
              data: { name },
            });
          }
        }
      },
      TSAsExpression(node) {
        if (node.typeAnnotation.type !== "TSAnyKeyword") return;
        if (node.expression.type === "Identifier" && dynamicIdentifiers.has(node.expression.name)) {
          context.report({
            node,
            messageId: "noAnyCast",
            data: { name: node.expression.name },
          });
        }
      },
      TSTypeAssertion(node) {
        if (node.typeAnnotation.type !== "TSAnyKeyword") return;
        if (node.expression.type === "Identifier" && dynamicIdentifiers.has(node.expression.name)) {
          context.report({
            node,
            messageId: "noAnyCast",
            data: { name: node.expression.name },
          });
        }
      },
    };
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      ppuk: {
        rules: {
          "no-sync-dynamic-api": noSyncDynamicApiRule,
        },
      },
    },
    rules: {
      "ppuk/no-sync-dynamic-api": "error",
    },
  },
  {
    files: [
      "app/**/*.tsx",
    ],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
]);

export default eslintConfig;
