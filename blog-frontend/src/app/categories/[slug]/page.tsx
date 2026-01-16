'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PostCard } from '@/components/post/post-card';
import { Pagination } from '@/components/post/pagination';
import { categoriesApi } from '@/lib/api';
import type { Post } from '@/types';

export default function CategoryPostsPage({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await categoriesApi.getPosts(params.slug, page);
        setPosts(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [params.slug, page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/categories" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        All Categories
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8 capitalize">
        {params.slug.replace(/-/g, ' ')}
      </h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">No posts in this category.</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
