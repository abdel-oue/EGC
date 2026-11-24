// Run from an app directory after `opennextjs-cloudflare build`, before deploy.
// OpenNext copies every .env* value into the Worker bundle; keep only NEXT_PUBLIC_* values.
// Server secrets come from `wrangler secret put` at runtime.
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const file = ".open-next/cloudflare/next-env.mjs";
const modes = await import(pathToFileURL(file));
const publicOnly = (vars) => Object.fromEntries(
  Object.entries(vars).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
);

writeFileSync(file, Object.entries(modes)
  .map(([mode, vars]) => `export const ${mode} = ${JSON.stringify(publicOnly(vars))};\n`)
  .join(""));
console.log(`Stripped server-only values from ${file}`);
