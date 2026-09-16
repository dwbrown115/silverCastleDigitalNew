const projectFiles = import.meta.glob("./*.json", { eager: true, import: "default" });

export const projects = Object.values(projectFiles);

export const projectsBySlug = projects.reduce((index, project) => {
  index[project.slug] = project;
  return index;
}, {});
