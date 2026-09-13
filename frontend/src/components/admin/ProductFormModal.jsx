import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Trash2,
  Crown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { createProduct, updateProduct } from '../../services/admin';
import { uploadProductImages } from '../../services/upload';

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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const fileInputRef = useRef(null);

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
      setImageUploadError('');
      setManualUrlInput('');
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
      setImageUploadError('');
      setManualUrlInput('');
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

  const currentImages = parseArrayInput(form.images);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setImageUploadError('');

    const files = Array.from(fileList);
    if (files.length > 5) {
      setImageUploadError('You can upload a maximum of 5 images at once.');
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setImageUploadError(`"${file.name}" is not a supported image file (JPEG, PNG, WebP, GIF, AVIF).`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError(`"${file.name}" exceeds the 5 MB maximum file size.`);
        return;
      }
      validFiles.push(file);
    }

    setUploadingImages(true);
    try {
      const uploadRes = await uploadProductImages(validFiles);
      const newUrls = (Array.isArray(uploadRes) ? uploadRes : [uploadRes]).map((item) => item.url);
      const updatedList = [...currentImages, ...newUrls];
      setForm((prev) => ({ ...prev, images: updatedList.join(', ') }));
    } catch (err) {
      setImageUploadError(err?.message || 'Failed to upload image(s).');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetHero = (index) => {
    if (index <= 0 || index >= currentImages.length) return;
    const hero = currentImages[index];
    const remaining = currentImages.filter((_, idx) => idx !== index);
    const updated = [hero, ...remaining];
    setForm((prev) => ({ ...prev, images: updated.join(', ') }));
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= currentImages.length ||
      toIndex >= currentImages.length
    ) {
      return;
    }
    const updated = [...currentImages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setForm((prev) => ({ ...prev, images: updated.join(', ') }));
  };

  const handleRemoveImage = (index) => {
    const updated = currentImages.filter((_, idx) => idx !== index);
    setForm((prev) => ({ ...prev, images: updated.join(', ') }));
  };

  const handleAddManualUrl = (e) => {
    if (e) e.preventDefault();
    const trimmed = manualUrlInput.trim();
    if (!trimmed) return;
    const updated = [...currentImages, trimmed];
    setForm((prev) => ({ ...prev, images: updated.join(', ') }));
    setManualUrlInput('');
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
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#e3d9c4]/60 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B] flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>4. Flacon Imagery & Story</span>
                  </h4>
                  <span className="text-[11px] font-medium text-[#5b5b5b]">
                    {currentImages.length} {currentImages.length === 1 ? 'image' : 'images'}
                  </span>
                </div>

                {/* Upload Error Alert */}
                {imageUploadError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{imageUploadError}</div>
                    <button
                      type="button"
                      onClick={() => setImageUploadError('')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-semibold text-[#171311] mb-1.5">
                    Upload Product Images (Cloudinary CDN)
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFiles(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => !uploadingImages && fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-[#0D3B2E] bg-[#0D3B2E]/5'
                        : 'border-[#e3d9c4] bg-[#f8f3ea]/40 hover:border-[#C6A15B] hover:bg-[#f8f3ea]'
                    } ${uploadingImages ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                      disabled={uploadingImages}
                    />

                    {uploadingImages ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="h-7 w-7 animate-spin text-[#0D3B2E]" />
                        <span className="text-xs font-semibold text-[#0D3B2E]">
                          Uploading image(s) to Cloudinary...
                        </span>
                        <span className="text-[11px] text-[#5b5b5b]">
                          Generating high-performance CDN URLs
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D3B2E]/10 text-[#0D3B2E]">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#171311]">
                            Click to browse or drag and drop flacon photos
                          </p>
                          <p className="text-[11px] text-[#5b5b5b] mt-0.5">
                            Supports JPEG, PNG, WebP up to 5 MB each (up to 5 images at once)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Gallery Preview & Reordering */}
                {currentImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-[#171311]">
                        Configured Images Preview & Ordering
                      </label>
                      <span className="text-[11px] text-[#5b5b5b]">
                        The 1st flacon photo serves as the storefront Hero
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {currentImages.map((imgUrl, idx) => {
                        const isHero = idx === 0;
                        return (
                          <div
                            key={`${imgUrl}-${idx}`}
                            className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white p-2 shadow-sm transition-all ${
                              isHero
                                ? 'border-[#C6A15B] ring-2 ring-[#C6A15B]/30'
                                : 'border-[#e3d9c4] hover:border-[#0D3B2E]/40'
                            }`}
                          >
                            {/* Image Container */}
                            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#f8f3ea]">
                              <img
                                src={imgUrl}
                                alt={`Product view ${idx + 1}`}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23ccc" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                                }}
                                className="h-full w-full object-cover"
                              />

                              {/* Hero Badge */}
                              {isHero ? (
                                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-[#0D3B2E] px-2 py-0.5 text-[10px] font-bold text-[#C6A15B] shadow">
                                  <Crown className="h-3 w-3" />
                                  <span>Hero Flacon</span>
                                </span>
                              ) : (
                                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                  #{idx + 1}
                                </span>
                              )}

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                title="Remove image"
                                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Card Controls */}
                            <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-[#e3d9c4]/50">
                              {!isHero ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetHero(idx)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0D3B2E] hover:text-[#C6A15B] transition-colors"
                                >
                                  <Crown className="h-3 w-3" />
                                  <span>Make Hero</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-[#C6A15B]">
                                  Main Display
                                </span>
                              )}

                              <div className="flex items-center gap-0.5 ml-auto">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveImage(idx, idx - 1)}
                                  title="Move earlier"
                                  className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#f8f3ea] text-[#5b5b5b] disabled:opacity-25"
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === currentImages.length - 1}
                                  onClick={() => handleMoveImage(idx, idx + 1)}
                                  title="Move later"
                                  className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#f8f3ea] text-[#5b5b5b] disabled:opacity-25"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Add Single URL Fallback */}
                <div>
                  <label className="block text-xs font-semibold text-[#171311] mb-1">
                    Quick Add via Single URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={manualUrlInput}
                      onChange={(e) => setManualUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddManualUrl();
                        }
                      }}
                      placeholder="https://images.example.com/fragrance.jpg"
                      className="flex-1 font-mono rounded-xl border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2 text-xs text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#0D3B2E] bg-[#0D3B2E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#123F34] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Raw Comma-separated Input (Preserved for full backward compatibility) */}
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

                {/* Short Description */}
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

                {/* Detailed Story */}
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
              disabled={submitting || uploadingImages}
              className="rounded-full border border-[#e3d9c4] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#5b5b5b] hover:bg-[#f8f3ea] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={submitting || uploadingImages}
              className="inline-flex items-center gap-2 rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-sm hover:bg-[#123F34] transition-all disabled:opacity-50 active:scale-95"
            >
              {uploadingImages ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading photos...</span>
                </>
              ) : submitting ? (
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
