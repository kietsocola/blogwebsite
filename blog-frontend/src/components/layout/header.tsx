'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, PenSquare, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { User as UserType } from '@/types';

export function Header() {
  const router = useRouter();
  const { user, isAdmin, clearAuth, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            DevBlog
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-primary-500 transition-colors">
          DevBlog
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link href="/categories" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Categories
          </Link>
          
          {user ? (
            <>
              <Link href="/posts/my" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                My Posts
              </Link>
              {isAdmin && (
                <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <Link href="/posts/new">
                  <Button size="sm" className="gap-2">
                    <PenSquare className="h-4 w-4" />
                    Write
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user.username}</span>
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link href="/" className="block text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/categories" className="block text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
              Categories
            </Link>
            
            {user ? (
              <>
                <Link href="/posts/my" className="block text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                  My Posts
                </Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" className="block text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <Link href="/posts/new" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full gap-2 mt-2">
                    <PenSquare className="h-4 w-4" />
                    Write Post
                  </Button>
                </Link>
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{user.username}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
