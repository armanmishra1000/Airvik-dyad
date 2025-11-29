import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { getPostBySlug } from "@/lib/server/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto py-12 px-4 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
        <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
        </Link>
      </Button>

      <div className="space-y-6 text-center mb-12">
        <div className="flex justify-center gap-2">
             {post.categories?.map((cat) => (
                <Badge key={cat.id} variant="outline">
                {cat.name}
                </Badge>
            ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">{post.title}</h1>
        <div className="text-muted-foreground">
             {post.published_at && format(new Date(post.published_at), "MMMM d, yyyy")}
             {post.author?.full_name && ` • by ${post.author.full_name}`}
        </div>
      </div>

      {post.featured_image && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-12 shadow-lg">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div 
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
    </article>
  );
}
