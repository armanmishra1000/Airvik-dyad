import { getCategories } from "@/lib/api";
import { CategoriesManager } from "@/components/admin/posts/categories-manager";
import { requirePageFeature } from "@/lib/server/page-auth";

export default async function CategoriesPage() {
  await requirePageFeature("postsUpdate");
  const categories = await getCategories();
  return <CategoriesManager initialCategories={categories} />;
}
