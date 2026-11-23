import type { ProductCardModel, StoreProduct } from "@/types/woocommerce";
import {
  discountPercent,
  formatMoney,
  formatProductDisplayName,
  stripHtml,
} from "@/lib/utils";

export function normalizeProduct(product: StoreProduct): ProductCardModel {
  const minor = product.prices.currency_minor_unit ?? 2;
  const currency = product.prices.currency_code || "USD";
  const price = Number.parseInt(product.prices.price || "0", 10);
  const regular = Number.parseInt(product.prices.regular_price || "0", 10);
  const sale = Number.parseInt(
    product.prices.sale_price || product.prices.price || "0",
    10,
  );
  const primary = product.images[0];

  return {
    id: product.id,
    name: formatProductDisplayName(product.name),
    slug: product.slug,
    sku: product.sku || "",
    permalink: product.permalink,
    shortDescription: stripHtml(product.short_description || ""),
    description: product.description || "",
    onSale: product.on_sale,
    price: price / 10 ** minor,
    regularPrice: regular / 10 ** minor,
    salePrice: sale / 10 ** minor,
    currencyCode: currency,
    currencyMinorUnit: minor,
    formattedPrice: formatMoney(price, minor, currency),
    formattedRegularPrice: formatMoney(regular, minor, currency),
    discountPercent: product.on_sale
      ? discountPercent(regular, sale)
      : null,
    image: primary
      ? { src: primary.src, alt: primary.alt || product.name }
      : null,
    images: product.images
      .filter(
        (img, index, images) =>
          images.findIndex(
            (candidate) => candidate.id === img.id && candidate.src === img.src,
          ) === index,
      )
      .map((img) => ({
        id: img.id,
        src: img.src,
        alt: img.alt || product.name,
      })),
    categories: product.categories || [],
    brands: product.brands || [],
    attributes: product.attributes || [],
    isInStock: product.is_in_stock,
    stockText: stripHtml(product.stock_availability?.text || ""),
    lowStockRemaining: product.low_stock_remaining,
    isPurchasable: product.is_purchasable,
    hasOptions: product.has_options,
    type: product.type,
    reviewCount: product.review_count || 0,
    averageRating: Number.parseFloat(product.average_rating || "0") || 0,
    addToCart: product.add_to_cart,
  };
}

export function normalizeProducts(products: StoreProduct[]): ProductCardModel[] {
  const seen = new Set<number>();
  const unique: ProductCardModel[] = [];
  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    unique.push(normalizeProduct(product));
  }
  return unique;
}
