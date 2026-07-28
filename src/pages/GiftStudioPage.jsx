import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { getProducts } from '../services/products';
import { uploadGiftFile } from '../services/uploads';

const occasions = ['Birthday', 'Anniversary', 'Wedding', 'Eid', 'Graduation', 'Corporate Gift', 'Other'];

export const GiftStudioPage = () => {
  const products = getProducts();
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [giftWrap, setGiftWrap] = useState('Signature Wrap');
  const [message, setMessage] = useState('For a cherished evening.');
  const [occasion, setOccasion] = useState('Birthday');
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const selected = useMemo(() => products.find((product) => product.id === selectedProduct) || products[0], [products, selectedProduct]);

  const handleUpload = async (event) => {
    const uploaded = await uploadGiftFile(event.target.files?.[0]);
    setFile(uploaded);
    setUploadedFile(uploaded);
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">Gift Studio</p>
          <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">Create a gift they will remember</h1>
          <p className="mt-4 max-w-2xl text-[#5b5b5b]">Choose perfume, wrapping, a personal note and an occasion to build a gift-ready presentation.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Choose perfume</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none">
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Gift wrapping</label>
                <select value={giftWrap} onChange={(e) => setGiftWrap(e.target.value)} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none">
                  <option value="Signature Wrap">Signature Wrap</option>
                  <option value="Velvet Box">Velvet Box</option>
                  <option value="Luxury Sleeve">Luxury Sleeve</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Personal message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="3" className="w-full rounded-[24px] border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Occasion</label>
                <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none">
                  {occasions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Upload image</label>
                <input type="file" onChange={handleUpload} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3" />
                {uploadedFile ? <p className="mt-2 text-sm text-[#0D3B2E]">Ready for backend upload: {uploadedFile.name}</p> : null}
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-6 text-white shadow-sm">
            <h2 className="text-xl font-semibold">Live gift summary</h2>
            <div className="mt-6 space-y-4 text-sm text-[#efe4d0]">
              <div className="flex justify-between"><span>Perfume</span><span>{selected?.name}</span></div>
              <div className="flex justify-between"><span>Gift wrap</span><span>{giftWrap}</span></div>
              <div className="flex justify-between"><span>Occasion</span><span>{occasion}</span></div>
              <div className="flex justify-between"><span>Message</span><span>{message}</span></div>
              <div className="border-t border-white/20 pt-4 text-base font-semibold text-white">
                <div className="flex justify-between"><span>Estimated total</span><span>AED {selected?.price + 35}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
