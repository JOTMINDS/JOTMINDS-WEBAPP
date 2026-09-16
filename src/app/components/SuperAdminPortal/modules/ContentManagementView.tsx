import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Plus, Trash2, FileEdit, Loader, Briefcase, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { listContent, createContent, updateContent, deleteContent } from '../../../utils/api';

type ContentType = 'career' | 'scholarship' | 'resource';

const TYPE_ICON: Record<ContentType, any> = { career: Briefcase, scholarship: GraduationCap, resource: BookOpen };

export function ContentManagementView() {
  const [type, setType] = useState<ContentType>('career');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', category: '', description: '' });

  const load = async (t: ContentType) => {
    setLoading(true);
    try {
      const response = await listContent(t);
      setItems(response?.items || []);
    } catch (err) {
      console.error('Error loading content:', err);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(type); }, [type]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ title: '', category: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({ title: item.title || '', category: item.category || '', description: item.description || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      if (editingItem) {
        await updateContent(type, editingItem.id, form);
        toast.success('Updated');
      } else {
        await createContent({ type, ...form });
        toast.success('Created');
      }
      setDialogOpen(false);
      load(type);
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteContent(type, item.id);
      toast.success('Deleted');
      load(type);
    } catch (err) {
      console.error('Error deleting content:', err);
      toast.error('Failed to delete');
    }
  };

  const Icon = TYPE_ICON[type];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Content Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage career databases, scholarships, and resources.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add {type}
        </Button>
      </div>

      <Tabs value={type} onValueChange={(v) => setType(v as ContentType)}>
        <TabsList>
          <TabsTrigger value="career">Careers</TabsTrigger>
          <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Icon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-3" />
                    No {type} entries yet.
                  </td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 text-slate-500">{item.category || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.seeded ? 'secondary' : 'outline'}>{item.seeded ? 'Seeded' : 'Custom'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><FileEdit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? `Edit ${type}` : `Add ${type}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-title">Title</Label>
              <Input id="content-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-category">Category</Label>
              <Input id="content-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-description">Description</Label>
              <Textarea id="content-description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
