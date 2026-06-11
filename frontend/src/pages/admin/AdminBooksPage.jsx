import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Edit2, Trash2, Search, Loader2, X, Package, Download,
  BookOpen, ArrowLeft, ArrowRight, Check, Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const STEPS = [
  { num: 1, title: 'Basic Info' },
  { num: 2, title: 'Format Details' },
  { num: 3, title: 'Review' },
];

const INITIAL_FORM = {
  title: '', author: '', isbn: '', description: '',
  category: '', price: '', discountPrice: '',
  format: 'physical',
  physicalStock: '0', physicalWeight: '', physicalShippingCost: '',
  ebookFileSize: '', ebookPreviewPages: '',
  language: 'English', pages: '', publisher: '', publishedYear: '', tags: '',
};

export default function AdminBooksPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const { data } = await api.get(`/products/admin/all?page=${page}&search=${search}&limit=10`);
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data || data;
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success('Book deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingBook(null);
  };

  const handleSuccess = () => {
    handleClose();
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const formatLabel = (fmt) => {
    const labels = { physical: 'Physical', ebook: 'E-Book', both: 'Both' };
    return labels[fmt] || fmt;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Books</h1>
          <p className="text-surface-400 text-sm">Add, edit, and manage book inventory</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-brand flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Book
        </button>
      </div>

      <div className="glass-dark rounded-2xl border border-surface-700 overflow-hidden">
        <div className="p-4 border-b border-surface-700 bg-surface-800/50 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-800/80 text-surface-400 text-xs uppercase tracking-wider border-b border-surface-700">
                <th className="p-4 font-medium">Book</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Format</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : productsData?.data?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-surface-500">No books found.</td>
                </tr>
              ) : (
                productsData?.data.map((book) => (
                  <tr key={book._id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={book.coverImage || '/placeholder-book.svg'} alt="" className="w-10 h-14 object-cover rounded shadow" />
                        <div>
                          <p className="font-medium text-white line-clamp-1">{book.title}</p>
                          <p className="text-xs text-surface-400">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-surface-300">{book.category?.name}</td>
                    <td className="p-4 text-sm text-white font-medium">RWF {book.price.toLocaleString()}</td>
                    <td className="p-4">
                      <FormatBadge format={book.format} />
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${
                        book.format === 'ebook' ? 'text-blue-400' :
                        book.physicalBook?.stock > 10 ? 'text-green-400' :
                        book.physicalBook?.stock > 0 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {book.format === 'ebook' ? 'Unlimited' : book.physicalBook?.stock ?? 0}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-1.5 text-surface-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm(`Delete "${book.title}"?`)) deleteProduct.mutate(book._id);
                          }}
                          disabled={deleteProduct.isPending}
                          className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Delete"
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
        
        {productsData?.totalPages > 1 && (
          <div className="p-4 border-t border-surface-700 flex justify-between items-center bg-surface-800/50 text-sm">
            <span className="text-surface-400">Page {page} of {productsData.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-surface-700 text-white rounded hover:bg-surface-600 disabled:opacity-50">Prev</button>
              <button disabled={page === productsData.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-surface-700 text-white rounded hover:bg-surface-600 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ProductFormModal
          categories={categories || []}
          editingBook={editingBook}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

function FormatBadge({ format }) {
  if (format === 'both') {
    return (
      <div className="flex gap-1">
        <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-400/10 px-1.5 py-0.5 rounded border border-brand-400/30">
          Physical
        </span>
        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/30">
          E-Book
        </span>
      </div>
    );
  }
  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
      format === 'physical'
        ? 'text-brand-400 bg-brand-400/10 border-brand-400/30'
        : 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    }`}>
      {format === 'physical' ? 'Physical' : 'E-Book'}
    </span>
  );
}

function ProductFormModal({ categories, editingBook, onClose, onSuccess }) {
  const isEditing = !!editingBook;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    if (editingBook) {
      return {
        title: editingBook.title || '',
        author: editingBook.author || '',
        isbn: editingBook.isbn || '',
        description: editingBook.description || '',
        category: editingBook.category?._id || editingBook.category || '',
        price: editingBook.price?.toString() || '',
        discountPrice: editingBook.discountPrice?.toString() || '',
        format: editingBook.format || 'physical',
        physicalStock: editingBook.physicalBook?.stock?.toString() || '0',
        physicalWeight: editingBook.physicalBook?.weight?.toString() || '',
        physicalShippingCost: editingBook.physicalBook?.shippingCost?.toString() || '',
        ebookFileSize: editingBook.ebook?.fileSize?.toString() || '',
        ebookPreviewPages: editingBook.ebook?.previewPages?.toString() || '',
        language: editingBook.language || 'English',
        pages: editingBook.pages?.toString() || '',
        publisher: editingBook.publisher || '',
        publishedYear: editingBook.publishedYear?.toString() || '',
        tags: Array.isArray(editingBook.tags) ? editingBook.tags.join(', ') : (editingBook.tags || ''),
      };
    }
    return { ...INITIAL_FORM };
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(editingBook?.coverImage || null);
  const [errors, setErrors] = useState({});

  const createProduct = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        const { data } = await api.put(`/products/${editingBook._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      }
      const { data } = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Book updated successfully' : 'Book added successfully');
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Operation failed'),
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.title.trim()) errs.title = 'Title is required';
      if (!form.author.trim()) errs.author = 'Author is required';
      if (!form.category) errs.category = 'Category is required';
      if (!form.description.trim()) errs.description = 'Description is required';
      if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price is required';
    }
    if (s === 2) {
      if (form.format === 'physical' || form.format === 'both') {
        if (!form.physicalStock && form.physicalStock !== '0') errs.physicalStock = 'Stock is required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('author', form.author);
    fd.append('isbn', form.isbn);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('price', form.price);
    fd.append('format', form.format);
    if (form.discountPrice) fd.append('discountPrice', form.discountPrice);
    fd.append('language', form.language);
    if (form.pages) fd.append('pages', form.pages);
    if (form.publisher) fd.append('publisher', form.publisher);
    if (form.publishedYear) fd.append('publishedYear', form.publishedYear);
    if (form.tags) fd.append('tags', form.tags);

    if (form.format === 'physical' || form.format === 'both') {
      fd.append('physicalStock', form.physicalStock || '0');
      if (form.physicalWeight) fd.append('physicalWeight', form.physicalWeight);
      if (form.physicalShippingCost) fd.append('physicalShippingCost', form.physicalShippingCost);
    }
    if (form.format === 'ebook' || form.format === 'both') {
      if (form.ebookFileSize) fd.append('ebookFileSize', form.ebookFileSize);
      if (form.ebookPreviewPages) fd.append('ebookPreviewPages', form.ebookPreviewPages);
    }

    if (coverFile) fd.append('coverImage', coverFile);
    createProduct.mutate(fd);
  };

  const showPhysical = form.format === 'physical' || form.format === 'both';
  const showEbook = form.format === 'ebook' || form.format === 'both';

  const FieldError = ({ name }) =>
    errors[name] ? <p className="text-red-400 text-xs mt-1">{errors[name]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 rounded-2xl border border-surface-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-surface-700">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-white rounded-xl hover:bg-surface-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  step === s.num
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                    : step > s.num
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-surface-800 text-surface-500 border border-surface-700'
                }`}>
                  {step > s.num ? <Check className="w-3 h-3" /> : <span>{s.num}</span>}
                  <span>{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px ${step > s.num ? 'bg-green-500/40' : 'bg-surface-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="p-6 pt-0 space-y-5">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Book title" />
                  <FieldError name="title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Author *</label>
                  <input name="author" value={form.author} onChange={handleChange} className="input-field" placeholder="Author name" />
                  <FieldError name="author" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">ISBN</label>
                  <input name="isbn" value={form.isbn} onChange={handleChange} className="input-field" placeholder="978-0-00-000000-0" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} className="input-field min-h-[80px]" placeholder="Book description" />
                  <FieldError name="description" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input-field">
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <FieldError name="category" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Language</label>
                  <input name="language" value={form.language} onChange={handleChange} className="input-field" placeholder="English" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Price (RWF) *</label>
                  <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className="input-field" placeholder="0" />
                  <FieldError name="price" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Discount Price (RWF)</label>
                  <input name="discountPrice" type="number" min="0" value={form.discountPrice} onChange={handleChange} className="input-field" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Pages</label>
                  <input name="pages" type="number" min="0" value={form.pages} onChange={handleChange} className="input-field" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Publisher</label>
                  <input name="publisher" value={form.publisher} onChange={handleChange} className="input-field" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Published Year</label>
                  <input name="publishedYear" type="number" min="1000" max="2099" value={form.publishedYear} onChange={handleChange} className="input-field" placeholder="e.g. 2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="fiction, classic" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Cover Image</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-surface-800 hover:bg-surface-700 border border-surface-600 rounded-lg px-4 py-2 text-sm text-surface-300 transition-colors flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                    {coverPreview && <img src={coverPreview} alt="Preview" className="w-12 h-16 object-cover rounded shadow" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Format Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-3">Book Format *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'physical', label: 'Physical Book', icon: Package, desc: 'Printed copy with shipping' },
                    { value: 'ebook', label: 'E-Book', icon: Download, desc: 'Digital download only' },
                    { value: 'both', label: 'Both', icon: BookOpen, desc: 'Physical + digital' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, format: opt.value }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.format === opt.value
                          ? 'border-brand-400 bg-brand-400/10'
                          : 'border-surface-700 bg-surface-800/50 hover:border-surface-500'
                      }`}
                    >
                      <opt.icon className={`w-6 h-6 mb-2 ${form.format === opt.value ? 'text-brand-400' : 'text-surface-400'}`} />
                      <p className={`font-medium text-sm ${form.format === opt.value ? 'text-white' : 'text-surface-300'}`}>{opt.label}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {showPhysical && (
                <div className="glass-dark p-5 rounded-xl border border-surface-700 space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-400" /> Physical Book Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">Stock Quantity *</label>
                      <input name="physicalStock" type="number" min="0" value={form.physicalStock} onChange={handleChange} className="input-field" placeholder="0" />
                      <FieldError name="physicalStock" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">Weight (kg)</label>
                      <input name="physicalWeight" type="number" min="0" step="0.01" value={form.physicalWeight} onChange={handleChange} className="input-field" placeholder="e.g. 0.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">Shipping Cost (RWF)</label>
                      <input name="physicalShippingCost" type="number" min="0" value={form.physicalShippingCost} onChange={handleChange} className="input-field" placeholder="e.g. 2000" />
                    </div>
                  </div>
                </div>
              )}

              {showEbook && (
                <div className="glass-dark p-5 rounded-xl border border-surface-700 space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" /> E-Book Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">File Size</label>
                      <input name="ebookFileSize" value={form.ebookFileSize} onChange={handleChange} className="input-field" placeholder="e.g. 2.5 MB" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">Preview Pages</label>
                      <input name="ebookPreviewPages" type="number" min="0" value={form.ebookPreviewPages} onChange={handleChange} className="input-field" placeholder="e.g. 10" />
                    </div>
                    {!isEditing && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-surface-300 mb-1.5">PDF File (optional in dev)</label>
                        <label className="cursor-pointer bg-surface-800 hover:bg-surface-700 border border-surface-600 rounded-lg px-4 py-2 text-sm text-surface-300 transition-colors inline-flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Upload PDF
                          <input type="file" accept=".pdf,.epub,.mobi" className="hidden" name="ebookFile" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="glass-dark p-5 rounded-xl border border-surface-700">
                <h3 className="font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-surface-400">Title:</span> <span className="text-white">{form.title}</span></div>
                  <div><span className="text-surface-400">Author:</span> <span className="text-white">{form.author}</span></div>
                  <div><span className="text-surface-400">ISBN:</span> <span className="text-white">{form.isbn || 'N/A'}</span></div>
                  <div><span className="text-surface-400">Price:</span> <span className="text-white">RWF {Number(form.price).toLocaleString()}</span></div>
                  <div><span className="text-surface-400">Category:</span> <span className="text-white">{categories.find(c => c._id === form.category)?.name || 'N/A'}</span></div>
                </div>
              </div>
              <div className="glass-dark p-5 rounded-xl border border-surface-700">
                <h3 className="font-semibold text-white mb-4">Format</h3>
                <FormatBadge format={form.format} />
              </div>
              {showPhysical && (
                <div className="glass-dark p-5 rounded-xl border border-surface-700">
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-4"><Package className="w-4 h-4 text-brand-400" /> Physical Details</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><span className="text-surface-400">Stock:</span> <span className="text-white">{form.physicalStock}</span></div>
                    <div><span className="text-surface-400">Weight:</span> <span className="text-white">{form.physicalWeight ? `${form.physicalWeight} kg` : 'N/A'}</span></div>
                    <div><span className="text-surface-400">Shipping:</span> <span className="text-white">{form.physicalShippingCost ? `RWF ${form.physicalShippingCost}` : 'N/A'}</span></div>
                  </div>
                </div>
              )}
              {showEbook && (
                <div className="glass-dark p-5 rounded-xl border border-surface-700">
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-4"><Download className="w-4 h-4 text-blue-400" /> E-Book Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-surface-400">File Size:</span> <span className="text-white">{form.ebookFileSize || 'N/A'}</span></div>
                    <div><span className="text-surface-400">Preview Pages:</span> <span className="text-white">{form.ebookPreviewPages || 'N/A'}</span></div>
                  </div>
                </div>
              )}
              {coverPreview && (
                <div className="glass-dark p-5 rounded-xl border border-surface-700">
                  <h3 className="font-semibold text-white mb-2">Cover Image</h3>
                  <img src={coverPreview} alt="Cover" className="w-20 h-28 object-cover rounded shadow" />
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-700">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            {step < 3 ? (
              <button type="button" onClick={handleNext} className="btn-brand flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createProduct.isPending}
                className="btn-brand flex items-center gap-2"
              >
                {createProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isEditing ? 'Update Book' : 'Create Book'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
