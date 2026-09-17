import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { useMagnetic } from '../animations/magnetic'
import './Nature.css'

/**
 * Nature / Parallax — "NATURE INSPIRES EVERYTHING"
 * -----------------------------------------------------------------------
 * Phase 8. A full-screen, photographic scene rather than a boxed content
 * section (deliberately not a card): a wide flower/nature landscape sits
 * behind a close foreground flower layer, with a handful of petals
 * drifting between them, and an editorial title card resting in the
 * lower third — like a still from a film rather than a normal website
 * block.
 *
 * Layering (back to front):
 *   .nature__bg      — wide landscape photograph, slow scroll-parallax
 *                       drift + a continuous slow zoom (dolly-in) for the
 *                       whole time the section is in view.
 *   .nature__petals   — small drifting petal shapes, independent of
 *                       scroll, purely decorative.
 *   .nature__fg       — close foreground flower photograph pinned to the
 *                       bottom edge, parallaxing at roughly twice the
 *                       background's rate so the scene reads as layered
 *                       depth rather than one flat plane.
 *   .nature__scrim    — a static gradient for text legibility.
 *   .nature__vignette — a scroll-scrubbed dark overlay that is fully
 *                       opaque just before the section arrives and just
 *                       after it leaves, and clears while it is on
 *                       screen — the "cinematic transition into and out
 *                       of" the scene.
 *   .nature__content  — the eyebrow / heading / body / CTA title card,
 *                       revealed once via ScrollTrigger the first time it
 *                       enters view (not scrubbed, so it settles rather
 *                       than jitters with the scrollbar).
 *
 * On top of the scroll-driven motion, a subtle desktop-only mouse parallax
 * nudges the background, foreground and petal layers a few pixels in
 * response to pointer position for a quiet sense of 3D depth.
 *
 * `prefers-reduced-motion` disables every tween above: the scene renders
 * fully visible, in its resting position, with no scroll-scrub, no zoom,
 * no petal motion and no mouse parallax.
 * -----------------------------------------------------------------------
 */

const BG_BASE = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946'
const FG_BASE = 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4'
const IMG_PARAMS = 'auto=format&fit=crop&q=80'

const PETAL_COUNT = 9

function makePetals() {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    id: i,
    left: 4 + Math.random() * 92,
    size: 9 + Math.random() * 10,
    fallDuration: 16 + Math.random() * 10,
    fallDelay: Math.random() * -18,
    swayDuration: 5 + Math.random() * 4,
    swayDistance: 18 + Math.random() * 26,
    rotate: 140 + Math.random() * 220,
    opacity: 0.35 + Math.random() * 0.35,
  }))
}

function Nature() {
  const sectionRef = useRef(null)
  const bgWrapRef = useRef(null)
  const bgImgRef = useRef(null)
  const fgWrapRef = useRef(null)
  const petalsRef = useRef(null)
  const petalElsRef = useRef([])
  const vignetteRef = useRef(null)
  const eyebrowRef = useRef(null)
  const headingInnerRef = useRef(null)
  const bodyRef = useRef(null)
  const ctaRef = useRef(null)

  const petals = useMemo(() => makePetals(), [])

  // Phase 10: subtle magnetic pull on the CTA.
  useMagnetic(ctaRef, { strength: 0.35, maxOffset: 10 })

  // --- Entrance reveal for the title card, plays once ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [eyebrowRef.current, headingInnerRef.current, bodyRef.current, ctaRef.current],
          { opacity: 1, y: 0, yPercent: 0 }
        )
        return
      }

      gsap.set(eyebrowRef.current, { opacity: 0, y: 14 })
      gsap.set(headingInnerRef.current, { yPercent: 105 })
      gsap.set(bodyRef.current, { opacity: 0, y: 20 })
      gsap.set(ctaRef.current, { opacity: 0, y: 16 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })

      tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.7 })
        .to(
          headingInnerRef.current,
          { yPercent: 0, duration: 1.2, ease: 'power4.out' },
          0.1
        )
        .to(bodyRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.55)
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.75)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // --- Continuous scroll parallax + zoom + cinematic vignette ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      gsap.set(vignetteRef.current, { opacity: 0 })
      return
    }

    const ctx = gsap.context(() => {
      // Background: slow drift + a slow continuous zoom, for as long as
      // the section is anywhere in the viewport.
      gsap.fromTo(
        bgWrapRef.current,
        { yPercent: -9 },
        {
          yPercent: 9,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
          },
        }
      )
      gsap.fromTo(
        bgImgRef.current,
        { scale: 1.12 },
        {
          scale: 1.32,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )

      // Foreground: moves roughly twice as fast as the background —
      // the depth cue that sells the parallax.
      gsap.fromTo(
        fgWrapRef.current,
        { yPercent: -20 },
        {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      )

      // Petals drift slightly slower than the foreground, between the
      // two photographic layers.
      gsap.fromTo(
        petalsRef.current,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )

      // Cinematic vignette: opaque as the section arrives, clears while
      // it holds the screen, then darkens again as it leaves — a
      // photographic fade rather than a hard cut in or out.
      gsap.fromTo(
        vignetteRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'top 35%',
            scrub: 0.4,
          },
        }
      )
      gsap.fromTo(
        vignetteRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power1.in',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'bottom 65%',
            end: 'bottom top',
            scrub: 0.4,
          },
        }
      )
    }, sectionRef)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill()
      })
    }
  }, [])

  // --- Floating petals: continuous fall + rotation, independent of
  // scroll position. Horizontal sway is handled in pure CSS (see
  // Nature.css) so this loop only ever drives one transform axis. ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      petalElsRef.current.forEach((el, i) => {
        if (!el) return
        const petal = petals[i]
        gsap.fromTo(
          el,
          { yPercent: -20, rotate: 0 },
          {
            yPercent: 120,
            rotate: petal.rotate,
            duration: petal.fallDuration,
            delay: petal.fallDelay,
            ease: 'none',
            repeat: -1,
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [petals])

  // --- Subtle desktop mouse-based depth parallax on bg / fg / petals ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const section = sectionRef.current
    if (!section) return

    const moveBg = gsap.quickTo(bgWrapRef.current, 'x', {
      duration: 1.1,
      ease: 'power3.out',
    })
    const moveFg = gsap.quickTo(fgWrapRef.current, 'x', {
      duration: 0.9,
      ease: 'power3.out',
    })
    const movePetals = gsap.quickTo(petalsRef.current, 'x', {
      duration: 1,
      ease: 'power3.out',
    })

    const handleMove = (event) => {
      const rect = section.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5 // -0.5 .. 0.5
      moveBg(nx * 14)
      moveFg(nx * -30)
      movePetals(nx * -10)
    }

    const handleLeave = () => {
      moveBg(0)
      moveFg(0)
      movePetals(0)
    }

    section.addEventListener('mousemove', handleMove)
    section.addEventListener('mouseleave', handleLeave)
    return () => {
      section.removeEventListener('mousemove', handleMove)
      section.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <section className="nature" ref={sectionRef} id="nature">
      <div className="nature__media" aria-hidden="true">
        <div className="nature__bg" ref={bgWrapRef}>
          <img
            ref={bgImgRef}
            className="nature__bg-img"
            src={`${BG_BASE}?${IMG_PARAMS}&w=2200&h=1700`}
            srcSet={[
              `${BG_BASE}?${IMG_PARAMS}&w=900&h=1400 900w`,
              `${BG_BASE}?${IMG_PARAMS}&w=1600&h=1200 1600w`,
              `${BG_BASE}?${IMG_PARAMS}&w=2200&h=1700 2200w`,
            ].join(', ')}
            sizes="100vw"
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.classList.add('nature__bg--fallback')
            }}
          />
        </div>

        <div className="nature__petals" ref={petalsRef}>
          {petals.map((petal, i) => (
            <span
              key={petal.id}
              ref={(el) => (petalElsRef.current[i] = el)}
              className="nature__petal"
              style={{
                left: `${petal.left}%`,
                width: `${petal.size}px`,
                height: `${petal.size * 0.72}px`,
                opacity: petal.opacity,
                '--sway-duration': `${petal.swayDuration}s`,
                '--sway-distance': `${petal.swayDistance}px`,
              }}
            />
          ))}
        </div>

        <div className="nature__fg" ref={fgWrapRef}>
          <img
            className="nature__fg-img"
            src={`${FG_BASE}?${IMG_PARAMS}&w=2000&h=900`}
            srcSet={[
              `${FG_BASE}?${IMG_PARAMS}&w=800&h=500 800w`,
              `${FG_BASE}?${IMG_PARAMS}&w=1400&h=700 1400w`,
              `${FG_BASE}?${IMG_PARAMS}&w=2000&h=900 2000w`,
            ].join(', ')}
            sizes="100vw"
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.classList.add('nature__fg--fallback')
            }}
          />
        </div>

        <div className="nature__scrim" />
        <div className="nature__vignette" ref={vignetteRef} />
      </div>

      <div className="nature__content container">
        <p className="eyebrow nature__eyebrow" ref={eyebrowRef}>
          The Living Palette
        </p>

        <h2 className="nature__heading">
          <span className="nature__heading-mask">
            <span className="nature__heading-inner" ref={headingInnerRef}>
              NATURE INSPIRES EVERYTHING
            </span>
          </span>
        </h2>

        <p className="nature__body" ref={bodyRef}>
          Every arrangement begins outdoors — in the color of a sunrise,
          the hush after rain, the particular gold of late afternoon
          light moving through petals.
        </p>

        <a className="nature__cta" href="#story" ref={ctaRef}>
          <span className="nature__cta-label">Explore Our Story</span>
          <span className="nature__cta-line" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

export default Nature
