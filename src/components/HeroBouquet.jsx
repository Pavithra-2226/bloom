import { forwardRef } from 'react'
import './HeroBouquet.css'
import jo1 from '../assets/hero/jo1.jpg'
const IMG_BASE = jo1

const IMG_PARAMS =
  'auto=format&fit=crop&q=85'

const HeroBouquet = forwardRef(function HeroBouquet(_, imgRef) {
  return (
    <div className="hero-bouquet">

      {/* Soft ambient light behind the bouquet */}
      <div
        className="hero-bouquet__glow"
        aria-hidden="true"
      />

      {/* Main realistic flower photograph */}
      <img
        ref={imgRef}
        className="hero-bouquet__img"
        src={`${IMG_BASE}?${IMG_PARAMS}&w=900&h=1125`}
        srcSet={[
          `${IMG_BASE}?${IMG_PARAMS}&w=640&h=800 640w`,
          `${IMG_BASE}?${IMG_PARAMS}&w=900&h=1125 900w`,
          `${IMG_BASE}?${IMG_PARAMS}&w=1300&h=1625 1300w`,
        ].join(', ')}
        sizes="
          (max-width: 640px) 90vw,
          (max-width: 1024px) 52vw,
          620px
        "
        alt="A hand-tied bouquet of white and beige garden flowers in soft natural light"
        loading="eager"
        fetchPriority="high"
      />

      {/* Soft light layer over the photograph */}
      <div
        className="hero-bouquet__highlight"
        aria-hidden="true"
      />

    </div>
  )
})

export default HeroBouquet