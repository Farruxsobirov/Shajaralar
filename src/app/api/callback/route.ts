import { type NextRequest } from "next/server";

// GitHub ruxsat bergandan keyin shu yerga qaytadi. Kodni tokenga almashtirib,
// uni oynani ochgan admin sahifasiga (faqat o'z domenimizga) uzatamiz.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("decap_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return page(origin, "error", { message: "Kirish so'rovi eskirgan yoki noto'g'ri. Qaytadan urinib ko'ring." });
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/callback`,
    }),
    cache: "no-store",
  });

  const data = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !data.access_token) {
    return page(origin, "error", {
      message: data.error_description ?? "GitHub token bermadi. Client ID va Secret to'g'riligini tekshiring.",
    });
  }

  return page(origin, "success", { token: data.access_token, provider: "github" });
}

function page(origin: string, status: "success" | "error", content: Record<string, string>) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><html><body><p>${status === "success" ? "Kirildi, oyna yopilmoqda…" : "Kirishda xato."}</p>
<script>
(function () {
  var origin = ${JSON.stringify(origin)};
  var message = ${JSON.stringify(message)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(message, origin);
    window.removeEventListener("message", receive, false);
  }
  window.addEventListener("message", receive, false);
  if (window.opener) window.opener.postMessage("authorizing:github", origin);
})();
</script></body></html>`;

  const res = new Response(html, {
    status: status === "success" ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
  res.headers.append(
    "Set-Cookie",
    "decap_oauth_state=; Path=/api/callback; Max-Age=0; HttpOnly; SameSite=Lax",
  );
  return res;
}
