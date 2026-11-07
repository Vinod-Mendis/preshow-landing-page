import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    // The vendored hairline-create skill, and the figures' shared fragments,
    // which only stand on their own once figures/build.mjs puts them in front of a figure.
    ".agents/**",
    "figures/booth.js",
    "figures/kit.js",
  ]),
]);

export default eslintConfig;
