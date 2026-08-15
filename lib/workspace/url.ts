export function slugifyWorkspaceName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildWorkspacePath(workspaceName: string, fallbackId?: string): string {
  const slug = slugifyWorkspaceName(workspaceName);
  return `/workspace/${slug || fallbackId || "workspace"}`;
}

export function buildWorkspaceSettingsPath(workspaceName: string, fallbackId?: string): string {
  return `${buildWorkspacePath(workspaceName, fallbackId)}/settings`;
}
