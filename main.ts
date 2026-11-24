import { createHash } from "node:crypto";
import { copyFile, mkdir, open, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SOURCE = resolve(import.meta.dirname, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const TARGET = join(OUT_DIR, "entry.png");

const sha256 = (file) =>
  readFile(file).then((bytes) => createHash("sha256").update(bytes).digest("hex"));

const head = Buffer.alloc(8);
const fh = await open(SOURCE, "r");
await fh.read(head, 0, 8, 0);
await fh.close();

if (!head.equals(PNG_MAGIC)) {
  console.error(`entry.png is not a PNG (magic bytes: ${head.toString("hex")})`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
await copyFile(SOURCE, TARGET);

const [src, dst] = await Promise.all([sha256(SOURCE), sha256(TARGET)]);
if (src !== dst) {
  console.error(`copy mismatch: ${src} != ${dst}`);
  process.exit(1);
}

console.log(`entry.png verified ${src.slice(0, 16)}... -> ${TARGET}`);
