import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsapSetup'
import { getSmoothScroll } from '../animations/smoothScroll'
import { useMagnetic } from '../animations/magnetic'
import './Navbar.css'

// Phase 10: explicit hrefs instead of deriving `#${label.toLowerCase()}` —
// the derived form never matched any section's actual id (SHOP/ABOUT/
// JOURNAL always pointed at non-existent anchors). Mapped to the closest
// existing section, matching the same mapping the footer's nav column
// uses, so both navigations agree. CART intentionally has no section
// anchor — it's a future drawer/modal, not a page section.
const LINKS = [
  { label: 'SHOP', href: '#bouquets' },
  { label: 'ABOUT', href: '#story' },
  { label: 'JOURNAL', href: '#nature' },
  { label: 'CONTACT', href: '#contact' },
]

/**
 * Navbar
 * -----------------------------------------------------------------------
 * BLOOM's navigation, styled as a subtle floating pill (translucent cream,
 * light blur, thin hairline border) rather than a full-width bar —
 * inspired by the Scrolltide/Ember reference's floating nav *composition*
 * only; none of its dark styling, content, or branding.
 *
 * - Fades/scales in once the Loader (Phase 2) hands off via `ready`.
 * - A soft shadow strengthens slightly once the page scrolls past a small
 *   threshold, read from the app's single Lenis instance — the pill
 *   itself stays translucent+blurred throughout, it doesn't need scroll
 *   to "turn on" its background the way a full-width bar would.
 * - A small pill-shaped indicator slides beneath whichever primary link
 *   is hovered or focused (a quiet "you are here" affordance — this site
 *   has no per-section scroll-spy yet, so it tracks interaction rather
 *   than scroll position).
 * - Collapses SHOP/ABOUT/JOURNAL/CONTACT into a toggled panel on narrow
 *   viewports so links stay reachable without crowding the pill.
 * -----------------------------------------------------------------------
 */
function Navbar({ ready }) {
  const navRef = useRef(null)
  const pillRef = useRef(null)
  const logoRef = useRef(null)
  const linksRowRef = useRef(null)
  const linkRefs = useRef([])
  const indicatorRef = useRef(null)
  const cartRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  linkRefs.current = []
  const addLinkRef = (el) => {
    if (el && !linkRefs.current.includes(el)) {
      linkRefs.current.push(el)
    }
  }

  // --- Entrance, gated on the loader completing ---
  useLayoutEffect(() => {
    if (!ready) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      const revealTargets = [logoRef.current, ...linkRefs.current, cartRef.current]

      if (prefersReducedMotion) {
        gsap.set(pillRef.current, { opacity: 1, y: 0, scale: 1 })
        gsap.set(revealTargets, { opacity: 1, y: 0 })
        return
      }

      gsap.set(pillRef.current, { opacity: 0, y: -14, scale: 0.97 })
      gsap.set(revealTargets, { opacity: 0, y: -6 })

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(pillRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power4.out' }, 0)
        .to(logoRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.25)
        .to(linkRefs.current, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05 }, 0.35)
        .to(cartRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.55)
    }, navRef)

    return () => ctx.revert()
  }, [ready])

  // --- Subtle scroll state, synced with the app's single Lenis instance ---
  useLayoutEffect(() => {
    let ticking = false
    const threshold = 24

    const updateScrolled = (scrollY) => {
      const next = scrollY > threshold
      setScrolled((prev) => (prev === next ? prev : next))
    }

    const lenis = getSmoothScroll()
    const handleLenisScroll = (instance) => updateScrolled(instance.scroll)
    const handleWindowScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        updateScrolled(window.scrollY)
        ticking = false
      })
    }

    if (lenis) {
      lenis.on('scroll', handleLenisScroll)
    } else {
      // Fallback only — the app initializes Lenis before mount, so this
      // path is a safety net rather than the expected route.
      window.addEventListener('scroll', handleWindowScroll, { passive: true })
    }

    return () => {
      lenis?.off('scroll', handleLenisScroll)
      window.removeEventListener('scroll', handleWindowScroll)
    }
  }, [])

  // --- Hover/focus-following active-link indicator ---
  const moveIndicatorTo = (target) => {
    const indicator = indicatorRef.current
    const row = linksRowRef.current
    if (!indicator || !row || !target) return

    const rowRect = row.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    gsap.to(indicator, {
      x: targetRect.left - rowRect.left,
      width: targetRect.width,
      opacity: 1,
      duration: prefersReducedMotion ? 0 : 0.45,
      ease: 'power3.out',
    })
  }

  const hideIndicator = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    gsap.to(indicatorRef.current, {
      opacity: 0,
      duration: prefersReducedMotion ? 0 : 0.3,
      ease: 'power2.out',
    })
  }

  const closeMenu = () => setMenuOpen(false)

  // Phase 10: a small magnetic pull on the two fixed anchors of the pill
  // (logo, cart) — subtle, not applied to the primary links since those
  // already have their own hover indicator.
  useMagnetic(logoRef, { strength: 0.3, maxOffset: 8 })
  useMagnetic(cartRef, { strength: 0.3, maxOffset: 8 })

  return (
    <header
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}${
        menuOpen ? ' navbar--menu-open' : ''
      }`}
      ref={navRef}
    >
      <div className="navbar__pill" ref={pillRef}>
        <a className="navbar__logo" href="#hero" ref={logoRef} onClick={closeMenu}>
          BLOOM
        </a>

        <nav
          className="navbar__links"
          aria-label="Primary"
          ref={linksRowRef}
          onMouseLeave={hideIndicator}
        >
          <span className="navbar__indicator" ref={indicatorRef} aria-hidden="true" />
          {LINKS.map((link) => (
            <a
              key={link.label}
              className="navbar__link"
              href={link.href}
              ref={addLinkRef}
              onMouseEnter={(event) => moveIndicatorTo(event.currentTarget)}
              onFocus={(event) => moveIndicatorTo(event.currentTarget)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <a className="navbar__cart" href="#cart" ref={cartRef}>
            CART
          </a>
          <button
            type="button"
            className="navbar__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav className="navbar__mobile-links" aria-label="Primary mobile" id="mobile-nav">
        {LINKS.map((link) => (
          <a
            key={link.label}
            className="navbar__mobile-link"
            href={link.href}
            onClick={closeMenu}
          >
            {link.label}
          </a>
        ))}
        <a className="navbar__mobile-link navbar__mobile-link--cart" href="#cart" onClick={closeMenu}>
          CART
        </a>
      </nav>
    </header>
  )
}

export default Navbar
