import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, stripHtml } from '@/lib/utils';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Link href={`/categories/${post.category.slug}`}>
            <Badge variant="secondary" className="hover:bg-gray-200 transition-colors">
              {post.category.name}
            </Badge>
          </Link>
          {post.status === 'DRAFT' && (
            <Badge variant="warning">Draft</Badge>
          )}
        </div>
        
        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-500 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {stripHtml(post.excerpt)}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.author.username}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <span className="text-xs text-gray-500 hover:text-primary-500 transition-colors">
                  #{tag.name}
                </span>
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{post.tags.length - 3} more</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
