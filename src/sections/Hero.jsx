import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { useMagnetic } from '../animations/magnetic'
import HeroBouquet from '../components/HeroBouquet.jsx'
import './Hero.css'

const HEADLINE_LINES = ['FLOWERS', 'FOR EVERY', 'MOMENT']

const PETAL_COUNT = 18

function Hero({ ready }) {
  const sectionRef = useRef(null)
  const lineRefs = useRef([])
  const bodyRef = useRef(null)
  const ctaRef = useRef(null)

  // This is now the FULL BACKGROUND layer
  const backgroundRef = useRef(null)

  const petalRefs = useRef([])

  useMagnetic(ctaRef, {
    strength: 0.35,
    maxOffset: 10,
  })

  lineRefs.current = []
  petalRefs.current = []

  const addLineRef = (el) => {
    if (el && !lineRefs.current.includes(el)) {
      lineRefs.current.push(el)
    }
  }

  const addPetalRef = (el) => {
    if (el && !petalRefs.current.includes(el)) {
      petalRefs.current.push(el)
    }
  }

  /* ============================================================
     HERO ENTRANCE
     ============================================================ */

  useLayoutEffect(() => {
    if (!ready) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(lineRefs.current, {
          yPercent: 0,
          opacity: 1,
        })

        gsap.set(bodyRef.current, {
          opacity: 1,
          y: 0,
        })

        gsap.set(ctaRef.current, {
          opacity: 1,
          y: 0,
        })

        gsap.set(backgroundRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
        })

        gsap.set(petalRefs.current, {
          opacity: 0.65,
          scale: 1,
        })

        return
      }

      /* ========================================================
         INITIAL STATES
         ======================================================== */

      gsap.set(lineRefs.current, {
        yPercent: 115,
      })

      gsap.set(bodyRef.current, {
        opacity: 0,
        y: 22,
      })

      gsap.set(ctaRef.current, {
        opacity: 0,
        y: 18,
      })

      /*
       * Background starts slightly zoomed.
       * This creates a cinematic photography reveal.
       */
      gsap.set(backgroundRef.current, {
        opacity: 0,
        scale: 1.08,
        y: 40,
      })

      gsap.set(petalRefs.current, {
        opacity: 0,
        scale: 0.55,
      })

      /* ========================================================
         ENTRANCE TIMELINE
         ======================================================== */

      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      })

      /*
       * TEXT
       */

      tl.to(
        lineRefs.current,
        {
          yPercent: 0,
          duration: 1,
          stagger: 0.14,
          ease: 'power4.out',
        },
        0.1
      )

      /*
       * FULL PHOTOGRAPH
       */

      .to(
        backgroundRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.6,
          ease: 'power3.out',
        },
        0.15
      )

      /*
       * DESCRIPTION
       */

      .to(
        bodyRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
        0.75
      )

      /*
       * CTA
       */

      .to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
        },
        0.95
      )

      /*
       * PETALS
       * Existing animation preserved.
       */

      .to(
        petalRefs.current,
        {
          opacity: 0.7,
          scale: 1,
          duration: 1.2,
          stagger: 0.06,
          ease: 'sine.out',
        },
        0.9
      )

      /* ========================================================
         CONTINUOUS PETAL WIND
         ======================================================== */

      petalRefs.current.forEach((petal, i) => {
        const direction = i % 2 === 0 ? 1 : -1

        const distanceX = 80 + (i % 5) * 45
        const distanceY = 35 + (i % 4) * 22
        const rotation = 20 + (i % 6) * 12

        gsap.to(petal, {
          x: direction * distanceX,
          y: -distanceY,
          rotation: direction * rotation,
          duration: 4.5 + (i % 6) * 0.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 1.5 + i * 0.12,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [ready])

  /* ============================================================
     SCROLL PARALLAX
     ============================================================ */

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      /*
       * FULL PHOTOGRAPH moves slightly slower than page.
       */

      gsap.to(backgroundRef.current, {
        yPercent: 9,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      })

      /*
       * Petals keep their different depth.
       */

      petalRefs.current.forEach((petal, i) => {
        gsap.to(petal, {
          yPercent: 12 + (i % 5) * 7,
          xPercent: i % 2 === 0 ? 3 : -3,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.7 + (i % 4) * 0.15,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* ============================================================
     MOUSE DEPTH
     ============================================================ */

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const hasFinePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches

    if (!hasFinePointer) return

    const section = sectionRef.current

    if (!section || !backgroundRef.current) return

    const moveX = gsap.quickTo(backgroundRef.current, 'x', {
      duration: 1.2,
      ease: 'power3.out',
    })

    const moveY = gsap.quickTo(backgroundRef.current, 'y', {
      duration: 1.2,
      ease: 'power3.out',
    })

    const MAX_SHIFT_X = 12
    const MAX_SHIFT_Y = 8

    const handlePointerMove = (event) => {
      const rect = section.getBoundingClientRect()

      const nx =
        (event.clientX - rect.left) / rect.width - 0.5

      const ny =
        (event.clientY - rect.top) / rect.height - 0.5

      moveX(nx * MAX_SHIFT_X)
      moveY(ny * MAX_SHIFT_Y)
    }

    const handlePointerLeave = () => {
      moveX(0)
      moveY(0)
    }

    section.addEventListener(
      'pointermove',
      handlePointerMove
    )

    section.addEventListener(
      'pointerleave',
      handlePointerLeave
    )

    return () => {
      section.removeEventListener(
        'pointermove',
        handlePointerMove
      )

      section.removeEventListener(
        'pointerleave',
        handlePointerLeave
      )
    }
  }, [])

  /* ============================================================
     JSX
     ============================================================ */

  return (
    <section
      className="hero"
      ref={sectionRef}
      id="hero"
    >

      {/* ========================================================
          FULL-SCREEN FLOWER PHOTOGRAPH
          ======================================================== */}

      <div
        className="hero__background"
        ref={backgroundRef}
        aria-hidden="true"
      >
        <HeroBouquet />
      </div>

      {/* ========================================================
          SOFT OVERLAY
          Helps the text remain readable.
          ======================================================== */}

      <div
        className="hero__background-overlay"
        aria-hidden="true"
      />

      <div className="hero__inner container">

        {/* ======================================================
            EXISTING CONTENT
            ====================================================== */}

        <div className="hero__content">

          <h1 className="hero__headline">

            {HEADLINE_LINES.map((line) => (
              <span
                className="hero__line-mask"
                key={line}
              >
                <span
                  className="hero__line-inner"
                  ref={addLineRef}
                >
                  {line}
                </span>
              </span>
            ))}

          </h1>

          <p
            className="hero__body"
            ref={bodyRef}
          >
            From everyday joys to life&rsquo;s biggest milestones,
            we turn feelings into flowers.
          </p>

          <a
            className="hero__cta"
            href="#shop"
            ref={ctaRef}
          >
            <span>SHOP BOUQUETS</span>

            <span
              className="hero__cta-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </a>

        </div>

        {/* ======================================================
            EXISTING PETALS — UNCHANGED
            ====================================================== */}

        <div
          className="hero__petals"
          aria-hidden="true"
        >
          {Array.from({ length: PETAL_COUNT }).map((_, i) => (
            <span
              key={i}
              ref={addPetalRef}
              className={`hero__petal hero__petal--${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}

export default Hero