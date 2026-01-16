'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/post-card';
import { Pagination } from '@/components/post/pagination';
import { postsApi } from '@/lib/api';
import type { Post, PageResponse } from '@/types';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchPosts = async (pageNum: number, query?: string) => {
    setLoading(true);
    try {
      let response: PageResponse<Post>;
      if (query) {
        response = await postsApi.search(query, pageNum);
      } else {
        response = await postsApi.getAll(pageNum);
      }
      setPosts(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page, isSearching ? searchQuery : undefined);
  }, [page, isSearching]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setPage(0);
      fetchPosts(0, searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setPage(0);
    fetchPosts(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-500">DevBlog</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          A minimal blog platform for developers to share knowledge and explore new ideas.
        </p>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        
        {isSearching && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Showing results for "{searchQuery}"
            </span>
            <button
              onClick={handleClearSearch}
              className="ml-2 text-sm text-primary-500 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </section>

      {/* Posts Grid */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {isSearching ? 'Search Results' : 'Latest Posts'}
        </h2>
        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}
