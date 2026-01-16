'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PenSquare, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination } from '@/components/post/pagination';
import { postsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types';

export default function MyPostsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await postsApi.getMy(page, status);
      setPosts(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchPosts();
  }, [authLoading, user, router, page, statusFilter]);

  const handleDelete = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      await postsApi.delete(postToDelete.id);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
        
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejectem</SelectItem> */}
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
          
          <Link href="/posts/new">
            <Button><PenSquare className="h-4 w-4 mr-2" />New Post</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">You haven't written any posts yet.</p>
            <Link href="/posts/new"><Button>Create your first post</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'warning'}>{post.status}</Badge>
                        <Badge variant="secondary">{post.category.name}</Badge>
                      </div>
                      <Link href={`/posts/${post.slug}`}>
                        <h2 className="text-lg font-semibold text-gray-900 hover:text-primary-500">{post.title}</h2>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(post.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/posts/${post.slug}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                      <Link href={`/posts/${post.slug}/edit`}><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => { setPostToDelete(post); setDeleteDialogOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{postToDelete?.title}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
