import { forwardRef } from 'react'
import './BouquetPhoto.css'

const IMG_PARAMS = 'auto=format&fit=crop&q=80'

/**
 * BouquetPhoto
 * -----------------------------------------------------------------------
 * A single bouquet standing in the cinematic scene — not a photo card.
 * The source photographs are ordinary product/studio shots with their
 * own backdrops (white, beige, blue), and per spec we don't touch the
 * image assets themselves, so the "no card" look is built entirely with
 * three CSS layers instead of real subject cutout:
 *
 *  1. A soft radial alpha mask feathers the photo to a soft silhouette,
 *     fading fully to transparent well inside its own rectangle — so the
 *     hard photo boundary disappears and the dark scene shows through
 *     at the corners instead of a card edge.
 *  2. A dark "vignette" overlay, masked to the exact same shape (so both
 *     hit zero alpha at the same boundary — no seam), multiplies any
 *     leftover studio backdrop down toward near-black through the fade
 *     zone, so it sinks into the dark scene instead of reading as a
 *     lighter rectangle floating in it.
 *  3. A small, heavily blurred, faded flip of the photo's own base sits
 *     just beneath it as a stylized floor-reflection echo.
 *
 * This is a CSS approximation of subject isolation, not true pixel-level
 * cutout — there's no image segmentation happening — but combined with a
 * tighter crop (zoom) it reads as a bouquet standing in the scene rather
 * than a boxed photograph, without generating or swapping any asset.
 * -----------------------------------------------------------------------
 */
const BouquetPhoto = forwardRef(function BouquetPhoto({ src, alt }, imgRef) {
  const imgUrl = `${src}?${IMG_PARAMS}&w=900&h=1125`

  return (
    <div className="bouquet-photo" style={{ '--bouquet-img': `url(${imgUrl})` }}>
      <img
        ref={imgRef}
        className="bouquet-photo__img"
        src={imgUrl}
        srcSet={[
          `${src}?${IMG_PARAMS}&w=560&h=700 560w`,
          `${src}?${IMG_PARAMS}&w=900&h=1125 900w`,
          `${src}?${IMG_PARAMS}&w=1300&h=1625 1300w`,
        ].join(', ')}
        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 52vw, 30vw"
        alt={alt}
        loading="lazy"
      />
    </div>
  )
})

export default BouquetPhoto
