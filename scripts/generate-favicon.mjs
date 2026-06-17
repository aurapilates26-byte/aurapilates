import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public", "images", "ongle.png");

if (!fs.existsSync(source)) {
  console.error("Missing public/images/ongle.png");
  process.exit(1);
}

const targets = [
  path.join(root, "app", "icon.png"),
  path.join(root, "app", "apple-icon.png"),
  path.join(root, "public", "favicon.png"),
];

for (const target of targets) {
  fs.copyFileSync(source, target);
}

for (const legacy of [
  path.join(root, "app", "icon.svg"),
  path.join(root, "app", "apple-icon.svg"),
  path.join(root, "public", "favicon.svg"),
]) {
  if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
}

console.log("Favicon updated from public/images/ongle.png");
