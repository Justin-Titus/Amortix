export function slugifyLoanName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildLoanPath(loanName: string, fallbackId?: string): string {
  const slug = slugifyLoanName(loanName);
  return `/loans/${slug || fallbackId || "loan"}`;
}

export function buildLoanEditPath(loanName: string, fallbackId?: string): string {
  return `${buildLoanPath(loanName, fallbackId)}/edit`;
}
