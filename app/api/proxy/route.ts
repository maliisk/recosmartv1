import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function absolutify(url: string, base: string) {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

// İframe dışına taşmadan parent’a haber verip yeniden proxy’den yükletecek köprü
const NAV_BRIDGE = `
<script>
(function(){
  function abs(u){ try { return new URL(u, document.baseURI).toString(); } catch(e){ return u } }
  function ask(u){
    try { window.parent && window.parent.postMessage({ type: "RECO_NAV", url: abs(u) }, "*"); } catch(e){}
  }

  // A etiketleri
  document.addEventListener("click", function(ev){
    var a = ev.target && (ev.target.closest ? ev.target.closest("a") : null);
    if(!a) return;
    var href = a.getAttribute("href");
    if(!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    ev.preventDefault(); ev.stopPropagation();
    ask(href);
  }, true);

  // SPA yönlendirmeleri
  var _push = history.pushState;
  history.pushState = function(s,t,u){ _push.apply(history, arguments); if(u) ask(u); };
  var _replace = history.replaceState;
  history.replaceState = function(s,t,u){ _replace.apply(history, arguments); if(u) ask(u); };
  window.addEventListener("popstate", function(){ ask(location.href); });
})();
</script>
`;

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) return new NextResponse("Missing url", { status: 400 });

  let html: string;
  try {
    const r = await fetch(target, {
      headers: {
        "user-agent": req.headers.get("user-agent") || "",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    html = await r.text();
  } catch {
    return new NextResponse("Proxy fetch failed", { status: 502 });
  }

  const $ = cheerio.load(html);

  // iFrame kilitleyen başlıkları temizle
  $('meta[http-equiv="Content-Security-Policy"]').remove();
  $('meta[http-equiv="X-Frame-Options"]').remove();

  // Base ve mutlaklaştırma
  const baseHref = new URL(target).origin;
  if ($("base").length === 0) {
    $("head").prepend(`<base href="${baseHref}">`);
  }

  $("img, script, link, source").each((_, el) => {
    const $el = $(el);
    const attr = $el.is("link") ? "href" : "src";
    const val = $el.attr(attr);
    if (val) $el.attr(attr, absolutify(val, target));
  });

  // Tüm <a>’lar için mutlak href ve target/rel temizliği
  $("a[href]").each((_, a) => {
    const $a = $(a);
    const href = $a.attr("href")!;
    $a.attr("href", absolutify(href, target));
    $a.removeAttr("target"); // yeni sayfa açtırmayalım
    $a.removeAttr("rel");
  });

  // Köprü script + işaret
  $("head").append(`<meta name="reco-proxied" content="1">`);
  $("body").append(NAV_BRIDGE);

  const proxied = $.html();
  return new NextResponse(proxied, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, max-age=60",
    },
  });
}
