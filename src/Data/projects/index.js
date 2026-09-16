const projectFiles = import.meta.glob("./**/*.json", { eager: true, import: "default" });
const projectAssets = import.meta.glob("./**/*.{png,jpg,jpeg,webp,avif,svg}", {
  eager: true,
  query: "?url",
  import: "default",
});

function resolveLocalAsset(jsonPath, assetPath) {
  if (!assetPath || !assetPath.startsWith("./")) return assetPath;

  const directory = jsonPath.slice(0, jsonPath.lastIndexOf("/") + 1);
  return projectAssets[`${directory}${assetPath.slice(2)}`] || assetPath;
}

function resolveBlurb(jsonPath, blurb) {
  if (typeof blurb === "string") return blurb;
  return { ...blurb, image: resolveLocalAsset(jsonPath, blurb.image) };
}

function prepareContent(jsonPath, content) {
  const prepared = { ...content };
  if (Object.hasOwn(content, "image")) prepared.image = resolveLocalAsset(jsonPath, content.image);
  if (Object.hasOwn(content, "overview")) prepared.overview = content.overview.map((blurb) => resolveBlurb(jsonPath, blurb));
  return prepared;
}

export const projects = Object.entries(projectFiles).map(([jsonPath, project]) => ({
  ...prepareContent(jsonPath, project),
  pages: project.pages?.map((page) => prepareContent(jsonPath, page)) || [],
}));

export const projectsBySlug = projects.reduce((index, project) => {
  index[project.slug] = project;
  return index;
}, {});
