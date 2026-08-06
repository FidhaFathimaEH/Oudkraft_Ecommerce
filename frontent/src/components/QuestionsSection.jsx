import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, ThumbsUp } from 'lucide-react';

export const QuestionsSection = ({ product }) => {
  const [query, setQuery] = useState('');
  const questions = product.questions || [];

  const filteredQuestions = useMemo(() => {
    if (!query.trim()) return questions;
    return questions.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase()));
  }, [questions, query]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-[#e3d9c4] bg-[#fbf7f0] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]">Customer questions</p>
            <h2 className="mt-3 font-serif text-3xl text-[#17362c]">Helpful answers before you buy</h2>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-[#e3d9c4] bg-white px-4 py-3">
            <Search size={16} className="text-[#C6A15B]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions" className="w-full bg-transparent outline-none sm:w-56" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {filteredQuestions.map((item, index) => (
            <motion.article key={`${item.question}-${index}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="rounded-[24px] border border-[#e3d9c4] bg-white p-5">
              <p className="font-semibold text-[#17362c]">{item.question}</p>
              <p className="mt-3 text-sm leading-7 text-[#5b5b5b]">{item.answer}</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-[#5b5b5b]">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f8f2e9] px-3 py-1"><ThumbsUp size={14} className="text-[#C6A15B]" /> Helpful {item.helpful}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f8f2e9] px-3 py-1"><MessageCircle size={14} className="text-[#C6A15B]" /> Answered by Oud Kraft concierge</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
