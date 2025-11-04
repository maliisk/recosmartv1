// app/api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Netlify/SSR: bu route hiçbir zaman statik üretilmesin
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function absolutify(url: string, base: string) {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let html: string;
  try {
    const r = await fetch(target, {
      headers: { "user-agent": req.headers.get("user-agent") || "" },
      redirect: "follow",
      cache: "no-store",
    });
    html = await r.text();
  } catch {
    return new NextResponse("Proxy fetch failed", { status: 502 });
  }

  const $ = cheerio.load(html);

  // iFrame/CSP engellerini kaldır
  $('meta[http-equiv="Content-Security-Policy"]').remove();
  $('meta[http-equiv="X-Frame-Options"]').remove();

  // Base etiketini garanti et
  const baseHref = new URL(target).origin + "/";
  if ($("base").length === 0) {
    $("head").prepend(`<base href="${baseHref}">`);
  }

  // Kaynak URL'lerini mutlak yap
  $("img, script, link, source").each((_, el) => {
    const $el = $(el);
    const attr = $el.is("link") ? "href" : "src";
    const val = $el.attr(attr);
    if (val) $el.attr(attr, absolutify(val, target));
  });

  $("head").append(`<meta name="reco-proxied" content="1">`);

  const proxied = $.html();
  return new NextResponse(proxied, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, max-age=60",
    },
  });
}
