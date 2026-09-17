import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../animations/gsapSetup'
import FeelingPhoto from '../components/FeelingPhoto.jsx'
import './Feelings.css'

/**
 * Real, editorial flower photography — sourced from Unsplash (free for
 * commercial use, no attribution required). One mood, one bloom: each
 * feeling gets its own distinct photograph rather than a shared stock
 * shot re-tinted five ways.
 */
const FEELINGS = [
  {
    id: 'love',
    label: 'LOVE',
    caption: 'For the ones who hold your heart',
    src: 'https://images.unsplash.com/photo-1679390248331-c258a5b30f89',
    alt: 'A close, richly saturated bouquet of deep red roses',
  },
  {
    id: 'romance',
    label: 'ROMANCE',
    caption: 'Soft petals, quiet devotion',
    src: 'https://images.unsplash.com/photo-1782038522695-12ecda5b5e6d',
    alt: 'Hands carefully arranging delicate blush peonies in soft natural light',
  },
  {
    id: 'joy',
    label: 'JOY',
    caption: 'Sunlit color, pure delight',
    src: 'https://images.unsplash.com/photo-1543409777-30250849aa3e',
    alt: 'A bright, cheerful bouquet of yellow sunflowers',
  },
  {
    id: 'celebrate',
    label: 'CELEBRATE',
    caption: 'Toast to the moment',
    src: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e',
    alt: 'A vivid, colorful display of festival flowers filling a medieval street',
  },
  {
    id: 'calm',
    label: 'CALM',
    caption: 'A slow breath, held gently',
    src: 'https://images.unsplash.com/photo-1775138386053-5766c8c10e85',
    alt: 'A soft bouquet of white roses seen through a hazy window',
  },
]

/**
 * Clip-path stops for the crossfade "wipe". All three share the same
 * point structure (four x/y pairs) so GSAP can interpolate between them
 * as a plain value tween — no plugin needed.
 */
const VISIBLE_CLIP = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
const ENTER_HIDDEN_CLIP = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
const EXIT_HIDDEN_CLIP = 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)'

/**
 * Feelings — "CHOOSE YOUR FEELING"
 * -----------------------------------------------------------------------
 * A premium, cinematic scroll-stepper through five moods. Each "feeling
 * block" pairs large mask-revealed typography with a full-bleed flower
 * photograph in the same box — beside each other in a two-column grid.
 * On desktop the five blocks stack on top of one another (position:
 * absolute, same box) and a single scrub-linked GSAP timeline wipes one
 * block out via clip-path while the next wipes in, so text and image
 * cross-fade together as one connected transition, with a slow Ken-Burns
 * scale on each photo for depth. The section pins only while this
 * stepping plays; the heading above it reveals separately, beforehand,
 * exactly like FlowerStory/SignatureBouquets.
 *
 * Tablet/mobile (≤1024px) drops the pin and the absolute stacking
 * entirely — the five blocks become a natural vertical flow, each
 * revealing once via its own ScrollTrigger as it scrolls into view.
 *
 * `prefers-reduced-motion` skips the pin, the wipe, and the per-block
 * reveal: every block renders at its final visible state, stacked in
 * normal document flow (never overlapping), regardless of viewport.
 * -----------------------------------------------------------------------
 */
function Feelings() {
  const sectionRef = useRef(null)
  const headingInnerRef = useRef(null)
  const introRef = useRef(null)
  const stageRef = useRef(null)
  const blockRefs = useRef([])
  const labelInnerRefs = useRef([])
  const captionRefs = useRef([])

  blockRefs.current = []
  labelInnerRefs.current = []
  captionRefs.current = []

  const addBlockRef = (el) => {
    if (el && !blockRefs.current.includes(el)) blockRefs.current.push(el)
  }
  const addLabelInnerRef = (el) => {
    if (el && !labelInnerRefs.current.includes(el)) labelInnerRefs.current.push(el)
  }
  const addCaptionRef = (el) => {
    if (el && !captionRefs.current.includes(el)) captionRefs.current.push(el)
  }

  // --- Heading + intro reveal, plays once as the section approaches the
  // viewport (fires well before the stepper's pin engages) ---
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

  // --- The feeling stepper itself: pinned scrub crossfade on desktop,
  // natural stacked reveal on tablet/mobile, static on reduced motion ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isDesktop: '(min-width: 1025px)',
          isCompact: '(max-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, isCompact, reduceMotion } = context.conditions
          const mediaEls = blockRefs.current.map((block) =>
            block.querySelector('.feeling-photo__img')
          )

          // Reduced motion: final, fully visible, non-overlapping state —
          // the stacked layout class below (see Feelings.css) overrides
          // the desktop absolute positioning so nothing hides behind
          // another block regardless of viewport width.
          if (reduceMotion) {
            sectionRef.current.classList.add('feelings--stacked')
            gsap.set(blockRefs.current, { clipPath: 'none', opacity: 1, y: 0 })
            gsap.set(mediaEls, { scale: 1 })
            gsap.set(labelInnerRefs.current, { yPercent: 0 })
            gsap.set(captionRefs.current, { opacity: 1, y: 0 })
            return
          }

          if (isDesktop) {
            gsap.set(blockRefs.current[0], { clipPath: VISIBLE_CLIP })
            gsap.set(blockRefs.current.slice(1), { clipPath: ENTER_HIDDEN_CLIP })
            gsap.set(mediaEls[0], { scale: 1 })
            gsap.set(mediaEls.slice(1), { scale: 1.15 })
            gsap.set(labelInnerRefs.current[0], { yPercent: 0 })
            gsap.set(labelInnerRefs.current.slice(1), { yPercent: 100 })
            gsap.set(captionRefs.current[0], { opacity: 1 })
            gsap.set(captionRefs.current.slice(1), { opacity: 0 })

            const steps = FEELINGS.length - 1
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: stageRef.current,
                start: 'top top',
                end: () => `+=${steps * window.innerHeight}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })

            for (let i = 0; i < steps; i += 1) {
              tl.to(
                blockRefs.current[i],
                { clipPath: EXIT_HIDDEN_CLIP, duration: 1, ease: 'power2.inOut' },
                i
              )
                .to(mediaEls[i], { scale: 1.06, duration: 1, ease: 'none' }, i)
                .to(
                  labelInnerRefs.current[i],
                  { yPercent: -100, duration: 1, ease: 'power2.inOut' },
                  i
                )
                .to(captionRefs.current[i], { opacity: 0, duration: 0.7, ease: 'none' }, i)
                .to(
                  blockRefs.current[i + 1],
                  { clipPath: VISIBLE_CLIP, duration: 1, ease: 'power2.inOut' },
                  i
                )
                .to(mediaEls[i + 1], { scale: 1, duration: 1, ease: 'none' }, i)
                .to(
                  labelInnerRefs.current[i + 1],
                  { yPercent: 0, duration: 1, ease: 'power2.inOut' },
                  i
                )
                .to(
                  captionRefs.current[i + 1],
                  { opacity: 1, duration: 0.7, ease: 'none' },
                  i + 0.3
                )
            }

            return () => tl.scrollTrigger?.kill()
          }

          if (isCompact) {
            gsap.set(blockRefs.current, { clipPath: 'none', opacity: 0, y: 40 })
            gsap.set(mediaEls, { scale: 1.12 })
            gsap.set(labelInnerRefs.current, { yPercent: 105 })
            gsap.set(captionRefs.current, { opacity: 0, y: 12 })

            const triggers = blockRefs.current.map((block, i) =>
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: block,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                  },
                })
                .to(block, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
                .to(
                  labelInnerRefs.current[i],
                  { yPercent: 0, duration: 0.9, ease: 'power4.out' },
                  0.1
                )
                .to(mediaEls[i], { scale: 1, duration: 1.2, ease: 'power3.out' }, 0.1)
                .to(
                  captionRefs.current[i],
                  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
                  0.35
                )
            )

            return () => triggers.forEach((tl) => tl.scrollTrigger?.kill())
          }

          return undefined
        }
      )

      return () => mm.revert()
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="feelings" ref={sectionRef} id="feelings">
      <div className="feelings__header container">
        <p className="eyebrow feelings__eyebrow">Every bouquet begins with a mood</p>
        <h2 className="feelings__heading">
          <span className="feelings__heading-mask">
            <span className="feelings__heading-inner" ref={headingInnerRef}>
              CHOOSE YOUR FEELING
            </span>
          </span>
        </h2>
        <p className="feelings__intro" ref={introRef}>
          Scroll to move through five moods, each paired with the bloom that carries it.
        </p>
      </div>

      <div className="feelings__stage" ref={stageRef}>
        {FEELINGS.map((feeling, index) => (
          <article className="feeling-block" ref={addBlockRef} key={feeling.id}>
            <div className="feeling-block__text">
              <span className="feeling-block__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="feeling-block__label">
                <span className="feeling-block__label-mask">
                  <span className="feeling-block__label-inner" ref={addLabelInnerRef}>
                    {feeling.label}
                  </span>
                </span>
              </h3>
              <p className="feeling-block__caption" ref={addCaptionRef}>
                {feeling.caption}
              </p>
            </div>

            <div className="feeling-block__media">
              <FeelingPhoto src={feeling.src} alt={feeling.alt} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Feelings
