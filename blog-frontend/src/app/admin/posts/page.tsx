'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Check, X, Trash2, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi, postsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, stripHtml } from '@/lib/utils';
import type { Post, PostStatus, PageResponse } from '@/types';

const STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function AdminPostsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchPosts();
  }, [authLoading, isAdmin, router, currentPage, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllPosts(currentPage, statusFilter || undefined);
      setPosts(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (post: Post) => {
    setActionLoading(true);
    try {
      await adminApi.approvePost(post.id);
      toast.success('Post approved');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (post: Post) => {
    setActionLoading(true);
    try {
      await adminApi.rejectPost(post.id, 'Does not meet quality standards');
      toast.success('Post rejected');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (post: Post) => {
    setActionLoading(true);
    try {
      await adminApi.publishPost(post.id);
      toast.success('Post published');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to publish');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    setActionLoading(true);
    try {
      await postsApi.delete(postToDelete.id);
      toast.success('Post deleted');
      setDeleteDialogOpen(false);
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: PostStatus) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Posts</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Posts</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PostStatus | '');
              setCurrentPage(0);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No posts found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <Link href={`/posts/${post.slug}`} className="hover:text-primary-500">
                            <h3 className="font-semibold text-gray-900 text-lg">{post.title}</h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusBadgeClass(post.status)}>
                              {post.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              by {post.author.username}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{stripHtml(post.excerpt)}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Category: {post.category.name}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                        {post.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Tags: {post.tags.map(t => t.name).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col items-center gap-2">
                      <Link href={`/posts/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {post.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(post)}
                            disabled={actionLoading}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(post)}
                            disabled={actionLoading}
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {(post.status === 'DRAFT' || post.status === 'PENDING') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => handlePublish(post)}
                          disabled={actionLoading}
                          title="Publish"
                        >
                          <FileCheck className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setPostToDelete(post);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
