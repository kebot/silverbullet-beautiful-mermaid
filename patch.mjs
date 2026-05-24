// Post-build patches for running in a SilverBullet plug (web worker) context.
//
// Patch 1 — elk-worker.min.js environment detection:
//   elk-worker.min.js checks `typeof document === "undefined" && typeof self !== "undefined"`
//   and enters a web-worker setup path instead of exporting its Worker class, leaving
//   _Worker as undefined. Fix: tighten the condition to also require `typeof module3 === "undefined"`
//   so that when running inside esbuild's module wrapper (where module3 is defined) the
//   export path runs instead.
//
// Patch 2 — ensureElk() self restoration:
//   ensureElk() in beautiful-mermaid tries `g.self = origSelf` after new ELKBundled().
//   In a web worker, self is a getter-only property on WorkerGlobalScope and cannot be
//   assigned, throwing "Cannot set property self of # which has only a getter".
//   Fix: wrap the assignment in try/catch.
import { readFileSync, writeFileSync } from "fs";

const file = "mermaid.plug.js";
let src = readFileSync(file, "utf8");
let changed = false;

// Patch 1
const p1needle = "if (typeof document === Yve && typeof self !== Yve) {";
const p1replacement = "if (typeof document === Yve && typeof self !== Yve && typeof module3 === Yve) {";
if (src.includes(p1needle)) {
  src = src.replace(p1needle, p1replacement);
  console.log("patch.mjs: applied patch 1 (elk-worker module detection)");
  changed = true;
} else {
  console.warn("patch.mjs: patch 1 pattern not found — skipping");
}

// Patch 2
const p2needle = "  if (hadSelf) g.self = origSelf;";
const p2replacement = "  try { if (hadSelf) g.self = origSelf; } catch (_) {}";
if (src.includes(p2needle)) {
  src = src.replace(p2needle, p2replacement);
  console.log("patch.mjs: applied patch 2 (ensureElk self restore)");
  changed = true;
} else {
  console.warn("patch.mjs: patch 2 pattern not found — skipping");
}

if (changed) writeFileSync(file, src, "utf8");
