import { getCategories } from "@/lib/api";
import { CategoriesManager } from "@/components/admin/posts/categories-manager";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesManager initialCategories={categories} />;
}
