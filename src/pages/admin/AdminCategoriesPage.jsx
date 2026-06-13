import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    }
  });

  const saveCategory = useMutation({
    mutationFn: async () => {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
      } else {
        await api.post('/categories', formData);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries(['admin-categories']);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Operation failed')
  });

  const deleteCategory = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries(['admin-categories']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat._id);
    setFormData({ name: cat.name, description: cat.description || '' });
  };

  return (
    <div className="animate-fade-in flex flex-col lg:flex-row gap-8">
      
      {/* List */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Categories</h1>
            <p className="text-on-surface-variant text-sm">Organize your bookstore</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="btn-primary flex items-center gap-2 lg:hidden"
          >
            <Plus className="w-5 h-5" /> Add Category
          </button>
        </div>

        <div className="glass-dark rounded-lg border border-neutral-high overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-low/80 text-on-surface-variant text-xs uppercase tracking-wider border-b border-neutral-high">
                <th className="p-4 font-medium w-1/3">Name</th>
                <th className="p-4 font-medium hidden sm:table-cell">Description</th>
                <th className="p-4 font-medium text-center">Products</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-high/50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : categories?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-outline">No categories found.</td>
                </tr>
              ) : (
                categories?.map((cat) => (
                  <tr key={cat._id} className="hover:bg-neutral-low/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tags className="w-4 h-4 text-primary" />
                        <span className="font-bold text-white">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant hidden sm:table-cell line-clamp-1">{cat.description}</td>
                    <td className="p-4 text-center">
                      <span className="badge-brand">{cat.productCount || 0}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(cat)} className="p-1.5 text-on-surface-variant hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Are you sure you want to delete this category?')) deleteCategory.mutate(cat._id);
                          }}
                          disabled={deleteCategory.isPending}
                          className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Form */}
      <div className={`w-full lg:w-96 shrink-0 ${isEditing ? 'block' : 'hidden lg:block'}`}>
        <div className="glass-dark rounded-lg border border-neutral-high p-6 sticky top-24">
          <h2 className="text-lg font-bold text-white mb-6">
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form 
            onSubmit={(e) => { e.preventDefault(); saveCategory.mutate(); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Fiction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[100px] resize-y"
                placeholder="Category description..."
              />
            </div>
            
            <div className="pt-4 flex gap-3">
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn-ghost flex-1">
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={saveCategory.isPending || !formData.name.trim()} 
                className="btn-primary flex-1 flex justify-center items-center gap-2"
              >
                {saveCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
