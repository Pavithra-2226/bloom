/**
 * magnetic.js
 * -----------------------------------------------------------------------
 * Phase 10. A single, shared "magnetic" hover micro-interaction, so the
 * important buttons/links across BLOOM (navbar mark, section CTAs,
 * footer) all pull toward the cursor the same way instead of each
 * component reinventing its own version — one detail that ties the
 * navbar, sections and footer into one continuous feel.
 *
 * Purely additive: it only ever nudges an element's transform x/y (and
 * optionally scale) on top of whatever that element already does, so it
 * never fights a section's own GSAP timelines or CSS transitions. Disabled
 * entirely under prefers-reduced-motion, and inert on touch devices since
 * it only ever listens for mousemove.
 *
 * Usage:
 *   const ctaRef = useRef(null)
 *   useMagnetic(ctaRef, { strength: 0.3 })
 *   <a ref={ctaRef}>...</a>
 * -----------------------------------------------------------------------
 */
import { useEffect } from 'react'
import { gsap } from './gsapSetup'

export function useMagnetic(ref, { strength = 0.3, maxOffset = 16, scale = 1 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const moveX = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const moveY = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const moveScale =
      scale !== 1 ? gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power3.out' }) : null

    const handleMove = (event) => {
      const rect = el.getBoundingClientRect()
      const x = gsap.utils.clamp(
        -maxOffset,
        maxOffset,
        (event.clientX - rect.left - rect.width / 2) * strength
      )
      const y = gsap.utils.clamp(
        -maxOffset,
        maxOffset,
        (event.clientY - rect.top - rect.height / 2) * strength
      )
      moveX(x)
      moveY(y)
      moveScale?.(scale)
    }

    const handleLeave = () => {
      moveX(0)
      moveY(0)
      moveScale?.(1)
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      gsap.set(el, scale !== 1 ? { x: 0, y: 0, scale: 1 } : { x: 0, y: 0 })
    }
  }, [ref, strength, maxOffset, scale])
}
