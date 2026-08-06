import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getProducts } from '../services/products';

const questions = [
  {
    id: 'gender',
    label: 'Who is this fragrance for?',
    options: ['For her', 'For him', 'Unisex']
  },
  {
    id: 'occasion',
    label: 'Best occasion?',
    options: ['Daytime elegance', 'Evening confidence', 'Special occasions', 'Travel']
  },
  {
    id: 'family',
    label: 'Preferred fragrance family?',
    options: ['Fresh', 'Woody', 'Floral', 'Oriental']
  },
  {
    id: 'budget',
    label: 'Budget range?',
    options: ['Under AED 100', 'AED 100–150', 'AED 150+']
  }
];

export const ScentQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const products = getProducts();

  const recommendation = useMemo(() => {
    const bestMatch = products.find((product) => product.category === 'Eau de Parfum' || product.category === 'Luxury Collection') || products[0];
    return bestMatch;
  }, [products]);

  const handleAnswer = (value) => {
    const nextAnswers = { ...answers, [questions[step].id]: value };
    setAnswers(nextAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    setStep(questions.length);
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[36px] border border-[#e3d9c4] bg-[linear-gradient(135deg,#fdf8f1_0%,#efe0c4_100%)] p-8 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a662]/40 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8b6124]">
              <Sparkles size={14} /> Signature scent finder
            </div>
            <h2 className="mt-5 font-serif text-4xl text-[#17362c] sm:text-5xl">Find your signature scent in under a minute.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5c5c5c]">Answer a few questions and we will recommend a perfume that fits your character, mood and daily ritual.</p>
            <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-[#17362c]"><span className="h-2.5 w-2.5 rounded-full bg-[#C6A15B]" /> Luxury recommendations tuned for Abu Dhabi living</div>
          </div>
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white/85 p-6 shadow-[0_20px_50px_-30px_rgba(13,59,46,0.35)]">
            {step < questions.length ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]">Question {step + 1} / {questions.length}</p>
                <h3 className="mt-3 text-2xl font-semibold text-[#17362c]">{questions[step].label}</h3>
                <div className="mt-5 grid gap-3">
                  {questions[step].options.map((option) => (
                    <motion.button key={option} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(option)} className="rounded-[18px] border border-[#e3d9c4] bg-[#f8f2e9] px-4 py-3 text-left text-sm font-medium text-[#17362c] transition hover:border-[#C6A15B]">
                      {option}
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]">Your match</p>
                <h3 className="mt-3 text-2xl font-semibold text-[#17362c]">{recommendation?.name}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5b5b5b]">A refined choice for modern evenings and executive presence. It balances warmth, freshness and a lingering trail.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={resetQuiz} className="rounded-full border border-[#e3d9c4] px-4 py-2 text-sm font-semibold text-[#17362c]">Try again</button>
                  <a href={`/product/${recommendation?.slug}`} className="inline-flex items-center gap-2 rounded-full bg-[#17362c] px-4 py-2 text-sm font-semibold text-white">Discover it <ArrowRight size={14} /></a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
