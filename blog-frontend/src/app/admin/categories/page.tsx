'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { categoriesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchCategories();
  }, [authLoading, isAdmin, router]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(formData);
        toast.success('Category created');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoriesApi.delete(categoryToDelete.id);
      toast.success('Category deleted');
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-6 bg-gray-200 rounded w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-gray-500">No categories yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500">/{cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => { setCategoryToDelete(cat); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label>Slug (optional)</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Category</DialogTitle></DialogHeader>
          <p className="text-gray-500">Are you sure you want to delete "{categoryToDelete?.name}"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
