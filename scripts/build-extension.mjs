import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("extension");
const target = resolve("extension/dist");
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error("Set VITE_SUPABASE_PUBLISHABLE_KEY before building the extension.");
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const file of [
  "manifest.json",
  "background.js",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "config.js",
]) {
  await cp(resolve(source, file), resolve(target, file));
}
const configPath = resolve(target, "config.js");
const config = (await readFile(configPath, "utf8")).replace(
  "__SUPABASE_PUBLISHABLE_KEY__",
  publishableKey,
);
await writeFile(configPath, config);
console.log(`Extension build ready: ${target}`);
