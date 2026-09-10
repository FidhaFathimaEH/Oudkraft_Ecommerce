import { useState, useEffect, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCw,
  AlertCircle,
  CheckCircle,
  Inbox,
  Loader2,
  Tag,
} from 'lucide-react';
import { getAdminProducts, deleteProduct } from '../../services/admin';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

const CATEGORIES = [
  'All',
  'Eau de Parfum',
  'Attars',
  'Luxury Collection',
  'Gift Sets',
  'Bakhoor',
  'Travel Collection',
];

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return 'AED 0.00';
  return `AED ${Number(amount).toFixed(2)}`;
};

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Delete modal states
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Toast / Feedback message
  const [feedback, setFeedback] = useState(null);

  const [, startTransition] = useTransition();

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(searchQuery.trim());
        setCurrentPage(1);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 12,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const res = await getAdminProducts(params);

      if (res && res.data) {
        setProducts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        throw new Error('Unexpected product response format');
      }
    } catch (err) {
      setError(err?.message || 'Failed to retrieve products. Please check network connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Toast auto-clear
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete?._id) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteProduct(productToDelete._id);
      setProductToDelete(null);
      setFeedback({ type: 'success', message: `"${productToDelete.name}" was permanently removed from catalog.` });
      loadProducts();
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = (msg) => {
    setFeedback({ type: 'success', message: msg });
    loadProducts();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
            Catalog Inventory
          </span>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#171311]">
            Perfume Products
          </h2>
          <p className="text-sm text-[#5b5b5b]">
            Create, edit, and organize luxury fragrance flacons and collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            title="Refresh list"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e3d9c4] bg-white text-[#0D3B2E] shadow-sm hover:bg-[#efe4d0]/60 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-sm hover:bg-[#123F34] transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 text-[#C6A15B]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-medium text-emerald-900 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e3d9c4] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b5b5b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by perfume name, accord or brand..."
            className="w-full rounded-full border border-[#e3d9c4] bg-[#f8f3ea]/50 py-2 pl-10 pr-9 text-xs text-[#171311] placeholder-[#5b5b5b]/60 outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b5b5b] hover:text-[#171311]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#5b5b5b] shrink-0">
            <Filter className="h-3.5 w-3.5 text-[#C6A15B]" />
            <span className="hidden sm:inline">Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-full border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2 text-xs font-medium text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[#e3d9c4] bg-[#f8f3ea] px-3 py-2 text-xs font-semibold text-[#0D3B2E] hover:bg-[#efe4d0] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-sm">Failed to Load Products</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadProducts}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700 transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-stone-200" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-[#f8f3ea]/70" />
            ))}
          </div>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <div className="rounded-3xl border border-[#e3d9c4] bg-white shadow-sm overflow-hidden">
          {products.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f3ea] text-[#C6A15B]">
                <Inbox className="h-8 w-8" />
              </div>
              <h4 className="mt-4 font-serif text-xl font-bold text-[#171311]">
                No Fragrances Found
              </h4>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#5b5b5b]">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No products matched your search or category filter. Try clearing or relaxing your criteria.'
                  : 'Your product library is currently empty. Start by adding your first luxury perfume flacon.'}
              </p>
              <div className="mt-5 flex gap-3">
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-full border border-[#e3d9c4] bg-[#f8f3ea] px-4 py-2 text-xs font-semibold text-[#0D3B2E]"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="rounded-full bg-[#0D3B2E] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#123F34]"
                >
                  Add Product
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Responsive Table with horizontal scroll container */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e3d9c4]/60 text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f3ea]/40 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5b5b5b]">
                      <th scope="col" className="py-4 pl-6 pr-3">Product</th>
                      <th scope="col" className="px-3 py-4">Category</th>
                      <th scope="col" className="px-3 py-4">Gender</th>
                      <th scope="col" className="px-3 py-4">Price</th>
                      <th scope="col" className="px-3 py-4">Stock</th>
                      <th scope="col" className="px-3 py-4">Badges</th>
                      <th scope="col" className="py-4 pl-3 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3d9c4]/40">
                    {products.map((p) => {
                      const imageSrc =
                        Array.isArray(p.images) && p.images.length > 0
                          ? p.images[0]
                          : p.image;

                      return (
                        <tr
                          key={p._id || p.slug}
                          className="hover:bg-[#f8f3ea]/30 transition-colors"
                        >
                          {/* Product Info (Thumbnail + Name + Slug) */}
                          <td className="py-3.5 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e3d9c4] bg-white p-1">
                                {imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt={p.name}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-[#C6A15B]" />
                                )}
                              </div>
                              <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                                <p className="font-semibold text-[#171311] truncate" title={p.name}>
                                  {p.name}
                                </p>
                                <p className="font-mono text-[10px] text-[#5b5b5b] truncate">
                                  /{p.slug}
                                </p>
                                <p className="text-[10px] text-[#C6A15B] font-medium">
                                  {p.brand || 'Oud Kraft'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-3 py-3.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f8f3ea] px-2.5 py-1 text-[11px] font-medium text-[#0D3B2E]">
                              <Tag className="h-3 w-3 text-[#C6A15B]" />
                              <span>{p.category}</span>
                            </span>
                          </td>

                          {/* Gender */}
                          <td className="px-3 py-3.5 text-[#171311]">
                            <span className="text-[11px] font-medium">
                              {p.gender || 'Unisex'}
                            </span>
                          </td>

                          {/* Price / Old Price */}
                          <td className="px-3 py-3.5">
                            <p className="font-semibold text-[#171311]">
                              {formatCurrency(p.price)}
                            </p>
                            {p.oldPrice != null && Number(p.oldPrice) > Number(p.price) && (
                              <p className="text-[10px] text-[#5b5b5b] line-through">
                                {formatCurrency(p.oldPrice)}
                              </p>
                            )}
                          </td>

                          {/* Stock Status */}
                          <td className="px-3 py-3.5">
                            {p.stock <= 0 ? (
                              <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                                Out of Stock
                              </span>
                            ) : p.stock <= 5 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {p.stock} units left
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {p.stock} in stock
                              </span>
                            )}
                          </td>

                          {/* Badges */}
                          <td className="px-3 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {p.featured && (
                                <span className="rounded-full border border-[#C6A15B]/40 bg-[#C6A15B]/15 px-2 py-0.5 text-[9px] font-semibold uppercase text-[#0D3B2E]">
                                  Featured
                                </span>
                              )}
                              {p.bestseller && (
                                <span className="rounded-full border border-[#0D3B2E]/30 bg-[#0D3B2E]/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-[#0D3B2E]">
                                  Bestseller
                                </span>
                              )}
                              {!p.featured && !p.bestseller && (
                                <span className="text-[10px] text-[#5b5b5b]">—</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                title="Edit Product"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3d9c4] text-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-white transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setProductToDelete(p);
                                  setDeleteError('');
                                }}
                                title="Delete Product"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3d9c4] text-[#5b5b5b] hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e3d9c4]/60 px-6 py-4 bg-[#f8f3ea]/20">
                  <p className="text-xs text-[#5b5b5b]">
                    Showing Page <strong className="text-[#171311]">{pagination.page}</strong> of{' '}
                    <strong className="text-[#171311]">{pagination.pages}</strong> ({pagination.total} total items)
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || loading}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex h-8 items-center gap-1 rounded-full border border-[#e3d9c4] bg-white px-3 text-xs font-medium text-[#171311] hover:bg-[#efe4d0]/60 transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentPage >= pagination.pages || loading}
                      onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                      className="flex h-8 items-center gap-1 rounded-full border border-[#e3d9c4] bg-white px-3 text-xs font-medium text-[#171311] hover:bg-[#efe4d0]/60 transition-colors disabled:opacity-40"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        initialProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[#e3d9c4] bg-white p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#171311]">
                    Delete Fragrance?
                  </h4>
                  <p className="text-xs text-[#5b5b5b]">
                    This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-[#f8f3ea]/50 p-4 text-xs text-[#171311]">
                <p>Are you sure you want to remove this perfume from the catalog?</p>
                <p className="mt-2 font-semibold text-[#0D3B2E]">
                  {productToDelete.name}
                </p>
                <p className="font-mono text-[10px] text-[#5b5b5b]">
                  Slug: {productToDelete.slug}
                </p>
              </div>

              {deleteError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setProductToDelete(null)}
                  className="rounded-full border border-[#e3d9c4] bg-white px-4 py-2 text-xs font-semibold text-[#5b5b5b] hover:bg-[#f8f3ea] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-800 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
