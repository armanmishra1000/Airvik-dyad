import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPosts, getCategories } from "@/lib/api";
import { PostsTable } from "@/components/admin/posts/posts-table";
import { PostsFilters } from "@/components/admin/posts/posts-filters";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    category?: string;
    search?: string;
    status?: "draft" | "published";
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const categories = await getCategories();
  const posts = await getPosts({
    month: resolvedSearchParams.month,
    categoryId: resolvedSearchParams.category,
    search: resolvedSearchParams.search,
    status: resolvedSearchParams.status,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Post
          </Link>
        </Button>
      </div>

      <PostsFilters categories={categories} />

      <Suspense fallback={<div>Loading posts...</div>}>
        <PostsTable posts={posts} />
      </Suspense>
    </div>
  );
}
