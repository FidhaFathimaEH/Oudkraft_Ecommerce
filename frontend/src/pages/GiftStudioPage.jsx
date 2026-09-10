import { useEffect, useMemo, useState } from 'react';

import { Layout } from '../components/Layout';
import { getProducts } from '../services/products';
import { uploadGiftFile } from '../services/uploads';

const occasions = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Eid',
  'Graduation',
  'Corporate Gift',
  'Other',
];

const ribbonOptions = ['Gold', 'Emerald', 'Ivory', 'Burgundy'];

const engravingOptions = [
  'No engraving',
  'Initials',
  'Name',
  'Special date',
];

const greetingCardOptions = [
  'Classic card',
  'Luxury card',
  'Handwritten note',
];

export const GiftStudioPage = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [selectedProduct, setSelectedProduct] = useState('');
  const [giftWrap, setGiftWrap] = useState('Signature Wrap');
  const [message, setMessage] = useState('For a cherished evening.');
  const [occasion, setOccasion] = useState('Birthday');
  const [ribbonColor, setRibbonColor] = useState('Gold');
  const [engraving, setEngraving] = useState('No engraving');
  const [greetingCard, setGreetingCard] = useState('Classic card');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError('');

        const result = await getProducts();

        if (!isMounted) return;

        const productList = Array.isArray(result) ? result : [];

        setProducts(productList);

        if (productList.length > 0) {
          setSelectedProduct(
            productList[0].id || productList[0]._id || ''
          );
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('Failed to load Gift Studio products:', error);
        setProductsError('Unable to load perfumes right now.');
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const selected = useMemo(
    () =>
      products.find(
        (product) =>
          (product.id || product._id) === selectedProduct
      ) || products[0],
    [products, selectedProduct]
  );

  const handleUpload = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    try {
      setUploading(true);

      const uploaded = await uploadGiftFile(selectedFile);

      setUploadedFile(uploaded);
    } catch (error) {
      console.error('Gift file upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">
            Gift Studio
          </p>

          <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">
            Create a gift they will remember
          </h1>

          <p className="mt-4 max-w-2xl text-[#5b5b5b]">
            Choose perfume, wrapping, a personal note and an occasion to
            build a gift-ready presentation.
          </p>
        </div>

        {productsLoading ? (
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-8 text-center text-[#5b5b5b] shadow-sm">
            Loading perfumes...
          </div>
        ) : productsError ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
            {productsError}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-8 text-center text-[#5b5b5b] shadow-sm">
            No perfumes are available for gifting right now.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Choose perfume
                  </label>

                  <select
                    value={selectedProduct}
                    onChange={(event) =>
                      setSelectedProduct(event.target.value)
                    }
                    className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                  >
                    {products.map((product) => {
                      const productId = product.id || product._id;

                      return (
                        <option key={productId} value={productId}>
                          {product.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Gift wrapping
                  </label>

                  <select
                    value={giftWrap}
                    onChange={(event) =>
                      setGiftWrap(event.target.value)
                    }
                    className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                  >
                    <option value="Signature Wrap">
                      Signature Wrap
                    </option>
                    <option value="Velvet Box">Velvet Box</option>
                    <option value="Luxury Sleeve">
                      Luxury Sleeve
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Personal message
                  </label>

                  <textarea
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    rows="3"
                    className="w-full rounded-[24px] border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Occasion
                  </label>

                  <select
                    value={occasion}
                    onChange={(event) =>
                      setOccasion(event.target.value)
                    }
                    className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                  >
                    {occasions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Ribbon color
                  </label>

                  <select
                    value={ribbonColor}
                    onChange={(event) =>
                      setRibbonColor(event.target.value)
                    }
                    className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                  >
                    {ribbonOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Bottle engraving
                  </label>

                  <select
                    value={engraving}
                    onChange={(event) =>
                      setEngraving(event.target.value)
                    }
                    className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                  >
                    {engravingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Greeting card
                  </label>

                  <select
                    value={greetingCard}
                    onChange={(event) =>
                      setGreetingCard(event.target.value)
                    }
                    className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                  >
                    {greetingCardOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Upload image
                  </label>

                  <input
                    type="file"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3"
                  />

                  {uploading ? (
                    <p className="mt-2 text-sm text-[#5b5b5b]">
                      Uploading...
                    </p>
                  ) : uploadedFile ? (
                    <p className="mt-2 text-sm text-[#0D3B2E]">
                      Ready for backend upload: {uploadedFile.name}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-6 text-white shadow-sm">
              <h2 className="text-xl font-semibold">
                Live gift summary
              </h2>

              <div className="mt-6 space-y-4 text-sm text-[#efe4d0]">
                <div className="flex justify-between gap-4">
                  <span>Perfume</span>
                  <span>{selected?.name || '—'}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Gift wrap</span>
                  <span>{giftWrap}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Occasion</span>
                  <span>{occasion}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Message</span>
                  <span className="text-right">{message}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Ribbon</span>
                  <span>{ribbonColor}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Engraving</span>
                  <span>{engraving}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Card</span>
                  <span>{greetingCard}</span>
                </div>

                <div className="border-t border-white/20 pt-4 text-base font-semibold text-white">
                  <div className="flex justify-between">
                    <span>Estimated total</span>
                    <span>
                      AED {Number(selected?.price || 0) + 35}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};