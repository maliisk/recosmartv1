import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function absolutify(url: string, base: string) {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

// Proxy URL helper (server-side ve enjekte JS tarafında da aynı mantık)
function toProxy(u: string) {
  return `/api/proxy?url=${encodeURIComponent(u)}`;
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
      // dış site cache'i bir miktar kullanalım:
      cache: "no-store",
    });
    html = await r.text();
  } catch {
    return new NextResponse("Proxy fetch failed", { status: 502 });
  }

  const $ = cheerio.load(html);

  // Çerçeve engellerini kaldır
  $('meta[http-equiv="Content-Security-Policy"]').remove();
  $('meta[http-equiv="X-Frame-Options"]').remove();

  const baseHref = new URL(target).origin;

  // Tüm relatif yollar için base
  if ($("base").length === 0) {
    $("head").prepend(`<base href="${baseHref}" target="_self">`);
  } else {
    // varsa da target'ı _self yap
    $("base").attr("target", "_self");
  }

  // Statik asset yollarını mutlak yapalım
  $("img, script, link, source").each((_, el) => {
    const $el = $(el);
    const attr = $el.is("link") ? "href" : "src";
    const val = $el.attr(attr);
    if (val) $el.attr(attr, absolutify(val, target));
  });

  // --- ÖNEMLİ: Linkleri proxy'e çevir ---
  $("a[href]").each((_, a) => {
    const $a = $(a);
    const raw = $a.attr("href")!;
    // javascript:, mailto:, tel: vb. atla
    if (/^(javascript:|mailto:|tel:|#)/i.test(raw)) return;
    const abs = absolutify(raw, target);
    $a.attr("href", toProxy(abs));
    // dışarı kaçırabilecek target'ları iptal et
    $a.removeAttr("target").attr("rel", "noopener");
  });

  // Meta refresh proxy’le
  $('meta[http-equiv="refresh"]').each((_, m) => {
    const $m = $(m);
    const content = $m.attr("content") || "";
    // örn: "0;url=/kampanya"
    const mRes = content.match(/^\s*\d+\s*;\s*url=(.+)\s*$/i);
    if (mRes) {
      const abs = absolutify(mRes[1], target);
      $m.attr("content", `0;url=${toProxy(abs)}`);
    }
  });

  // Form action’larını proxy’e çevir (POST’lar çoğu sitede işe yaramaz; GET’e düşür)
  $("form").each((_, f) => {
    const $f = $(f);
    const act = $f.attr("action") || "";
    const abs = absolutify(act || target, target);
    $f.attr("action", toProxy(abs));
    if (($f.attr("method") || "get").toLowerCase() !== "get") {
      $f.attr("method", "get");
    }
    // hedefi iframe içinde tut
    $f.removeAttr("target");
  });

  // SPA yönlendirmelerini yakalamak için küçük injector
  $("head").append(`<meta name="reco-proxied" content="1">`);
  $("body").append(`
<script>
(function(){
  var BASE = ${JSON.stringify(target)};
  function toProxy(u){ return '/api/proxy?url=' + encodeURIComponent(new URL(u, BASE).toString()); }

  // Anchor click yakala (event bubbling ile)
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if(!a) return;
    var href = a.getAttribute('href') || '';
    if (/^(javascript:|mailto:|tel:|#)/i.test(href)) return;
    e.preventDefault();
    var abs = new URL(href, BASE).toString();
    window.location.href = toProxy(abs);
  }, true);

  // history API patch (SPA router pushState/replaceState)
  ['pushState','replaceState'].forEach(function(k){
    var orig = history[k];
    history[k] = function(state, title, url){
      if (typeof url === 'string' && !url.startsWith('/api/proxy')) {
        var abs = new URL(url, BASE).toString();
        return window.location.assign(toProxy(abs));
      }
      return orig.apply(history, arguments);
    };
  });

  // location.assign/replace patch (bazı SPA'lar bunu kullanır)
  var _assign = window.location.assign.bind(window.location);
  window.location.assign = function(url){
    var abs = new URL(url, BASE).toString();
    _assign(toProxy(abs));
  };
  var _replace = window.location.replace.bind(window.location);
  window.location.replace = function(url){
    var abs = new URL(url, BASE).toString();
    _replace(toProxy(abs));
  };
})();
</script>`);

  const proxied = $.html();

  return new NextResponse(proxied, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // kısa cache; navigasyon hızlı kalsın
      "cache-control": "private, max-age=30",
    },
  });
}
