/**
 * smoothScroll.js
 * -----------------------------------------------------------------------
 * Reusable Lenis smooth-scroll setup for BLOOM.
 *
 * Phase 3: initialized once, at the app's entry point (main.jsx), before
 * React renders — so any component can safely read the live instance via
 * getSmoothScroll() on its very first effect, regardless of mount order.
 * Synced with ScrollTrigger.update so scroll-driven animations (parallax,
 * reveals) stay accurate against Lenis's virtual scroll position.
 *
 * Usage:
 *   import { initSmoothScroll, getSmoothScroll, destroySmoothScroll } from './animations/smoothScroll'
 * -----------------------------------------------------------------------
 */

import Lenis from 'lenis'
import { ScrollTrigger } from './gsapSetup'

let lenisInstance = null
let rafId = null

/**
 * Default Lenis configuration tuned for an editorial, cinematic feel.
 * Kept intentionally simple — no ScrollTrigger wiring yet.
 */
const defaultOptions = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
}

/**
 * Initializes the Lenis smooth-scroll instance and starts its
 * requestAnimationFrame loop. Safe to call once; subsequent calls
 * return the existing instance instead of creating duplicates.
 *
 * @param {object} [options] - Optional overrides merged with defaultOptions.
 * @returns {Lenis} the active Lenis instance
 */
export function initSmoothScroll(options = {}) {
  if (lenisInstance) return lenisInstance

  lenisInstance = new Lenis({ ...defaultOptions, ...options })

  // Keep ScrollTrigger's measurements in sync with Lenis's virtual scroll
  // position, since Lenis intercepts native scroll.
  lenisInstance.on('scroll', ScrollTrigger.update)

  function raf(time) {
    lenisInstance?.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)

  return lenisInstance
}

/**
 * Returns the current Lenis instance, if initialized.
 */
export function getSmoothScroll() {
  return lenisInstance
}

/**
 * Stops the raf loop and destroys the Lenis instance.
 * Call on app/component unmount to avoid leaks.
 */
export function destroySmoothScroll() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  lenisInstance?.destroy()
  lenisInstance = null
}
