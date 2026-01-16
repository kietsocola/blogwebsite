'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Editor } from '@/components/post/editor';
import { postsApi, categoriesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Category, PostStatus, Post } from '@/types';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED']),
});

type PostForm = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAdmin: userIsAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingPost, setFetchingPost] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [post, setPost] = useState<Post | null>(null);

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [postData, categoriesData] = await Promise.all([
          postsApi.getBySlug(slug),
          categoriesApi.getAll(),
        ]);

        // Check if user has permission to edit
        if (postData.author.id !== user.id && !userIsAdmin) {
          toast.error('You do not have permission to edit this post');
          router.push('/posts/my');
          return;
        }

        setPost(postData);
        setCategories(categoriesData);

        // Set form values
        setValue('title', postData.title);
        setValue('content', postData.content || '');
        setValue('categoryId', postData.category.id.toString());
        setValue('tags', postData.tags.map(t => t.name).join(', '));
        setValue('featuredImage', postData.featuredImage || '');
        setValue('status', postData.status);
      } catch (error: any) {
        console.error('Failed to fetch post:', error);
        toast.error('Failed to load post');
        router.push('/posts/my');
      } finally {
        setFetchingPost(false);
      }
    };

    fetchData();
  }, [slug, user, userIsAdmin, authLoading, router, setValue]);

  const onSubmit = async (data: PostForm) => {
    if (!post) return;
    
    setLoading(true);
    try {
      const postData = {
        title: data.title,
        content: data.content,
        categoryId: parseInt(data.categoryId),
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        featuredImage: data.featuredImage || undefined,
        status: data.status as PostStatus,
      };

      const updatedPost = await postsApi.update(post.id, postData);
      toast.success('Post updated successfully!');
      router.push(`/posts/${updatedPost.slug}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update post';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-12">
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/posts/my" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to My Posts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter post title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Content</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Editor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your post content..."
                  />
                )}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., javascript, react, tutorial"
                {...register('tags')}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL (optional)</Label>
              <Input
                id="featuredImage"
                placeholder="https://example.com/image.jpg"
                {...register('featuredImage')}
              />
              {errors.featuredImage && (
                <p className="text-sm text-red-500">{errors.featuredImage.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      {userIsAdmin && (
                        <>
                          {/* <SelectItem value="PENDING">Pending</SelectItem> */}
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          {/* <SelectItem value="REJECTED">Rejected</SelectItem> */}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Post
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
