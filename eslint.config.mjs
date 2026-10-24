import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    settings: {
      next: {
        rootDir: ["apps/landing/", "apps/admin/"],
      },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores(["**/.next/**", "**/.open-next/**", "**/.wrangler/**", "out/**", "build/**", "structure/**", ".npm-cache/**", "test-results/**"]),
]);

export default eslintConfig;
