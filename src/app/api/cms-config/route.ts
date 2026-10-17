// Admin panelga qaysi GitHub repo va branch bilan ishlashni aytadi.
// Vercel bu qiymatlarni o'zi beradi; xohlasangiz GITHUB_REPO va GITHUB_BRANCH bilan almashtiring.
export async function GET() {
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const slug = process.env.VERCEL_GIT_REPO_SLUG;
  const repo = process.env.GITHUB_REPO ?? (owner && slug ? `${owner}/${slug}` : null);
  const branch = process.env.GITHUB_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? null;

  return Response.json({ repo, branch });
}
