import { NextResponse, type NextRequest } from "next/server";

// Decap CMS "GitHub bilan kirish" tugmasi shu manzilni ochadi.
// Biz foydalanuvchini GitHub ruxsat sahifasiga yuboramiz.
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new NextResponse(
      "GITHUB_CLIENT_ID topilmadi. Vercel > Settings > Environment Variables bo'limiga qo'shing.",
      { status: 500 },
    );
  }

  const origin = request.nextUrl.origin;
  const requested = request.nextUrl.searchParams.get("scope");
  const scope = requested === "public_repo" ? "public_repo" : "repo";
  const state = crypto.randomUUID();

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${origin}/api/callback`);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  response.cookies.set("decap_oauth_state", state, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/api/callback",
    maxAge: 600,
  });
  return response;
}
