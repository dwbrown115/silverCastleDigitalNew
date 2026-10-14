import { writeFile, mkdir, copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readProjectListings } from "../server/stripe/project-config.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, process.argv[2] || ".artifacts/stripe/stripe-catalog.zip");
const listings = await readProjectListings(join(root, "src/Data/projects"));
const staging = await mkdtemp(join(tmpdir(), "silvercastle-stripe-"));
try {
  for (const name of ["catalog.mjs", "manifest.mjs", "lambda.mjs"]) await copyFile(join(root, "server/stripe", name), join(staging, name));
  await writeFile(join(staging, "listings.json"), JSON.stringify(listings, null, 2));
  await mkdir(resolve(output, ".."), { recursive: true });
  await rm(output, { force: true });
  execFileSync("zip", ["-q", output, "catalog.mjs", "manifest.mjs", "lambda.mjs", "listings.json"], { cwd: staging });
  console.log(`Packaged ${listings.length} configured Stripe listing(s): ${output}`);
} finally {
  await rm(staging, { recursive: true, force: true });
}
