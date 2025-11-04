export type PriceStyle = "dprice" | "price" | "discount";

export interface WidgetStyle {
  title: string;
  showBadge: boolean;
  showTitle: boolean;
  priceParts: Record<PriceStyle, boolean>;
  themeColor: string;
  bgImage?: string;
}

export type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  dprice?: number;
  badge?: string;
};
