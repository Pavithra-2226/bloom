import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import BouquetPhoto from '../components/BouquetPhoto.jsx'
import './SignatureBouquets.css'

/**
 * Real, editorial bouquet photography — sourced from Unsplash (free for
 * commercial use, no attribution required). Each entry gets its own crop
 * so the gallery reads as five distinct arrangements, not five instances
 * of the same stock shot.
 */
const BOUQUETS = [
  {
    name: 'Romantic Blush',
    src: 'https://images.unsplash.com/photo-1781380458791-941eab788fc5',
    alt: 'A lush, hand-tied bouquet of blush pink peonies in a glass vase',
  },
  {
    name: 'Sunshine Cheer',
    src: 'https://images.unsplash.com/photo-1602542212594-6f43ab10268f',
    alt: 'A bright yellow sunflower arrangement in a patterned ceramic vase',
  },
  {
    name: 'Elegant Whites',
    src: 'https://images.unsplash.com/photo-1763908161582-50ef781f19ee',
    alt: 'A delicate, all-white bouquet of daisies in a clear glass vase',
  },
  {
    name: 'Wildflower Dream',
    src: 'https://images.unsplash.com/photo-1621581314652-06a9fe9d4db6',
    alt: 'A loose, garden-gathered bouquet of white, pink and yellow wildflowers',
  },
  {
    name: 'Garden Romance',
    src: 'https://images.unsplash.com/photo-1588350350703-fddbfc5cfaf6',
    alt: 'A romantic, full bouquet of pink and white garden roses',
  },
]

const COUNT = BOUQUETS.length // 5

/**
 * DEPTH_STOPS
 * -----------------------------------------------------------------------
 * The cinematic depth "look" at the two extremes of the scene: a bouquet
 * standing right in front of the camera (closest, largest, sharpest,
 * fully lit, highest stacking order) versus one standing at the back of
 * the scene (small, soft, dim, blurred, buried behind everything else).
 * Every bouquet's actual scale/opacity/blur/z-index at any instant is a
 * continuous interpolation between these two stops, driven by how close
 * it currently is to the camera — never a hard switch between presets.
 * -----------------------------------------------------------------------
 */
const DEPTH_FRONT = { scale: 1.22, opacity: 1, blur: 0, z: 60 }
const DEPTH_BACK = { scale: 0.5, opacity: 0.28, blur: 6, z: 4 }

// How many full passes through the five-bouquet sequence the pinned
// scroll drives. One full pass already carries every bouquet through
// the complete cycle (01→02→03→04→05→01); kept at 1 so the pinned
// scroll distance stays tight and the user isn't scrolling through
// repeats of a cycle they've already seen.
const LAPS = 1
const VH_PER_STEP = 0.5 // scroll distance for one bouquet to advance one position, as a multiple of viewport height

// Small per-position tilt and the vertical "arc" the row sits on — front
// bouquet lifted slightly toward camera, side bouquets sinking back and
// down on both sides. Kept intentionally small: this is a lean, not a
// spin.
const TILT_DEG_PER_UNIT = 4
const FRONT_LIFT = 8

/**
 * Wraps `value` into the symmetric range (-half, half], where half =
 * count / 2. Used to turn "bouquet i is `t` steps away from the front
 * position" into a signed offset that continuously sweeps through the
 * whole row and back, wrapping only at the far extreme — which is also
 * where scale/opacity/blur make a bouquet least visible, so the wrap
 * itself is never seen.
 */
function wrapSigned(value, count) {
  const half = count / 2
  let v = value % count
  if (v <= -half) v += count
  if (v > half) v -= count
  return v
}

/**
 * Computes this instant's cinematic transform for a bouquet whose signed
 * offset from the front-of-camera position is `r` (continuous, roughly
 * -2.5..2.5 for five bouquets). Every value here is derived from `r`
 * through plain interpolation, so as `r` changes smoothly with scroll the
 * bouquet visibly glides through the depth of the scene — growing,
 * sharpening and lifting as it approaches the front, then softening,
 * shrinking and sinking back as it recedes on the other side.
 */
function getSceneTransform(r, spacingX) {
  const half = COUNT / 2
  const depthT = Math.min(1, Math.abs(r) / half) // 0 = front/camera, 1 = far back
  const eased = Math.pow(depthT, 1.25) // keeps the front bouquet crisp a little longer

  const scale = gsap.utils.interpolate(DEPTH_FRONT.scale, DEPTH_BACK.scale, eased)
  const opacity = gsap.utils.interpolate(DEPTH_FRONT.opacity, DEPTH_BACK.opacity, eased)
  const blur = gsap.utils.interpolate(DEPTH_FRONT.blur, DEPTH_BACK.blur, eased)
  const zIndex = Math.round(gsap.utils.interpolate(DEPTH_FRONT.z, DEPTH_BACK.z, eased))
  const y = gsap.utils.interpolate(-FRONT_LIFT, spacingX.y, eased)
  const x = r * spacingX.x
  const rotate = gsap.utils.clamp(-10, 10, r * TILT_DEG_PER_UNIT)

  return { x, y, scale, opacity, blur, zIndex, rotate }
}

/**
 * SignatureBouquets
 * -----------------------------------------------------------------------
 * "SIGNATURE BOUQUETS" — a cinematic depth scene, not a carousel. The five
 * bouquets stand at different depths across a dark, editorial backdrop;
 * one continuous scroll-scrubbed value drives which bouquet currently
 * sits nearest the "camera" (largest, sharpest, brightest, frontmost),
 * with the rest fanned out on either side, growing smaller, softer and
 * dimmer the farther back they sit. As the person scrolls, that value
 * advances smoothly — never in a jump — so every bouquet visibly glides
 * through the scene, the current front bouquet gradually giving way to
 * the next one in sequence: 01→02→03→04→05→01, repeating.
 *
 * Each bouquet is a single unit — image, number and name move, scale,
 * blur and fade together as one, via nested transform layers so the
 * scroll-driven depth position (outer), a very small continuous idle
 * float (middle), and the depth-of-field blur (on the photo itself)
 * never fight each other over the same properties.
 *
 * Reuses the app's single Lenis instance (already synced to
 * ScrollTrigger.update in smoothScroll.js) and the same
 * gsap.matchMedia()-scoped pin pattern the rest of the site uses — no
 * second Lenis instance, no new libraries.
 *
 * `prefers-reduced-motion` skips the pin, the scene motion and the idle
 * float entirely; the five bouquets are simply placed at their starting
 * depth positions and stay still.
 * -----------------------------------------------------------------------
 */
function SignatureBouquets() {
  const sectionRef = useRef(null)
  const headingInnerRef = useRef(null)
  const introRef = useRef(null)
  const stageRef = useRef(null)
  const itemRefs = useRef([])
  const floatRefs = useRef([])
  const photoRefs = useRef([])

  itemRefs.current = []
  floatRefs.current = []
  photoRefs.current = []

  const addItemRef = (el) => {
    if (el && !itemRefs.current.includes(el)) itemRefs.current.push(el)
  }
  const addFloatRef = (el) => {
    if (el && !floatRefs.current.includes(el)) floatRefs.current.push(el)
  }
  const addPhotoRef = (el) => {
    if (el && !photoRefs.current.includes(el)) photoRefs.current.push(el)
  }

  // --- Heading + intro reveal, plays once as the section approaches
  // the viewport (fires before the pin engages) — unchanged from before ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(headingInnerRef.current, { yPercent: 0 })
        gsap.set(introRef.current, { opacity: 1, y: 0 })
        return
      }

      gsap.set(headingInnerRef.current, { yPercent: 105 })
      gsap.set(introRef.current, { opacity: 0, y: 20 })

      gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      })
        .to(headingInnerRef.current, {
          yPercent: 0,
          duration: 1.05,
          ease: 'power4.out',
        })
        .to(introRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.25)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // --- Cinematic depth scene: a single continuous scroll-scrubbed value
  // drives every bouquet's x/y/scale/opacity/blur/rotation/z-index each
  // frame, so the whole row glides through the scene with scroll instead
  // of snapping between fixed layouts.
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      // Static fallback: place each bouquet at its starting depth
      // position (bouquet 0 nearest the camera) with no motion.
      const spacing = { x: 210, y: 40 }
      itemRefs.current.forEach((item, i) => {
        const r = wrapSigned(i, COUNT)
        const t = getSceneTransform(r, spacing)
        gsap.set(item, {
          xPercent: -50,
          yPercent: -50,
          x: t.x,
          y: t.y,
          scale: t.scale,
          opacity: 1,
          rotate: t.rotate,
          zIndex: t.zIndex,
        })
      })
      photoRefs.current.forEach((img) => gsap.set(img, { filter: 'blur(0px)' }))
      return
    }

    // matchMedia scopes spacing + the pin/scene motion/float to each
    // breakpoint; it auto-reverts every tween and ScrollTrigger it
    // creates when the breakpoint no longer matches, so no manual
    // teardown of the inner animations is required beyond returning
    // this cleanup.
    const mm = gsap.matchMedia()

    const setupScene = (spacing) => {
      const section = sectionRef.current
      const items = itemRefs.current
      const floats = floatRefs.current
      const photos = photoRefs.current

      // Applies every bouquet's cinematic transform for the given total
      // advance (in "positions" — how far the whole sequence has moved).
      const applyScene = (t) => {
        items.forEach((item, i) => {
          const r = wrapSigned(i - t, COUNT)
          const s = getSceneTransform(r, spacing)
          gsap.set(item, {
            x: s.x,
            y: s.y,
            scale: s.scale,
            opacity: s.opacity,
            rotate: s.rotate,
            zIndex: s.zIndex,
          })
          const img = photos[i]
          if (img) gsap.set(img, { filter: `blur(${s.blur.toFixed(2)}px)` })
        })
      }

      // Fixed centering + starting positions (bouquet 0 nearest camera).
      items.forEach((item) => gsap.set(item, { xPercent: -50, yPercent: -50 }))
      applyScene(0)

      // Subtle continuous idle float on an inner wrapper, independent of
      // the depth position on the outer element — so the two never fight
      // over the same x/y.
      const floatTweens = floats.map((el) => {
        const fx = gsap.utils.random(-5, 5)
        const fy = gsap.utils.random(-6, 6)
        const dur = gsap.utils.random(3, 5)
        return gsap.to(el, {
          x: fx,
          y: fy,
          duration: dur,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: gsap.utils.random(0, 1.5),
        })
      })

      // A single proxy value driven by the scrub — the only thing that
      // actually advances with scroll. Every bouquet's transform is
      // recomputed from it each tick, so motion through the scene is
      // exactly as continuous as the scrollbar itself.
      const proxy = { t: 0 }
      const totalAdvance = COUNT * LAPS
      const sceneTween = gsap.to(proxy, {
        t: totalAdvance,
        ease: 'none',
        onUpdate: () => applyScene(proxy.t),
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalAdvance * window.innerHeight * VH_PER_STEP}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        floatTweens.forEach((tween) => tween.kill())
        sceneTween.kill()
      }
    }

    mm.add('(min-width: 1025px)', () => setupScene({ x: 210, y: 40 }))
    mm.add('(min-width: 641px) and (max-width: 1024px)', () =>
      setupScene({ x: 132, y: 26 })
    )
    mm.add('(max-width: 640px)', () => setupScene({ x: 68, y: 14 }))

    return () => mm.revert()
  }, [])

  return (
    <section className="bouquets" ref={sectionRef} id="bouquets">
      <div className="bouquets__header container">
        <p className="eyebrow bouquets__eyebrow">Curated collection</p>
        <h2 className="bouquets__heading">
          <span className="bouquets__heading-mask">
            <span className="bouquets__heading-inner" ref={headingInnerRef}>
              SIGNATURE BOUQUETS
            </span>
          </span>
        </h2>
        <p className="bouquets__intro" ref={introRef}>
          Arrangements made to say what words sometimes cannot.
        </p>
      </div>

      {/* Atmosphere: warm light ray + soft blurred floral bokeh at the
          edges, purely decorative. z-indexed behind the header and the
          bouquet stage, so it can never cover or soften the bouquets. */}
      <div className="bouquets__atmosphere" aria-hidden="true">
        <span className="bouquets__petal bouquets__petal--1" />
        <span className="bouquets__petal bouquets__petal--2" />
        <span className="bouquets__petal bouquets__petal--3" />
        <span className="bouquets__petal bouquets__petal--4" />
      </div>

      {/* Reflective floor plane beneath the row — sits above the
          atmosphere but still behind the bouquets themselves. */}
      <div className="bouquets__floor" aria-hidden="true" />

      <div className="bouquets__scene-stage" ref={stageRef}>
        {BOUQUETS.map((bouquet, index) => (
          <div className="bouquet-scene-item" ref={addItemRef} key={bouquet.name}>
            <div className="bouquet-scene-float" ref={addFloatRef}>
              <BouquetPhoto ref={addPhotoRef} src={bouquet.src} alt={bouquet.alt} />
              <div className="bouquet-scene-caption">
                <span className="bouquet-scene-caption__number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="bouquet-scene-caption__name">{bouquet.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SignatureBouquets
