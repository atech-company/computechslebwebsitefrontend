import { describe, expect, it } from "vitest";
import { normalizeProduct, normalizeProducts } from "@/lib/woocommerce/normalize";
import type { StoreProduct } from "@/types/woocommerce";

const sample = {
  id: 1,
  name: "Test Laptop",
  slug: "test-laptop",
  parent: 0,
  type: "simple",
  variation: "",
  permalink: "https://wp.computechsleb.com/product/test-laptop/",
  sku: "SKU1",
  short_description: "<p>Short</p>",
  description: "<p>Long</p>",
  on_sale: true,
  prices: {
    price: "40000",
    regular_price: "42000",
    sale_price: "40000",
    price_range: null,
    currency_code: "USD",
    currency_symbol: "$",
    currency_minor_unit: 2,
    currency_decimal_separator: ".",
    currency_thousand_separator: ",",
    currency_prefix: "$",
    currency_suffix: "",
  },
  price_html: "",
  average_rating: "0",
  review_count: 0,
  images: [
    {
      id: 1,
      src: "https://wp.computechsleb.com/image.webp",
      thumbnail: "",
      srcset: "",
      sizes: "",
      name: "img",
      alt: "alt",
    },
  ],
  categories: [],
  tags: [],
  brands: [{ id: 1, name: "Lenovo", slug: "lenovo" }],
  attributes: [],
  variations: [],
  grouped_products: [],
  has_options: false,
  is_purchasable: true,
  is_in_stock: true,
  is_on_backorder: false,
  low_stock_remaining: null,
  stock_availability: { text: "In stock", class: "in-stock" },
  sold_individually: false,
  add_to_cart: {
    text: "Add to cart",
    description: "",
    url: "",
    single_text: "Add to cart",
    minimum: 1,
    maximum: 99,
    multiple_of: 1,
  },
} as StoreProduct;

describe("normalizeProduct", () => {
  it("converts minor units to major currency amounts", () => {
    const product = normalizeProduct(sample);
    expect(product.price).toBe(400);
    expect(product.regularPrice).toBe(420);
    expect(product.discountPercent).toBe(5);
    expect(product.shortDescription).toBe("Short");
    expect(product.image?.src).toContain("image.webp");
  });

  it("removes duplicate gallery images returned by WooCommerce", () => {
    const product = normalizeProduct({
      ...sample,
      images: [sample.images[0], sample.images[0]],
    });

    expect(product.images).toHaveLength(1);
  });
});

describe("normalizeProducts", () => {
  it("drops duplicate product ids from parent+child category queries", () => {
    const products = normalizeProducts([sample, { ...sample, name: "Copy" }]);
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Test Laptop");
  });
});
