import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { collectListings } from "./catalog.mjs";
import { validateManifest } from "./manifest.mjs";

export async function readProjectListings(projectDirectory) {
  const projects = [];
  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await collect(path);
      else if (entry.name.endsWith(".json")) projects.push(JSON.parse(await readFile(path, "utf8")));
    }
  }
  await collect(projectDirectory);
  return validateManifest(collectListings(projects));
}
