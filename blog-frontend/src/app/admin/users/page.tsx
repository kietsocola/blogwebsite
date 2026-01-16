'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin, user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [authLoading, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(userToDelete.id);
      toast.success('User deleted');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Users</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-6 bg-gray-200 rounded w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{user.username}</h3>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Joined {formatDate(user.createdAt || '')}</p>
                </div>
                <div className="flex items-center">
                  {currentUser?.id !== user.id && (
                    <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <DialogDescription>Are you sure you want to delete user "{userToDelete?.username}"? This will also delete all their posts.</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
