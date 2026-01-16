'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { postsApi } from '@/lib/api';
import { getUser, isAdmin } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types';

export default function PostDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const user = getUser();
  const canEdit = user && (isAdmin() || user.id === post?.author.id);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postsApi.getBySlug(params.slug);
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast.error('Post not found');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug, router]);

  const handleDelete = async () => {
    if (!post) return;
    
    setDeleting(true);
    try {
      await postsApi.delete(post.id);
      toast.success('Post deleted successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to posts
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/categories/${post.category.slug}`}>
            <Badge variant="secondary" className="hover:bg-gray-200">
              {post.category.name}
            </Badge>
          </Link>
          {post.status === 'DRAFT' && (
            <Badge variant="warning">Draft</Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author.username}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.createdAt)}
          </span>
        </div>

        {canEdit && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <Link href={`/posts/${post.slug}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Content */}
      <article 
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge variant="outline" className="hover:bg-gray-100">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
