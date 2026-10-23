import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Package,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { recordConfirmedWhatsAppOrder } from '../../services/admin';

const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

export const RecordWhatsAppOrderModal = ({
  isOpen,
  onClose,
  onOrderCreated,
  catalogProducts = [],
}) => {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    emirate: 'Abu Dhabi',
    area: '',
    street: '',
    building: '',
    apartment: '',
    instructions: '',
    notes: '',
    deliveryFee: '20',
    discount: '0',
  });

  const [items, setItems] = useState([
    {
      product: '',
      name: '',
      size: '100 ml',
      quantity: 1,
      price: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-update delivery fee when emirate changes
      if (field === 'emirate') {
        const sub = calculateSubtotal(items);
        if (sub >= 250) {
          next.deliveryFee = '0';
        } else {
          next.deliveryFee = value.toLowerCase() === 'abu dhabi' ? '20' : '35';
        }
      }
      return next;
    });
    setError('');
  };

  const calculateSubtotal = (itemList) => {
    return itemList.reduce((sum, it) => {
      const p = Number(it.price) || 0;
      const q = Number(it.quantity) || 1;
      return sum + p * q;
    }, 0);
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      // If choosing a catalog product, autofill name, price, size
      if (field === 'product' && value) {
        const prod = catalogProducts.find((p) => (p._id || p.id) === value);
        if (prod) {
          next[index].name = prod.name;
          next[index].price = String(prod.price || '');
          next[index].size = prod.size || '100 ml';
        }
      }

      // Check free delivery threshold
      const newSubtotal = calculateSubtotal(next);
      if (newSubtotal >= 250) {
        setForm((f) => ({ ...f, deliveryFee: '0' }));
      }

      return next;
    });
    setError('');
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        product: '',
        name: '',
        size: '100 ml',
        quantity: 1,
        price: '',
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const subtotal = calculateSubtotal(items);
  const fee = Number(form.deliveryFee) || 0;
  const disc = Number(form.discount) || 0;
  const grandTotal = Math.max(0, subtotal + fee - disc);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.customerName.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (!form.customerPhone.trim()) {
      setError('Customer WhatsApp phone number is required.');
      return;
    }

    if (!form.emirate) {
      setError('Delivery emirate is required.');
      return;
    }

    // Validate items
    const validItems = items.filter((it) => it.name.trim() && Number(it.price) > 0);
    if (validItems.length === 0) {
      setError('Please provide at least one valid item with a name and price.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        customer: {
          name: form.customerName.trim(),
          phone: form.customerPhone.trim(),
          email: form.customerEmail.trim(),
        },
        deliveryAddress: {
          emirate: form.emirate,
          area: form.area.trim(),
          street: form.street.trim(),
          building: form.building.trim(),
          apartment: form.apartment.trim(),
          instructions: form.instructions.trim(),
        },
        items: validItems.map((it) => ({
          product: it.product || undefined,
          name: it.name.trim(),
          size: it.size.trim() || '100 ml',
          quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
          price: Number(it.price),
        })),
        deliveryFee: fee,
        discount: disc,
        notes: form.notes.trim(),
      };

      const res = await recordConfirmedWhatsAppOrder(payload);
      if (res && res.data) {
        onOrderCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to record confirmed order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[28px] border border-[#e3d9c4] bg-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e3d9c4]/60 px-6 py-4 bg-[#F8F4EC]/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123F34] text-[#C6A15B]">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0D3B2E]">
                  Record Confirmed WhatsApp Order
                </h3>
                <p className="text-[11px] text-[#5b5b5b]">
                  Persist a customer order agreed on WhatsApp to generate a branded PDF invoice.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#5b5b5b] hover:bg-[#F8F4EC] hover:text-[#0D3B2E]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#C6A15B]">
                1. Customer Details (from WhatsApp)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => updateField('customerName', e.target.value)}
                    placeholder="e.g. Fatima Al Mansoori"
                    className="w-full rounded-xl border border-[#e3d9c4] px-3.5 py-2 text-xs text-[#171311] outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.customerPhone}
                    onChange={(e) => updateField('customerPhone', e.target.value)}
                    placeholder="e.g. +971 50 123 4567"
                    className="w-full rounded-xl border border-[#e3d9c4] px-3.5 py-2 text-xs text-[#171311] outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => updateField('customerEmail', e.target.value)}
                    placeholder="e.g. fatima@example.ae"
                    className="w-full rounded-xl border border-[#e3d9c4] px-3.5 py-2 text-xs text-[#171311] outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#C6A15B]">
                2. Delivery Destination
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Emirate *
                  </label>
                  <select
                    value={form.emirate}
                    onChange={(e) => updateField('emirate', e.target.value)}
                    className="w-full rounded-xl border border-[#e3d9c4] px-3.5 py-2 text-xs text-[#171311] outline-none focus:border-[#C6A15B] bg-white"
                  >
                    {EMIRATES.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Area / District
                  </label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => updateField('area', e.target.value)}
                    placeholder="e.g. Al Bateen / Downtown"
                    className="w-full rounded-xl border border-[#e3d9c4] px-3.5 py-2 text-xs text-[#171311] outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Street Name
                  </label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    placeholder="e.g. Corniche Road"
                    className="w-full rounded-xl border border-[#e3d9c4] px-3.5 py-2 text-xs text-[#171311] outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Building / Villa / Suite
                  </label>
                  <input
                    type="text"
                    value={form.building}
                    onChange={(e) => updateField('building', e.target.value)}
                    placeholder="e.g. Villa 12 or Apt 402"
                    className="w-full rounded-xl border border-[#e3d9c4] px-3.5 py-2 text-xs text-[#171311] outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#C6A15B]">
                  3. Confirmed Items & Agreed Prices
                </h4>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-semibold text-[#0D3B2E] hover:bg-[#efe4d0]"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-2xl border border-[#e3d9c4] p-3 bg-stone-50/50"
                  >
                    {/* Catalog Dropdown shortcut */}
                    {catalogProducts.length > 0 && (
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                        className="rounded-lg border border-[#e3d9c4] bg-white px-2 py-1.5 text-xs text-[#171311] outline-none w-full sm:w-36 truncate"
                      >
                        <option value="">-- Catalog Item --</option>
                        {catalogProducts.map((p) => (
                          <option key={p._id || p.id} value={p._id || p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="Item name / scent"
                      className="flex-1 rounded-lg border border-[#e3d9c4] bg-white px-2.5 py-1.5 text-xs text-[#171311] outline-none w-full"
                    />

                    <input
                      type="text"
                      value={item.size}
                      onChange={(e) => handleItemChange(idx, 'size', e.target.value)}
                      placeholder="Size (e.g. 100 ml)"
                      className="w-24 rounded-lg border border-[#e3d9c4] bg-white px-2 py-1.5 text-xs text-[#171311] outline-none"
                    />

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-14 rounded-lg border border-[#e3d9c4] bg-white px-2 py-1.5 text-xs text-[#171311] outline-none text-center"
                        title="Quantity"
                      />

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#5b5b5b]">AED</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          placeholder="Price"
                          className="w-20 rounded-lg border border-[#e3d9c4] bg-white px-2 py-1.5 text-xs text-[#171311] outline-none text-right font-medium"
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Adjustments & Summary */}
            <div className="rounded-2xl bg-[#F8F4EC] p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Delivery Fee (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.deliveryFee}
                    onChange={(e) => updateField('deliveryFee', e.target.value)}
                    className="w-full rounded-xl border border-[#e3d9c4] px-3 py-1.5 text-xs bg-white text-[#171311] outline-none"
                  />
                  <p className="mt-0.5 text-[10px] text-[#5b5b5b]">
                    Free delivery applies automatically for subtotal ≥ 250 AED.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D3B2E] mb-1">
                    Agreed Discount (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.discount}
                    onChange={(e) => updateField('discount', e.target.value)}
                    className="w-full rounded-xl border border-[#e3d9c4] px-3 py-1.5 text-xs bg-white text-[#171311] outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-[#e3d9c4] pt-2.5 flex justify-between items-baseline font-semibold">
                <span className="text-[#0D3B2E]">Total Agreed (COD):</span>
                <span className="text-base text-[#0D3B2E] font-serif font-bold">
                  AED {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e3d9c4]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#e3d9c4] px-5 py-2.5 text-xs font-semibold text-[#5b5b5b] hover:bg-[#F8F4EC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[#0D3B2E] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-[#123F34] transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Package size={14} />
                    Confirm & Record Order
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

RecordWhatsAppOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOrderCreated: PropTypes.func.isRequired,
  catalogProducts: PropTypes.array,
};
