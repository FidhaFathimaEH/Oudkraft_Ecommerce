export const SectionTitle = ({ eyebrow, title, description }) => (
  <div className="max-w-2xl">
    <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">{eyebrow}</p>
    <h2 className="mt-3 text-3xl md:text-4xl font-serif text-[#0D3B2E]">{title}</h2>
    {description ? <p className="mt-4 text-base text-[#4b4b4b] leading-7">{description}</p> : null}
  </div>
);
