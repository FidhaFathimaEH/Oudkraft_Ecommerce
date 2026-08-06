import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Star, ThumbsUp, Flag, ImageIcon, Video, Sparkles } from 'lucide-react';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'helpful', label: 'Most Helpful' }
];

const ratingFilters = [5, 4, 3, 2, 1];

export const ReviewsSection = ({ product }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState('all');
  const reviews = product.reviews || [];

  const visibleReviews = useMemo(() => {
    const filtered = ratingFilter === 'all' ? reviews : reviews.filter((review) => review.rating === Number(ratingFilter));

    return [...filtered].sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return (b.helpful || 0) - (a.helpful || 0);
      return new Date(b.dateValue || b.date) - new Date(a.dateValue || a.date);
    });
  }, [reviews, ratingFilter, sortBy]);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-[#e3d9c4] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]">Customer reviews</p>
            <h2 className="mt-3 font-serif text-3xl text-[#17362c]">What fragrance lovers are saying</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5b5b5b]">Every review reflects real fragrance experiences, from first impressions to longevity and gifting moments.</p>
          </div>
          <div className="rounded-[24px] border border-[#e3d9c4] bg-[#f8f2e9] p-4">
            <div className="flex items-center gap-2 text-[#C6A15B]"><Star size={18} fill="currentColor" /> <span className="text-xl font-semibold text-[#17362c]">{averageRating}</span></div>
            <p className="mt-1 text-sm text-[#5b5b5b]">Based on {reviews.length} verified reviews</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border border-[#e3d9c4] bg-[#f8f2e9] p-5">
            <h3 className="text-lg font-semibold text-[#17362c]">Rating distribution</h3>
            <div className="mt-4 space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium text-[#17362c]">{item.rating}★</span>
                  <div className="h-2 flex-1 rounded-full bg-white">
                    <div className="h-2 rounded-full bg-[#C6A15B]" style={{ width: `${reviews.length ? (item.count / reviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm text-[#5b5b5b]">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-white/80 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-[#C6A15B]">Loved for</p>
                <p className="mt-2 text-sm text-[#5b5b5b]">Longevity, elegance and gifting presentation.</p>
              </div>
              <div className="rounded-[20px] bg-white/80 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-[#C6A15B]">Typical wear</p>
                <p className="mt-2 text-sm text-[#5b5b5b]">Day-to-night, evening occasions and special events.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e3d9c4] bg-[#fcfaf6] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Review gallery</p>
                <p className="mt-2 text-sm text-[#5b5b5b]">Customer photos and videos from real perfume moments.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-full border border-[#e3d9c4] bg-white px-3 py-2 text-sm outline-none">
                  {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} className="rounded-full border border-[#e3d9c4] bg-white px-3 py-2 text-sm outline-none">
                  <option value="all">All stars</option>
                  {ratingFilters.map((rating) => <option key={rating} value={rating}>{rating} star</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {product.images.slice(0, 3).map((image, index) => (
                <div key={`${product.slug}-${index}`} className="overflow-hidden rounded-[20px] border border-[#e3d9c4]">
                  <img src={image} alt={`${product.name} review media ${index + 1}`} className="h-28 w-full object-cover" />
                </div>
              ))}
              <div className="flex items-center justify-center rounded-[20px] border border-dashed border-[#e3d9c4] bg-white/70 text-center text-sm text-[#5b5b5b]">
                <div>
                  <Video size={18} className="mx-auto text-[#C6A15B]" />
                  <p className="mt-2">Video reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {visibleReviews.map((review, index) => (
            <motion.article key={`${review.name}-${index}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="rounded-[24px] border border-[#e3d9c4] bg-[#fefcf8] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#17362c] text-sm font-semibold text-[#e0be7f]">{review.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#17362c]">{review.name}</p>
                      {review.verified ? <span className="rounded-full bg-[#e9f7ee] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#276745]">Verified purchase</span> : null}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#5b5b5b]">
                      <div className="flex items-center gap-1 text-[#C6A15B]"><Star size={14} fill="currentColor" /> {review.rating}</div>
                      <span>•</span>
                      <span>{review.date}</span>
                      <span>•</span>
                      <span>{review.country}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.media?.images ? <span className="inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] px-3 py-1 text-sm text-[#17362c]"><ImageIcon size={14} /> Photos</span> : null}
                  {review.media?.video ? <span className="inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] px-3 py-1 text-sm text-[#17362c]"><Video size={14} /> Video</span> : null}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#5b5b5b]">{review.comment}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] px-3 py-2 text-sm text-[#17362c]" aria-label="Helpful review"><ThumbsUp size={14} /> Helpful {review.helpful || 0}</button>
                <button className="inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] px-3 py-2 text-sm text-[#17362c]" aria-label="Report review"><Flag size={14} /> Report</button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
