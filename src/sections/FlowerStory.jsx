import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import FlowerPhoto from '../components/FlowerPhoto.jsx'
import './FlowerStory.css'

/**
 * FlowerStory
 * -----------------------------------------------------------------------
 * "MORE THAN JUST FLOWERS" — an asymmetric editorial section: a modest
 * text column paired with a large, offset, realistic bouquet photograph
 * (FlowerPhoto). Phase 4 replaces the earlier flat SVG botanical
 * illustration with real photography — premium editorial direction, not
 * a boxed "card".
 *
 * Unlike Hero (which animates in once on load, gated by the Loader),
 * this section reveals itself the first time it scrolls into view —
 * a standard ScrollTrigger `toggleActions` reveal, played once — plus two
 * separate, independent scrub-based parallax effects for as long as the
 * section is in the viewport: the visual wrapper drifts vertically, and
 * the photo itself very slowly scales down (a subtle Ken-Burns effect),
 * so the reveal reads as layered and cinematic rather than one flat plane.
 *
 * `prefers-reduced-motion` skips all of the above: content and photo
 * render in their final, fully-visible position with no motion at all.
 * -----------------------------------------------------------------------
 */
function FlowerStory() {
  const sectionRef = useRef(null)
  const headingMaskRef = useRef(null)
  const headingInnerRef = useRef(null)
  const bodyRef = useRef(null)
  const visualWrapRef = useRef(null)
  const photoImgRef = useRef(null)

  // --- Scroll-triggered reveal, plays once ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(headingInnerRef.current, { yPercent: 0 })
        gsap.set(bodyRef.current, { opacity: 1, y: 0 })
        gsap.set(visualWrapRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
        })
        gsap.set(photoImgRef.current, { scale: 1 })
        return
      }

      gsap.set(headingInnerRef.current, { yPercent: 105 })
      gsap.set(bodyRef.current, { opacity: 0, y: 24 })
      gsap.set(visualWrapRef.current, {
        opacity: 0,
        scale: 1.06,
        y: 50,
        clipPath: 'inset(14% 10% 14% 10%)',
      })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      })

      tl.to(headingInnerRef.current, {
        yPercent: 0,
        duration: 1.1,
        ease: 'power4.out',
      })
        .to(
          visualWrapRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'power3.out',
          },
          0.15
        )
        .to(bodyRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.45)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // --- Independent, continuous scroll parallax on the visual ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.to(visualWrapRef.current, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      })

      // Slow Ken-Burns scale on the photograph itself, independent of the
      // wrapper's parallax drift above — gives the reveal a sense of depth.
      gsap.fromTo(
        photoImgRef.current,
        { scale: 1.14 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.9,
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

  return (
    <section className="flower-story" ref={sectionRef} id="story">
      <div className="flower-story__inner container">
        <div className="flower-story__text">
          <h2 className="flower-story__heading">
            <span className="flower-story__heading-mask" ref={headingMaskRef}>
              <span className="flower-story__heading-inner" ref={headingInnerRef}>
                MORE THAN JUST FLOWERS
              </span>
            </span>
          </h2>

          <p className="flower-story__body" ref={bodyRef}>
            Every stem carries something unspoken — a memory, an apology, a
            quiet thank you. We build each arrangement as its own small
            language, one meant to hold a feeling and mark a moment worth
            remembering, long after the words are gone.
          </p>
        </div>

        <div className="flower-story__visual" ref={visualWrapRef}>
          <FlowerPhoto ref={photoImgRef} />
        </div>
      </div>
    </section>
  )
}

export default FlowerStory
