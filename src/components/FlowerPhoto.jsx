import { forwardRef } from 'react'
import './FlowerPhoto.css'

/**
 * A hand-tied bouquet of blush, beige and red garden flowers in a clear
 * glass vase, softly lit — sourced from Unsplash (free for commercial use,
 * no attribution required). Requested at three widths via `srcSet` so the
 * browser can pick the right size for the viewport, and cropped server-side
 * to a consistent 4:5 portrait so the frame never jumps between breakpoints.
 */
const IMG_BASE = 'https://images.unsplash.com/photo-1572454591674-2739f30d8c40'
const IMG_PARAMS = 'auto=format&fit=crop&q=80'

/**
 * FlowerPhoto
 * -----------------------------------------------------------------------
 * Premium, realistic bouquet photography for the Flower Story section —
 * replaces the earlier flat SVG botanical illustration. A single full-bleed
 * portrait photograph with a small editorial caption underneath; no card
 * framing (no border, shadow, or boxed background behind the image).
 *
 * The outer `.flower-story__visual` wrapper (owned by FlowerStory.jsx)
 * handles the entrance clip-path/scale/opacity reveal and the slow
 * vertical parallax on scroll. This component forwards `ref` straight to
 * the <img> so FlowerStory can additionally run a slow, independent
 * Ken-Burns-style scale on the photo itself while the section is in view —
 * giving the reveal some depth rather than the whole block moving as one
 * flat plane.
 * -----------------------------------------------------------------------
 */
const FlowerPhoto = forwardRef(function FlowerPhoto(_props, imgRef) {
  return (
    <figure className="flower-photo">
      <div className="flower-photo__frame">
        <img
          ref={imgRef}
          className="flower-photo__img"
          src={`${IMG_BASE}?${IMG_PARAMS}&w=1000&h=1250`}
          srcSet={[
            `${IMG_BASE}?${IMG_PARAMS}&w=700&h=875 700w`,
            `${IMG_BASE}?${IMG_PARAMS}&w=1000&h=1250 1000w`,
            `${IMG_BASE}?${IMG_PARAMS}&w=1400&h=1750 1400w`,
          ].join(', ')}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 620px"
          alt="A hand-tied bouquet of blush, beige and red garden flowers in a clear glass vase, softly lit"
          loading="lazy"
        />
      </div>

      <figcaption className="flower-photo__caption">
        <span className="flower-photo__caption-rule" aria-hidden="true" />
        Hand-tied, seasonal, considered
      </figcaption>
    </figure>
  )
})

export default FlowerPhoto
