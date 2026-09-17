import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { useMagnetic } from '../animations/magnetic'
import './FinalCTA.css'

/**
 * Final CTA — "MAKE IT PERSONAL"
 * -----------------------------------------------------------------------
 * Phase 9. BLOOM's closing statement: a full-screen, centered, minimal
 * cinematic frame — deliberately not a card, not a boxed "shop now"
 * banner. A single large, dark, emotional bouquet photograph carries the
 * whole section; a two-layer parallax (main photo + a closer, shadowed
 * secondary flower layer) gives it depth, the same continuous-motion
 * language as the Nature section before it.
 *
 * Continuity with Nature (the section immediately above this one): Nature
 * ends by fading to `--charcoal` as it scrolls out of view. This section
 * opens already `--charcoal`, with its own entrance vignette clearing on
 * the way in — the two fades overlap into one continuous dissolve rather
 * than a hard cut between sections. A matching exit vignette darkens
 * again at the very bottom, so whatever follows (Footer) arrives through
 * the same fade rather than an abrupt edge.
 *
 * Layering (back to front):
 *   .final-cta__bg        — large bouquet photograph, slow parallax
 *                            drift + continuous slow zoom.
 *   .final-cta__fg         — a second, closer bouquet photograph sitting
 *                            low in the frame, darkened and blurred into
 *                            near-silhouette, parallaxing faster than the
 *                            background for the depth cue.
 *   .final-cta__scrim      — static heavy darkening + center vignette so
 *                            the centered type stays legible over a
 *                            bright or busy photograph.
 *   .final-cta__vignette-in / -out — scroll-scrubbed cinematic fades.
 *   .final-cta__content    — eyebrow / heading / body / CTA, centered,
 *                            revealed once via ScrollTrigger.
 *
 * `prefers-reduced-motion` disables every tween: the scene renders fully
 * visible and static, no scroll-scrub, no zoom, no mouse parallax.
 * -----------------------------------------------------------------------
 */

// Reusing two photographs already proven to load elsewhere in the site
// (Feelings' "Love" roses, Flower Story's hand-tied bouquet) rather than
// introducing new, unverified Unsplash IDs — heavy darkening/cropping
// here gives them an entirely different, more cinematic read than their
// original sections.
const BG_BASE = 'https://images.unsplash.com/photo-1679390248331-c258a5b30f89'
const FG_BASE = 'https://images.unsplash.com/photo-1572454591674-2739f30d8c40'
const IMG_PARAMS = 'auto=format&fit=crop&q=80'

function FinalCTA() {
  const sectionRef = useRef(null)
  const bgWrapRef = useRef(null)
  const bgImgRef = useRef(null)
  const fgWrapRef = useRef(null)
  const vignetteInRef = useRef(null)
  const vignetteOutRef = useRef(null)
  const eyebrowRef = useRef(null)
  const headingInnerRef = useRef(null)
  const bodyRef = useRef(null)
  const ctaRef = useRef(null)

  // Phase 10: subtle magnetic pull on the CTA.
  useMagnetic(ctaRef, { strength: 0.35, maxOffset: 10 })

  // --- Entrance reveal for the content, plays once ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [eyebrowRef.current, headingInnerRef.current, bodyRef.current, ctaRef.current],
          { opacity: 1, y: 0, yPercent: 0, scale: 1 }
        )
        return
      }

      gsap.set(eyebrowRef.current, { opacity: 0, y: 14 })
      gsap.set(headingInnerRef.current, { yPercent: 105 })
      gsap.set(bodyRef.current, { opacity: 0, y: 20 })
      gsap.set(ctaRef.current, { opacity: 0, y: 18, scale: 0.94 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 55%',
          toggleActions: 'play none none none',
        },
      })

      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      })
        .to(
          headingInnerRef.current,
          { yPercent: 0, duration: 1.2, ease: 'power4.out' },
          0.1
        )
        .to(
          bodyRef.current,
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.55
        )
        // The CTA gets its own, slightly slower and more decisive settle
        // (expo vs. the text's power curves) so it reads as a distinct,
        // refined arrival rather than one more line in the same reveal.
        .to(
          ctaRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out' },
          0.8
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // --- Continuous scroll parallax + zoom + cinematic in/out vignettes ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      gsap.set([vignetteInRef.current, vignetteOutRef.current], { opacity: 0 })
      return
    }

    const ctx = gsap.context(() => {
      // Background: slow drift + slow continuous zoom for as long as the
      // section is anywhere in the viewport.
      gsap.fromTo(
        bgWrapRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
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
        { scale: 1.1 },
        {
          scale: 1.26,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )

      // Foreground shadow layer: moves faster than the background, the
      // depth cue between the two photographic planes.
      gsap.fromTo(
        fgWrapRef.current,
        { yPercent: -16 },
        {
          yPercent: 16,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      )

      // Entrance: opaque as the section arrives (continuing Nature's own
      // exit-fade to the same charcoal), clearing on the way in.
      gsap.fromTo(
        vignetteInRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'top 30%',
            scrub: 0.4,
          },
        }
      )

      // Exit: darkens again toward the very bottom, so whatever follows
      // (Footer) is reached through a fade rather than a hard cut.
      gsap.fromTo(
        vignetteOutRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power1.in',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'bottom 60%',
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

  // --- Subtle desktop mouse-based depth parallax on bg / fg ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const section = sectionRef.current
    if (!section) return

    const moveBgX = gsap.quickTo(bgWrapRef.current, 'x', {
      duration: 1.1,
      ease: 'power3.out',
    })
    const moveBgY = gsap.quickTo(bgWrapRef.current, 'y', {
      duration: 1.1,
      ease: 'power3.out',
    })
    const moveFgX = gsap.quickTo(fgWrapRef.current, 'x', {
      duration: 0.9,
      ease: 'power3.out',
    })
    const moveFgY = gsap.quickTo(fgWrapRef.current, 'y', {
      duration: 0.9,
      ease: 'power3.out',
    })

    const handleMove = (event) => {
      const rect = section.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5 // -0.5 .. 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      moveBgX(nx * 12)
      moveBgY(ny * 8)
      moveFgX(nx * -26)
      moveFgY(ny * -16)
    }

    const handleLeave = () => {
      moveBgX(0)
      moveBgY(0)
      moveFgX(0)
      moveFgY(0)
    }

    section.addEventListener('mousemove', handleMove)
    section.addEventListener('mouseleave', handleLeave)
    return () => {
      section.removeEventListener('mousemove', handleMove)
      section.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <section className="final-cta" ref={sectionRef} id="final-cta">
      <div className="final-cta__media" aria-hidden="true">
        <div className="final-cta__bg" ref={bgWrapRef}>
          <img
            ref={bgImgRef}
            className="final-cta__bg-img"
            src={`${BG_BASE}?${IMG_PARAMS}&w=2200&h=1800`}
            srcSet={[
              `${BG_BASE}?${IMG_PARAMS}&w=900&h=1400 900w`,
              `${BG_BASE}?${IMG_PARAMS}&w=1600&h=1300 1600w`,
              `${BG_BASE}?${IMG_PARAMS}&w=2200&h=1800 2200w`,
            ].join(', ')}
            sizes="100vw"
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.classList.add('final-cta__bg--fallback')
            }}
          />
        </div>

        <div className="final-cta__fg" ref={fgWrapRef}>
          <img
            className="final-cta__fg-img"
            src={`${FG_BASE}?${IMG_PARAMS}&w=1800&h=1000`}
            srcSet={[
              `${FG_BASE}?${IMG_PARAMS}&w=800&h=500 800w`,
              `${FG_BASE}?${IMG_PARAMS}&w=1300&h=750 1300w`,
              `${FG_BASE}?${IMG_PARAMS}&w=1800&h=1000 1800w`,
            ].join(', ')}
            sizes="100vw"
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.classList.add('final-cta__fg--fallback')
            }}
          />
        </div>

        <div className="final-cta__scrim" />
        <div className="final-cta__vignette final-cta__vignette--in" ref={vignetteInRef} />
        <div className="final-cta__vignette final-cta__vignette--out" ref={vignetteOutRef} />
      </div>

      <div className="final-cta__content container">
        <p className="eyebrow final-cta__eyebrow" ref={eyebrowRef}>
          Before You Go
        </p>

        <h2 className="final-cta__heading">
          <span className="final-cta__heading-mask">
            <span className="final-cta__heading-inner" ref={headingInnerRef}>
              MAKE IT PERSONAL
            </span>
          </span>
        </h2>

        <p className="final-cta__body" ref={bodyRef}>
          Some things deserve more than a message. Let a bouquet say what
          you mean — chosen, arranged and sent with the same care as if
          you'd cut every stem yourself.
        </p>

        <a className="final-cta__cta" href="#bouquets" ref={ctaRef}>
          <span>Shop Bouquets</span>
        </a>
      </div>
    </section>
  )
}

export default FinalCTA
