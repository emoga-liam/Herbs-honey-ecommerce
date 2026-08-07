import { useQuery } from "@tanstack/react-query";
import type { Product } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import {
  mapProduct,
  type SupabaseProductImageRow,
  type SupabaseProductRow,
} from "@/lib/map-supabase-product";

export type ListProductsFilters = {
  flavor?: string;
  type?: string;
  inStock?: boolean;
  categoryId?: number;
};

const PRODUCT_SELECT = `
  id,
  name,
  description,
  price_kobo,
  flavor,
  type,
  image_url,
  in_stock,
  stock_count,
  featured,
  category_id,
  min_order_qty,
  benefits,
  created_at
`;

async function fetchCategoryNames(
  categoryIds: number[],
): Promise<Map<number, string>> {
  const unique = [...new Set(categoryIds.filter((id) => id != null))];
  const map = new Map<number, string>();
  if (unique.length === 0) return map;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", unique);
  if (error) throw error;

  for (const row of data ?? []) {
    map.set(row.id as number, row.name as string);
  }
  return map;
}

async function fetchImagesForProducts(
  productIds: number[],
): Promise<SupabaseProductImageRow[]> {
  if (productIds.length === 0) return [];
  const { data, error } = await supabase
    .from("product_images")
    .select("id, product_id, image_url, sort_order")
    .in("product_id", productIds);
  if (error) throw error;
  return (data ?? []) as SupabaseProductImageRow[];
}

async function hydrateProducts(rows: SupabaseProductRow[]): Promise<Product[]> {
  const images = await fetchImagesForProducts(rows.map((r) => r.id));
  const categoryNames = await fetchCategoryNames(
    rows.map((r) => r.category_id).filter((id): id is number => id != null),
  );
  return rows.map((row) => {
    const product = mapProduct(row, images);
    if (row.category_id != null) {
      product.categoryName = categoryNames.get(row.category_id) ?? null;
    }
    return product;
  });
}

async function listProducts(filters: ListProductsFilters = {}): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (filters.flavor) query = query.eq("flavor", filters.flavor);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.inStock !== undefined) query = query.eq("in_stock", filters.inStock);
  if (filters.categoryId !== undefined) {
    query = query.eq("category_id", filters.categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return hydrateProducts((data ?? []) as SupabaseProductRow[]);
}

async function listFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return hydrateProducts((data ?? []) as SupabaseProductRow[]);
}

async function getProduct(id: number): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Product not found");

  const [product] = await hydrateProducts([data as SupabaseProductRow]);
  return product;
}

export function useListProducts(
  filters: ListProductsFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["supabase-products", filters],
    queryFn: () => listProducts(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useGetFeaturedProducts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["supabase-products-featured"],
    queryFn: listFeaturedProducts,
    enabled: options?.enabled ?? true,
  });
}

export function useGetProduct(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["supabase-product", id],
    queryFn: () => getProduct(id),
    enabled: (options?.enabled ?? true) && Number.isFinite(id) && id > 0,
  });
}
