import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Star, Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { getProductBySlug, getProducts } from '../services/products';
import { businessConfig, deliveryConfig } from '../config/businessConfig';
import { getCart, saveCart, updateCartItem } from '../services/cart';

export const ProductPage = () => {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('100 ml');
  const [message, setMessage] = useState('');
  const relatedProducts = useMemo(() => getProducts().filter((item) => item.id !== product?.id).slice(0, 3), [product]);

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold text-[#0D3B2E]">This fragrance is not available right now.</h1>
          <p className="mt-3 text-[#5b5b5b]">Please browse the collection for similar scents.</p>
          <Link to="/shop" className="mt-6 inline-flex rounded-full bg-[#0D3B2E] px-6 py-3 text-white">Back to shop</Link>
        </div>
      </Layout>
    );
  }

  const addToCart = () => {
    const nextCart = updateCartItem(getCart(), { ...product, size: selectedSize }, quantity);
    saveCart(nextCart);
    setMessage('Added to cart');
    setTimeout(() => setMessage(''), 1200);
  };

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-[#0D3B2E]"><ArrowLeft size={16} /> Back to shop</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="overflow-hidden rounded-[32px] border border-[#e3d9c4] bg-white p-4 shadow-sm">
              <img src={product.images[selectedImage]} alt={product.name} className="h-[440px] w-full rounded-[24px] object-cover" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {product.images.map((image, index) => (
                <button key={image} onClick={() => setSelectedImage(index)} className={`overflow-hidden rounded-[20px] border ${selectedImage === index ? 'border-[#C6A15B]' : 'border-[#e3d9c4]'}`}>
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#e3d9c4] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">{product.category}</p>
                <h1 className="mt-2 font-serif text-3xl text-[#0D3B2E]">{product.name}</h1>
              </div>
              <button className="rounded-full border border-[#e3d9c4] p-3 text-[#0D3B2E]" aria-label="Add to wishlist"><Heart size={18} /></button>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-[#5b5b5b]">
              <div className="flex items-center gap-1 text-[#C6A15B]"><Star size={14} fill="currentColor" /> {product.rating}</div>
              <span>{product.reviews} reviews</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#5b5b5b]">{product.inspiration}</p>
            <div className="mt-6 flex items-end gap-4">
              <div>
                <p className="text-3xl font-semibold text-[#111111]">AED {product.price}</p>
                {product.oldPrice ? <p className="text-sm text-[#8a8a8a] line-through">AED {product.oldPrice}</p> : null}
              </div>
              <div className="rounded-full bg-[#F8F4EC] px-3 py-2 text-sm text-[#0D3B2E]">{product.stock > 0 ? 'In stock' : 'Sold out'}</div>
            </div>
            <div className="mt-6">
              <label className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Size</label>
              <div className="mt-3 flex flex-wrap gap-3">
                {[product.size, '50 ml'].map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`rounded-full px-4 py-2 text-sm ${selectedSize === size ? 'bg-[#0D3B2E] text-white' : 'bg-[#F8F4EC] text-[#0D3B2E]'}`}>{size}</button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-[#e3d9c4] px-3 py-2">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-2 text-xl">−</button>
                <span className="min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity((value) => value + 1)} className="px-2 text-xl">+</button>
              </div>
              <button onClick={addToCart} className="flex items-center gap-2 rounded-full bg-[#0D3B2E] px-5 py-3 font-semibold text-white"> <ShoppingBag size={16} /> Add to cart</button>
              <a href={`https://wa.me/${businessConfig.whatsapp}`} className="flex items-center gap-2 rounded-full border border-[#e3d9c4] px-5 py-3 font-semibold text-[#0D3B2E]"> <MessageCircle size={16} /> Order on WhatsApp</a>
            </div>
            {message ? <p className="mt-4 text-sm text-[#123F34]">{message}</p> : null}

            <div className="mt-8 grid gap-4 rounded-[24px] border border-[#e9e0cb] bg-[#F8F4EC] p-4 md:grid-cols-3">
              <div className="flex items-center gap-3"><Truck size={18} className="text-[#C6A15B]" /><div><h3 className="font-semibold text-[#0D3B2E]">Delivery in Abu Dhabi</h3><p className="text-sm text-[#5b5b5b]">AED {deliveryConfig.abuDhabiFee} local handling fee.</p></div></div>
              <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-[#C6A15B]" /><div><h3 className="font-semibold text-[#0D3B2E]">Secure checkout</h3><p className="text-sm text-[#5b5b5b]">Safe ordering flow ready for payment integration.</p></div></div>
              <div className="flex items-center gap-3"><MessageCircle size={18} className="text-[#C6A15B]" /><div><h3 className="font-semibold text-[#0D3B2E]">Easy support</h3><p className="text-sm text-[#5b5b5b]">Contact us for gifting and fragrance advice.</p></div></div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-[#0D3B2E]">Fragrance description</h2>
              <p className="mt-3 leading-7 text-[#5b5b5b]">{product.description}</p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Top notes</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.topNotes.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Heart notes</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.middleNotes.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Base notes</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.baseNotes.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Fragrance family</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.fragranceFamily}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </Layout>
  );
};
