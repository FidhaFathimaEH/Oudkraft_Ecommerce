import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { createProduct, updateProduct } from '../../services/admin';

const CATEGORIES = [
  'Eau de Parfum',
  'Attars',
  'Luxury Collection',
  'Gift Sets',
  'Bakhoor',
  'Travel Collection',
];

const GENDERS = ['Men', 'Women', 'Unisex'];

const FRAGRANCE_FAMILIES = [
  'Oud',
  'Woody',
  'Floral',
  'Fresh',
  'Amber',
  'Musk',
  'Citrus',
  'Oriental',
];

const SIZES = ['100 ml', '50 ml', '12 ml', '10 ml', '40 g', 'Gift Set', 'Travel Trio'];

export const ProductFormModal = ({ isOpen, onClose, onSuccess, initialProduct }) => {
  const isEdit = Boolean(initialProduct?._id);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    brand: 'Oud Kraft',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    fragranceFamily: 'Oud',
    size: '100 ml',
    price: '',
    oldPrice: '',
    discount: '',
    stock: 10,
    featured: false,
    bestseller: false,
    description: '',
    detailedDescription: '',
    inspiration: '',
    topNotes: '',
    middleNotes: '',
    baseNotes: '',
    images: '',
    delivery: 'Complimentary UAE delivery within 2-3 business days',
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form on edit or reset on create
  useEffect(() => {
    if (initialProduct && isOpen) {
      const formatArrayField = (val) => {
        if (Array.isArray(val)) return val.join(', ');
        return val || '';
      };

      setForm({
        name: initialProduct.name || '',
        slug: initialProduct.slug || '',
        brand: initialProduct.brand || 'Oud Kraft',
        category: initialProduct.category || 'Eau de Parfum',
        gender: initialProduct.gender || 'Unisex',
        fragranceFamily: initialProduct.fragranceFamily || 'Oud',
        size: initialProduct.size || '100 ml',
        price: initialProduct.price != null ? String(initialProduct.price) : '',
        oldPrice: initialProduct.oldPrice != null ? String(initialProduct.oldPrice) : '',
        discount: initialProduct.discount || '',
        stock: initialProduct.stock != null ? initialProduct.stock : 0,
        featured: Boolean(initialProduct.featured),
        bestseller: Boolean(initialProduct.bestseller),
        description: initialProduct.description || '',
        detailedDescription: initialProduct.detailedDescription || '',
        inspiration: initialProduct.inspiration || '',
        topNotes: formatArrayField(initialProduct.topNotes),
        middleNotes: formatArrayField(initialProduct.middleNotes || initialProduct.heartNotes),
        baseNotes: formatArrayField(initialProduct.baseNotes),
        images: formatArrayField(initialProduct.images),
        delivery: initialProduct.delivery || 'Complimentary UAE delivery within 2-3 business days',
      });
      setSlugManuallyEdited(true);
      setError('');
    } else if (isOpen) {
      setForm({
        name: '',
        slug: '',
        brand: 'Oud Kraft',
        category: 'Eau de Parfum',
        gender: 'Unisex',
        fragranceFamily: 'Oud',
        size: '100 ml',
        price: '',
        oldPrice: '',
        discount: '',
        stock: 10,
        featured: false,
        bestseller: false,
        description: '',
        detailedDescription: '',
        inspiration: '',
        topNotes: '',
        middleNotes: '',
        baseNotes: '',
        images: '',
        delivery: 'Complimentary UAE delivery within 2-3 business days',
      });
      setSlugManuallyEdited(false);
      setError('');
    }
  }, [initialProduct, isOpen]);

  // Auto-slugify name if not manually edited
  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!slugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setForm((prev) => ({ ...prev, name: val, slug: generated }));
    } else {
      setForm((prev) => ({ ...prev, name: val }));
    }
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
  };

  const parseArrayInput = (str) => {
    if (!str || typeof str !== 'string') return [];
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!form.slug.trim()) {
      setError('Product slug is required.');
      return;
    }
    const numPrice = Number(form.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('A valid positive price in AED is required.');
      return;
    }
    const numStock = Number(form.stock);
    if (isNaN(numStock) || numStock < 0) {
      setError('Stock count must be 0 or greater.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      brand: form.brand.trim() || 'Oud Kraft',
      category: form.category,
      gender: form.gender,
      fragranceFamily: form.fragranceFamily,
      size: form.size,
      price: numPrice,
      oldPrice: form.oldPrice !== '' ? Number(form.oldPrice) : undefined,
      discount: form.discount.trim() || undefined,
      stock: numStock,
      featured: form.featured,
      bestseller: form.bestseller,
      description: form.description.trim(),
      detailedDescription: form.detailedDescription.trim() || undefined,
      inspiration: form.inspiration.trim() || undefined,
      topNotes: parseArrayInput(form.topNotes),
      middleNotes: parseArrayInput(form.middleNotes),
      heartNotes: parseArrayInput(form.middleNotes),
      baseNotes: parseArrayInput(form.baseNotes),
      images: parseArrayInput(form.images),
      delivery: form.delivery.trim() || undefined,
    };

    setSubmitting(true);

    try {
      if (isEdit) {
        await updateProduct(initialProduct._id, payload);
      } else {
        await createProduct(payload);
      }

      onSuccess(isEdit ? 'Product updated successfully' : 'Product created successfully');
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save product. Please verify fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25 }}
          className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-[#e3d9c4] bg-[#f8f3ea] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e3d9c4] bg-white px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D3B2E] text-[#C6A15B]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171311]">
                  {isEdit ? 'Edit Fragrance Product' : 'Add New Fragrance Product'}
                </h3>
                <p className="text-xs text-[#5b5b5b]">
                  {isEdit
                    ? `Updating catalog record for ${initialProduct?.name || 'product'}`
                    : 'Create a new perfume flacon or gift set entry in the Oud Kraft library'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full p-2 text-[#5b5b5b] hover:bg-[#f8f3ea] hover:text-[#171311] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                  1. Essential Identity
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={handleNameChange}
                      placeholder="e.g. Royal Oud Extrait"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={handleSlugChange}
                      placeholder="royal-oud-extrait"
                      className="mt-1.5 w-full font-mono rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Gender Classification <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Brand / House
                    </label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="Oud Kraft"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  {/* Fragrance Family */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Fragrance Family
                    </label>
                    <select
                      value={form.fragranceFamily}
                      onChange={(e) => setForm({ ...form, fragranceFamily: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    >
                      {FRAGRANCE_FAMILIES.map((fam) => (
                        <option key={fam} value={fam}>{fam}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Inventory */}
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                  2. Pricing & Inventory
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Price (AED) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="450.00"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  {/* Old Price */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Regular / Old Price (AED)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.oldPrice}
                      onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                      placeholder="550.00"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Stock Units <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="25"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  {/* Bottle Size */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Bottle Size
                    </label>
                    <select
                      value={form.size}
                      onChange={(e) => setForm({ ...form, size: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    >
                      {SIZES.map((sz) => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Feature / Bestseller Checkboxes */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#171311]">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-[#e3d9c4] text-[#0D3B2E] focus:ring-[#0D3B2E]"
                    />
                    <span>Mark as <strong>Featured Collection</strong></span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#171311]">
                    <input
                      type="checkbox"
                      checked={form.bestseller}
                      onChange={(e) => setForm({ ...form, bestseller: e.target.checked })}
                      className="h-4 w-4 rounded border-[#e3d9c4] text-[#0D3B2E] focus:ring-[#0D3B2E]"
                    />
                    <span>Mark as <strong>Bestseller</strong></span>
                  </label>
                </div>
              </div>

              {/* Section 3: Olfactory Notes */}
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                  3. Olfactory Notes (Comma-separated)
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Top Notes
                    </label>
                    <input
                      type="text"
                      value={form.topNotes}
                      onChange={(e) => setForm({ ...form, topNotes: e.target.value })}
                      placeholder="Bergamot, Pink Pepper, Saffron"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Heart / Middle Notes
                    </label>
                    <input
                      type="text"
                      value={form.middleNotes}
                      onChange={(e) => setForm({ ...form, middleNotes: e.target.value })}
                      placeholder="Damask Rose, Incense, Cedar"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171311]">
                      Base Notes
                    </label>
                    <input
                      type="text"
                      value={form.baseNotes}
                      onChange={(e) => setForm({ ...form, baseNotes: e.target.value })}
                      placeholder="Cambodi Oud, Amber, White Musk"
                      className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Imagery & Story */}
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                  4. Imagery & Fragrance Story
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#171311] flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-[#C6A15B]" />
                    <span>Image URLs (Comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="https://example.com/perfume1.jpg, https://example.com/perfume2.jpg"
                    className="mt-1.5 w-full font-mono rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                  />
                  <p className="mt-1 text-[11px] text-[#5b5b5b]">
                    Provide public image URLs or CDN paths. The first image will serve as the hero flacon.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171311]">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief poetic summary for product cards and quick previews..."
                    className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171311]">
                    Detailed Fragrance Story & Inspiration
                  </label>
                  <textarea
                    rows={3}
                    value={form.detailedDescription}
                    onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
                    placeholder="In-depth narrative exploring the perfumer's creation, rare agarwood distillation, and accords..."
                    className="mt-1.5 w-full rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2.5 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#e3d9c4] bg-white px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full border border-[#e3d9c4] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#5b5b5b] hover:bg-[#f8f3ea] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-sm hover:bg-[#123F34] transition-all disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

ProductFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  initialProduct: PropTypes.object,
};
