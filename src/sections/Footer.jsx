import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { getSmoothScroll } from '../animations/smoothScroll'
import { useMagnetic } from '../animations/magnetic'
import './Footer.css'

/**
 * Footer — Phase 10
 * -----------------------------------------------------------------------
 * BLOOM's closing statement: a spacious, editorial footer rather than a
 * dense link-dump — no cards, no boxed panels. It opens already
 * `--charcoal`, picking up exactly where Final CTA's exit vignette
 * leaves off (Final CTA darkens fully to `--charcoal` at its own bottom
 * edge), so the two sections dissolve into one another instead of
 * cutting.
 *
 * Content (top to bottom):
 *   - a few slow, ambient petals drifting in the background (purely
 *     decorative, independent of scroll — the same drifting-petal
 *     language as the Nature section, dialed way down)
 *   - the BLOOM wordmark + tagline, revealed with the same mask/inner
 *     reveal used for headings elsewhere on the site
 *   - a minimal newsletter row (client-side only — no backend/API)
 *   - three plain link columns: Explore / Contact / Follow
 *   - a hairline-divided bottom bar: copyright, legal links, back-to-top
 *
 * The whole content block reveals once via ScrollTrigger the first time
 * it enters view (fade + rise, staggered), matching the one-time
 * entrance pattern every other section already uses. `prefers-reduced-
 * motion` disables the reveal, the petals, and every magnetic hover.
 * -----------------------------------------------------------------------
 */

const NAV_LINKS = [
  { label: 'Shop', href: '#bouquets' },
  { label: 'About', href: '#story' },
  { label: 'Journal', href: '#nature' },
  { label: 'Contact', href: '#contact' },
]

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Pinterest', href: 'https://pinterest.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
]

const PETAL_COUNT = 6

function makePetals() {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    id: i,
    left: 6 + Math.random() * 88,
    size: 8 + Math.random() * 8,
    fallDuration: 20 + Math.random() * 12,
    fallDelay: Math.random() * -20,
    swayDuration: 6 + Math.random() * 5,
    swayDistance: 14 + Math.random() * 20,
    rotate: 120 + Math.random() * 200,
    opacity: 0.14 + Math.random() * 0.16,
  }))
}

function Footer() {
  const sectionRef = useRef(null)
  const petalsRef = useRef(null)
  const petalElsRef = useRef([])
  const wordmarkInnerRef = useRef(null)
  const taglineRef = useRef(null)
  const newsletterRef = useRef(null)
  const columnsRef = useRef(null)
  const bottomRef = useRef(null)
  const submitRef = useRef(null)
  const toTopRef = useRef(null)

  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const petals = useMemo(() => makePetals(), [])

  petalElsRef.current = []
  const addPetalRef = (el) => {
    if (el && !petalElsRef.current.includes(el)) {
      petalElsRef.current.push(el)
    }
  }

  // --- Entrance reveal, plays once when the footer first comes into view ---
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      const groups = [
        newsletterRef.current,
        ...Array.from(columnsRef.current?.children ?? []),
        bottomRef.current,
      ]

      if (prefersReducedMotion) {
        gsap.set(wordmarkInnerRef.current, { yPercent: 0 })
        gsap.set([taglineRef.current, ...groups], { opacity: 1, y: 0 })
        return
      }

      gsap.set(wordmarkInnerRef.current, { yPercent: 105 })
      gsap.set(taglineRef.current, { opacity: 0, y: 14 })
      gsap.set(groups, { opacity: 0, y: 22 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        defaults: { ease: 'power3.out' },
      })

      tl.to(wordmarkInnerRef.current, { yPercent: 0, duration: 1.1, ease: 'power4.out' }, 0)
        .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.3)
        .to(groups, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.4)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // --- Ambient petals: continuous, independent of scroll — dialed well
  // below Nature's, so it reads as a quiet detail rather than a repeat ---
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

  useLayoutEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill()
      })
    }
  }, [])

  // --- Magnetic pull on the handful of elements that deserve it ---
  useMagnetic(submitRef, { strength: 0.35, maxOffset: 10 })
  useMagnetic(toTopRef, { strength: 0.4, maxOffset: 12 })

  const handleSubscribe = (event) => {
    event.preventDefault()
    if (!email.trim() || subscribed) return
    // Client-side only, by design (Phase 10 adds no backend/API/database) —
    // this simply acknowledges the action in the UI.
    setSubscribed(true)
  }

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const lenis = getSmoothScroll()
    if (lenis) {
      lenis.scrollTo(0, { duration: prefersReducedMotion ? 0 : 1.4 })
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }
  }

  return (
    <footer className="footer" ref={sectionRef} id="contact">
      <div className="footer__petals" aria-hidden="true" ref={petalsRef}>
        {petals.map((petal, i) => (
          <span
            key={petal.id}
            ref={addPetalRef}
            className="footer__petal"
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

      <div className="footer__top container">
        <div className="footer__brand">
          <h2 className="footer__wordmark">
            <span className="footer__wordmark-mask">
              <span className="footer__wordmark-inner" ref={wordmarkInnerRef}>
                BLOOM
              </span>
            </span>
          </h2>
          <p className="footer__tagline" ref={taglineRef}>
            flowers, arranged with feeling
          </p>
        </div>

        <form className="footer__newsletter" ref={newsletterRef} onSubmit={handleSubscribe}>
          <label className="eyebrow footer__newsletter-label" htmlFor="footer-email">
            Stay in Bloom
          </label>
          <div className={`footer__newsletter-row${subscribed ? ' footer__newsletter-row--done' : ''}`}>
            <input
              id="footer-email"
              className="footer__newsletter-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={subscribed}
              required
            />
            <button
              type="submit"
              className="footer__newsletter-submit"
              ref={submitRef}
              disabled={subscribed}
              aria-label={subscribed ? 'Subscribed' : 'Subscribe to the newsletter'}
            >
              <span>{subscribed ? 'Subscribed' : 'Subscribe'}</span>
              <span className="footer__newsletter-arrow" aria-hidden="true">
                {subscribed ? '✓' : '→'}
              </span>
            </button>
          </div>
          <p className="footer__newsletter-note" role="status">
            {subscribed
              ? 'Welcome to Bloom — look out for our next letter.'
              : 'Seasonal arrangements and journal notes, occasionally.'}
          </p>
        </form>
      </div>

      <div className="footer__divider" role="presentation" />

      <div className="footer__columns container" ref={columnsRef}>
        <nav className="footer__col" aria-label="Footer navigation">
          <p className="eyebrow footer__col-title">Explore</p>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a className="footer__link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <p className="eyebrow footer__col-title">Contact</p>
          <ul>
            <li>
              <a className="footer__link" href="mailto:hello@bloomflowers.example">
                hello@bloomflowers.example
              </a>
            </li>
            <li>
              <a className="footer__link" href="tel:+12125550134">
                +1 (212) 555-0134
              </a>
            </li>
            <li>
              <span className="footer__static">New York · Los Angeles</span>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <p className="eyebrow footer__col-title">Follow</p>
          <ul>
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  className="footer__link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom container" ref={bottomRef}>
        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} BLOOM. All rights reserved.
        </p>

        <div className="footer__legal">
          <a className="footer__legal-link" href="#privacy">
            Privacy
          </a>
          <a className="footer__legal-link" href="#terms">
            Terms
          </a>
        </div>

        <button type="button" className="footer__to-top" ref={toTopRef} onClick={scrollToTop}>
          <span>Back to top</span>
          <span className="footer__to-top-arrow" aria-hidden="true">
            ↑
          </span>
        </button>
      </div>
    </footer>
  )
}

export default Footer
