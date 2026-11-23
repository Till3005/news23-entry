import { createHash } from "node:crypto";
import { closeSync, copyFileSync, mkdirSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const source = join(dirname(fileURLToPath(import.meta.url)), "entry.png");

const handle = openSync(source, "r");
const magic = Buffer.alloc(8);
try {
  readSync(handle, magic, 0, 8, 0);
} finally {
  closeSync(handle);
}
if (!magic.equals(PNG_SIGNATURE)) throw new Error("entry.png is not a PNG");

const targetDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(targetDir, { recursive: true });
const target = join(targetDir, "entry.png");
copyFileSync(source, target);

const sha256Of = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const sourceSha = sha256Of(source);
const targetSha = sha256Of(target);
if (sourceSha !== targetSha) {
  throw new Error(`copy integrity failed: source sha256 ${sourceSha} != copy sha256 ${targetSha}`);
}

const sourceSize = statSync(source).size;
console.log(`entry.png -> ${target} (${sourceSize} bytes)`);
console.log(`source sha256 ${sourceSha}`);
console.log(`copy   sha256 ${targetSha}`);
