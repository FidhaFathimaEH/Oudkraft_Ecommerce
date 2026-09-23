import PropTypes from 'prop-types';

export const SectionTitle = ({
  eyebrow,
  title,
  description,
  titleClassName = 'text-[#0D3B2E]',
  descriptionClassName = 'text-[#4b4b4b]',
}) => (
  <div className="max-w-2xl">
    <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">{eyebrow}</p>
    <h2 className={`mt-3 text-3xl md:text-4xl font-serif ${titleClassName}`}>{title}</h2>
    {description ? <p className={`mt-4 text-base leading-7 ${descriptionClassName}`}>{description}</p> : null}
  </div>
);

SectionTitle.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  titleClassName: PropTypes.string,
  descriptionClassName: PropTypes.string,
};
