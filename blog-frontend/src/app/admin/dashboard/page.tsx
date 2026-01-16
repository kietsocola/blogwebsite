'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Users, Folder, Tag, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Stats } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authLoading, isAdmin, router]);

  const statCards = [
    { title: 'Total Posts', value: stats?.totalPosts || 0, icon: FileText, href: '/admin/posts', color: 'text-blue-500' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, href: '/admin/users', color: 'text-green-500' },
    { title: 'Categories', value: stats?.totalCategories || 0, icon: Folder, href: '/admin/categories', color: 'text-purple-500' },
    { title: 'Tags', value: stats?.totalTags || 0, icon: Tag, href: '#', color: 'text-orange-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-10 bg-gray-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                {stat.href !== '#' && (
                  <Link href={stat.href} className="text-sm text-primary-500 hover:underline inline-flex items-center mt-2">
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/posts" className="block p-3 rounded-md hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900">Manage Posts</span>
              <p className="text-sm text-gray-500">Review, approve, and manage all posts</p>
            </Link>
            <Link href="/posts/new" className="block p-3 rounded-md hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900">Create New Post</span>
              <p className="text-sm text-gray-500">Write and publish a new blog post</p>
            </Link>
            <Link href="/admin/categories" className="block p-3 rounded-md hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900">Manage Categories</span>
              <p className="text-sm text-gray-500">Add, edit, or delete categories</p>
            </Link>
            <Link href="/admin/users" className="block p-3 rounded-md hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900">Manage Users</span>
              <p className="text-sm text-gray-500">View and manage user accounts</p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
