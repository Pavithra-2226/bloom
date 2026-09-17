/**
 * gsapSetup.js
 * -----------------------------------------------------------------------
 * Central place to register GSAP plugins for BLOOM.
 *
 * Phase 1: registration only. No timelines, tweens, or ScrollTrigger
 * instances are created here — that begins in the phase that builds
 * the loader, hero, and scroll-driven sections.
 *
 * Usage (future phases):
 *   import { gsap, ScrollTrigger } from './animations/gsapSetup'
 * -----------------------------------------------------------------------
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
