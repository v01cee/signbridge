import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/gestures";
import type { Category } from "../types";

/**
 * Хук для получения списка категорий с кэшем.
 * Возвращает и сами категории, и map для быстрого поиска по id.
 */
export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const categories = query.data ?? [];
  const categoryById = new Map<number, Category>(categories.map((c) => [c.id, c]));

  return {
    ...query,
    categories,
    categoryById,
    getCategoryName: (id: number | null | undefined): string | null => {
      if (id == null) return null;
      return categoryById.get(id)?.name ?? null;
    },
  };
}
