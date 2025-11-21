import { getCategories } from "@/lib/api";
import { PostForm } from "@/components/admin/posts/post-form";

export default async function CreatePostPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add New Post</h1>
      <PostForm categories={categories} />
    </div>
  );
}
