import './FeelingPhoto.css'

const IMG_PARAMS = 'auto=format&fit=crop&q=80'

/**
 * FeelingPhoto
 * -----------------------------------------------------------------------
 * A single large, realistic flower/bouquet photograph — the visual half
 * of one "Choose Your Feeling" mood block. Deliberately not a card: no
 * border, shadow, or boxed background, just the photograph filling its
 * slot. Phase 6's parent (Feelings.jsx) targets `.feeling-photo__img`
 * directly via `querySelector` (the same pattern SignatureBouquets uses
 * for its panel media) to run the scroll-driven Ken-Burns scale
 * independently of this component, so no ref is forwarded here.
 * -----------------------------------------------------------------------
 */
function FeelingPhoto({ src, alt }) {
  return (
    <div className="feeling-photo">
      <img
        className="feeling-photo__img"
        src={`${src}?${IMG_PARAMS}&w=1400&h=1050`}
        srcSet={[
          `${src}?${IMG_PARAMS}&w=800&h=600 800w`,
          `${src}?${IMG_PARAMS}&w=1400&h=1050 1400w`,
          `${src}?${IMG_PARAMS}&w=2000&h=1500 2000w`,
        ].join(', ')}
        sizes="(max-width: 1024px) 90vw, 58vw"
        alt={alt}
        loading="lazy"
      />
    </div>
  )
}

export default FeelingPhoto
