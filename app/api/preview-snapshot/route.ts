// app/api/preview-snapshot/route.ts
import { NextRequest, NextResponse } from "next/server";

function absolutifyBase(html: string, baseHref: string) {
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (m) => `${m}<base href="${baseHref}">`);
  }
  return `<head><base href="${baseHref}"></head>` + html;
}

function stripScripts(html: string) {
  let out = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  out = out.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "");
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) {
      return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
    }

    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return NextResponse.json({ error: "Geçersiz URL" }, { status: 400 });
    }

    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (RecoSmart Snapshot)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("text/html")) {
      return NextResponse.json({ error: "HTML alınamadı" }, { status: 400 });
    }

    let html = await res.text();

    html = stripScripts(html);
    html = absolutifyBase(html, `${target.origin}/`);

    const style = `
      <style>
        html, body { height: 100%; }
        body { margin:0 !important; }
        /* RecoSmart overlay'e hiçbir tıklama gitmesin */
        * { pointer-events: none !important; }
      </style>
    `;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => `${m}${style}`);
    } else {
      html = style + html;
    }

    return NextResponse.json({ html });
  } catch (e) {
    return NextResponse.json({ error: "Snapshot hatası" }, { status: 500 });
  }
}
