import type { Product, ProductImage } from "@workspace/api-client-react";

/** Raw row from public.products (snake_case). */
export type SupabaseProductRow = {
  id: number;
  name: string;
  description: string;
  price_kobo: number;
  flavor: string;
  type: string;
  image_url: string | null;
  in_stock: boolean;
  stock_count: number;
  featured: boolean;
  category_id: number | null;
  min_order_qty: number;
  benefits: string[] | null;
  created_at: string;
  categories?: { name: string } | { name: string }[] | null;
};

/** Raw row from public.product_images. */
export type SupabaseProductImageRow = {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
};

function categoryNameFromJoin(
  categories: SupabaseProductRow["categories"],
): string | null {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0]?.name ?? null;
  return categories.name ?? null;
}

export function mapProductImage(row: SupabaseProductImageRow): ProductImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  };
}

export function mapProduct(
  row: SupabaseProductRow,
  images: SupabaseProductImageRow[] = [],
): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceKobo: row.price_kobo,
    flavor: row.flavor,
    type: row.type,
    imageUrl: row.image_url,
    inStock: row.in_stock,
    stockCount: row.stock_count,
    featured: row.featured,
    categoryId: row.category_id,
    categoryName: categoryNameFromJoin(row.categories),
    minOrderQty: row.min_order_qty ?? 1,
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    images: images
      .filter((img) => img.product_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapProductImage),
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date(row.created_at).toISOString(),
  };
}
