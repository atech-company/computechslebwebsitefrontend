export interface MoneyTotals {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface StoreImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface StoreTerm {
  id: number;
  name: string;
  slug: string;
  link?: string;
}

export interface StoreAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: MoneyTotals & { price_range: unknown };
  price_html: string;
  average_rating: string;
  review_count: number;
  images: StoreImage[];
  categories: StoreTerm[];
  tags: StoreTerm[];
  brands?: StoreTerm[];
  attributes: StoreAttribute[];
  variations: number[];
  grouped_products: number[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  low_stock_remaining: number | null;
  stock_availability: { text: string; class: string };
  sold_individually: boolean;
  add_to_cart: {
    text: string;
    description: string;
    url: string;
    single_text: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: StoreImage | null;
  review_count: number;
  permalink: string;
}

export interface StoreBrand {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: StoreImage | null;
  review_count?: number;
  permalink?: string;
}

export interface StoreCartItem {
  key: string;
  id: number;
  quantity: number;
  quantity_limits: {
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  };
  name: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  sold_individually: boolean;
  permalink: string;
  images: StoreImage[];
  variation: Array<{ attribute: string; value: string }>;
  item_data: unknown[];
  prices: MoneyTotals & {
    raw_prices: {
      precision: number;
      price: string;
      regular_price: string;
      sale_price: string;
    };
  };
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
    currency_code: string;
    currency_minor_unit: number;
  };
  catalog_visibility: string;
}

export interface StoreCart {
  items: StoreCartItem[];
  coupons: Array<{
    code: string;
    discount_type: string;
    totals: {
      total_discount: string;
      total_discount_tax: string;
      currency_code: string;
      currency_minor_unit: number;
    };
  }>;
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string | null;
    total_shipping_tax: string | null;
    total_price: string;
    total_tax: string;
    tax_lines: unknown[];
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  shipping_address: Record<string, string>;
  billing_address: Record<string, string>;
  needs_payment: boolean;
  needs_shipping: boolean;
  payment_requirements: string[];
  has_calculated_shipping: boolean;
  shipping_rates: unknown[];
  items_count: number;
  items_weight: number;
  cross_sells: StoreProduct[];
  errors: unknown[];
  payment_methods: string[];
  extensions: Record<string, unknown>;
}

export interface StoreCheckout {
  order_id: number;
  status: string;
  order_key: string;
  order_number: string;
  customer_note: string;
  customer_id: number;
  billing_address: Record<string, string>;
  shipping_address: Record<string, string>;
  payment_method: string;
  payment_result: {
    payment_status: string;
    payment_details: Array<{ key: string; value: string }>;
    redirect_url: string;
  } | null;
  additional_fields: Record<string, unknown>;
  __experimentalCart?: StoreCart;
  extensions?: Record<string, unknown>;
}

/** Normalized product for UI */
export interface ProductCardModel {
  id: number;
  name: string;
  slug: string;
  sku: string;
  permalink: string;
  shortDescription: string;
  description: string;
  onSale: boolean;
  price: number;
  regularPrice: number;
  salePrice: number;
  currencyCode: string;
  currencyMinorUnit: number;
  formattedPrice: string;
  formattedRegularPrice: string;
  discountPercent: number | null;
  image: { src: string; alt: string } | null;
  images: Array<{ id: number; src: string; alt: string }>;
  categories: StoreTerm[];
  brands: StoreTerm[];
  attributes: StoreAttribute[];
  isInStock: boolean;
  stockText: string;
  lowStockRemaining: number | null;
  isPurchasable: boolean;
  hasOptions: boolean;
  type: string;
  reviewCount: number;
  averageRating: number;
  addToCart: StoreProduct["add_to_cart"];
}
