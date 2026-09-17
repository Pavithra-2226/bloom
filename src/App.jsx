import { useState } from 'react'
import './App.css'
import Loader from './components/Loader.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './sections/Hero.jsx'
import FlowerStory from './sections/FlowerStory.jsx'
import SignatureBouquets from './sections/SignatureBouquets.jsx'
import Feelings from './sections/Feelings.jsx'

import Nature from './sections/Nature.jsx'
import FinalCTA from './sections/FinalCTA.jsx'
import Footer from './sections/Footer.jsx'

// Phase 3: Navbar + Hero replace the Phase 1 placeholder. The Phase 2 loader
// still gates first paint; Navbar and Hero animate in once it hands off.
// Phase 4: Flower Story added below Hero — it reveals on scroll, independent
// of the loader's `ready` gate, and uses real bouquet photography (see
// components/FlowerPhoto.jsx) rather than a flat SVG illustration.
// Hero Visual Upgrade: Hero's bouquet is now real photography too (see
// components/HeroBouquet.jsx), and Navbar is a floating translucent pill.
// Phase 5: Signature Bouquets added below Flower Story — a pinned
// horizontal-scroll gallery of five bouquets (see
// sections/SignatureBouquets.jsx), reusing the app's single GSAP +
// ScrollTrigger + Lenis setup rather than creating a second Lenis instance.
// Phase 6: Choose Your Feeling added below Signature Bouquets — a pinned
// scroll-stepper through five moods (see sections/Feelings.jsx), again
// reusing the app's single GSAP + ScrollTrigger + Lenis setup.
// Phase 7: Build Your Bouquet added below Choose Your Feeling — a live,
// interactive bouquet builder (see sections/BuildBouquet.jsx and
// components/BouquetPreview.jsx) with swatch controls and a large
// preview that updates immediately via GSAP, plus a gentle CSS-3D mouse
// tilt on the preview (no Three.js — there are no real 3D flower assets,
// so CSS perspective/transform depth reads more premium than primitive
// WebGL geometry would). Still the app's single GSAP/ScrollTrigger/Lenis
// setup, no second Lenis instance.
// Phase 8: Nature / Parallax added below Build Your Bouquet — a full-screen
// cinematic scene (see sections/Nature.jsx) with layered scroll parallax
// (background drift + slow zoom, faster-moving foreground flowers,
// independently drifting petals) plus a scroll-scrubbed vignette for a
// cinematic fade into and out of the section, and a subtle desktop-only
// mouse-based depth parallax. Still the app's single GSAP/ScrollTrigger/
// Lenis setup, no second Lenis instance, no Three.js (not needed for this
// effect).
// Phase 9: Final CTA added below Nature / Parallax — a full-screen,
// centered closing statement (see sections/FinalCTA.jsx) with the same
// two-layer scroll parallax + slow zoom language as Nature, plus its own
// entrance/exit vignettes tuned to pick up exactly where Nature's exit
// fade leaves off, so the two sections dissolve into one another rather
// than cutting. Still the app's single GSAP/ScrollTrigger/Lenis setup, no
// second Lenis instance, no Three.js.
// Phase 10 (final): Footer added below Final CTA — a spacious editorial
// footer (see sections/Footer.jsx) that opens already `--charcoal`,
// continuing directly from Final CTA's own exit fade rather than cutting.
// Also the site's final polish pass: a small shared magnetic-hover hook
// (see animations/magnetic.js) applied to the navbar mark, a few section
// CTAs, and the footer's own buttons, so hover feels consistent end to
// end. Still the app's single GSAP/ScrollTrigger/Lenis setup, no second
// Lenis instance, no Three.js, no backend/API/database.
function App() {
  const [loading, setLoading] = useState(true)
  const ready = !loading

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      <Navbar ready={ready} />
      <Hero ready={ready} />
      <FlowerStory />
      <SignatureBouquets />
      <Feelings />
      
      <Nature />
      <FinalCTA />
      <Footer />
    </>
  )
}

export default App
