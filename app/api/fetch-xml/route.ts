import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

type RawProduct = {
  product_code?: string;
  product_name?: string;
  original_price?: string | number;
  discount_price?: string | number;
  small_image?: string;
  medium_image?: string;
  large_image?: string;
  product_url?: string;
};

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json(
        { error: "Geçerli bir XML URL girin." },
        { status: 400 }
      );
    }

    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `XML istek hatası: ${res.status}` },
        { status: 502 }
      );
    }
    const text = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true,
    });
    const parsed = parser.parse(text);

    const productsNode = parsed?.products ?? parsed?.Products ?? parsed;
    let raw: RawProduct[] = [];

    if (Array.isArray(productsNode?.product)) {
      raw = productsNode.product as RawProduct[];
    } else if (productsNode?.product) {
      raw = [productsNode.product as RawProduct];
    } else if (Array.isArray(productsNode)) {
      raw = productsNode as RawProduct[];
    }

    const mapped = (raw || [])
      .map((p, idx) => {
        const priceNum = Number(
          (p.discount_price ?? p.original_price ?? "")
            .toString()
            .replace(/[^\d.,-]/g, "")
            .replace(",", ".")
        );
        const image = p.large_image || p.medium_image || p.small_image || "";
        return {
          id: (p.product_code || String(idx + 1)).toString(),
          title: p.product_name || "Ürün",
          price: isNaN(priceNum) ? 0 : priceNum,
          image,
          url: p.product_url || "",
        };
      })
      .filter((p) => p.image || p.title);

    return NextResponse.json(
      { products: mapped.slice(0, 24) },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
