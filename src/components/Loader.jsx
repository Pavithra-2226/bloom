import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../animations/gsapSetup'
import './Loader.css'

import bouquet1 from '../assets/loader/bouquet-1.png'
import bouquet2 from '../assets/loader/bouquet-2.png'
import bouquet3 from '../assets/loader/bouquet-3.png'
import bouquet4 from '../assets/loader/bouquet-4.png'

const BOUQUETS = [
  {
    src: bouquet1,
    className: 'bouquet--one',
    startX: '-42vw',
    startY: '115vh',
    endX: '-30vw',
    endY: '-18vh',
    scale: 0.72,
    rotation: -18,
    delay: 0.05,
  },
  {
    src: bouquet2,
    className: 'bouquet--two',
    startX: '38vw',
    startY: '112vh',
    endX: '28vw',
    endY: '-22vh',
    scale: 0.62,
    rotation: 22,
    delay: 0.18,
  },
  {
    src: bouquet3,
    className: 'bouquet--three',
    startX: '-12vw',
    startY: '118vh',
    endX: '-42vw',
    endY: '4vh',
    scale: 0.48,
    rotation: -30,
    delay: 0.32,
  },
  {
    src: bouquet4,
    className: 'bouquet--four',
    startX: '12vw',
    startY: '120vh',
    endX: '43vw',
    endY: '8vh',
    scale: 0.52,
    rotation: 28,
    delay: 0.42,
  },
  {
    src: bouquet2,
    className: 'bouquet--five',
    startX: '-48vw',
    startY: '48vh',
    endX: '-30vw',
    endY: '76vh',
    scale: 0.4,
    rotation: -42,
    delay: 0.55,
  },
  {
    src: bouquet1,
    className: 'bouquet--six',
    startX: '48vw',
    startY: '44vh',
    endX: '32vw',
    endY: '72vh',
    scale: 0.42,
    rotation: 38,
    delay: 0.65,
  },
  {
    src: bouquet3,
    className: 'bouquet--seven',
    startX: '-5vw',
    startY: '125vh',
    endX: '5vw',
    endY: '-28vh',
    scale: 0.34,
    rotation: -55,
    delay: 0.78,
  },
  {
    src: bouquet4,
    className: 'bouquet--eight',
    startX: '6vw',
    startY: '125vh',
    endX: '-8vw',
    endY: '-25vh',
    scale: 0.38,
    rotation: 48,
    delay: 0.88,
  },
]

const PETALS = Array.from({ length: 26 }, (_, index) => ({
  left: `${5 + ((index * 37) % 90)}%`,
  top: `${5 + ((index * 53) % 90)}%`,
  size: 7 + (index % 4) * 2,
  rotation: -50 + (index * 29) % 100,
  delay: (index % 8) * 0.08,
}))

function Loader({ onComplete }) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const brandRef = useRef(null)
  const logoRef = useRef(null)
  const taglineRef = useRef(null)
  const lineRef = useRef(null)
  const bouquetRefs = useRef([])
  const petalRefs = useRef([])

  bouquetRefs.current = []
  petalRefs.current = []

  const addBouquetRef = (element) => {
    if (element && !bouquetRefs.current.includes(element)) {
      bouquetRefs.current.push(element)
    }
  }

  const addPetalRef = (element) => {
    if (element && !petalRefs.current.includes(element)) {
      petalRefs.current.push(element)
    }
  }

  useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const finish = () => {
      document.body.style.overflow = previousOverflow
      onComplete?.()
    }

    const ctx = gsap.context(() => {
      /*
       * REDUCED MOTION
       */
      if (reducedMotion) {
        gsap.set(stageRef.current, { opacity: 1 })
        gsap.set(bouquetRefs.current, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 0.5,
          rotation: 0,
        })

        gsap.set(brandRef.current, { opacity: 1 })
        gsap.set(logoRef.current, { opacity: 1, y: 0 })
        gsap.set(lineRef.current, { scaleX: 1 })
        gsap.set(taglineRef.current, { opacity: 1, y: 0 })

        gsap.timeline({
          delay: 0.4,
          onComplete: finish,
        }).to(containerRef.current, {
          yPercent: -100,
          duration: 0.6,
          ease: 'power2.inOut',
        })

        return
      }

      /*
       * INITIAL STATES
       */

      gsap.set(stageRef.current, {
        opacity: 1,
      })

      gsap.set(brandRef.current, {
        opacity: 1,
      })

      gsap.set(logoRef.current, {
        opacity: 0,
        y: 35,
        scale: 0.92,
        letterSpacing: '0.28em',
      })

      gsap.set(lineRef.current, {
        scaleX: 0,
        transformOrigin: '50% 50%',
      })

      gsap.set(taglineRef.current, {
        opacity: 0,
        y: 15,
      })

      gsap.set(bouquetRefs.current, {
        opacity: 0,
        transformOrigin: '50% 50%',
      })

      gsap.set(petalRefs.current, {
        opacity: 0,
        scale: 0.3,
      })

      /*
       * MAIN TIMELINE
       */

      const tl = gsap.timeline({
        onComplete: finish,
      })

      /*
       * PHASE 1
       * Small petals begin appearing.
       */

      tl.to(
        petalRefs.current,
        {
          opacity: (index) => index % 3 === 0 ? 0.65 : 0.35,
          scale: 1,
          duration: 0.45,
          stagger: 0.025,
          ease: 'power2.out',
        },
        0.05
      )

      /*
       * PHASE 2
       * BOUQUETS BURST UPWARD.
       */

      bouquetRefs.current.forEach((bouquet, index) => {
        const data = BOUQUETS[index]

        gsap.set(bouquet, {
          x: data.startX,
          y: data.startY,
          scale: data.scale,
          rotation: data.rotation,
          opacity: 0,
          z: index % 3 === 0 ? 100 : -50,
        })

        tl.to(
          bouquet,
          {
            opacity: 1,
            x: data.endX,
            y: data.endY,
            scale: data.scale * 1.18,
            rotation: data.rotation + (index % 2 === 0 ? 24 : -22),
            duration: 1.15 + index * 0.04,
            delay: data.delay,
            ease: 'power3.out',
          },
          0.12
        )
      })

      /*
       * PHASE 3
       * Bouquets float at different depths.
       */

      bouquetRefs.current.forEach((bouquet, index) => {
        gsap.to(bouquet, {
          x: `+=${index % 2 === 0 ? 18 : -18}`,
          y: `+=${index % 3 === 0 ? -10 : 12}`,
          rotation: `+=${index % 2 === 0 ? 7 : -7}`,
          duration: 1.1 + index * 0.08,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.25 + index * 0.05,
        })
      })

      /*
       * PHASE 4
       * BLOOM appears behind the flowers.
       */

      tl.to(
        logoRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          letterSpacing: '0.08em',
          duration: 0.9,
          ease: 'power3.out',
        },
        1.95
      )

      tl.to(
        lineRef.current,
        {
          scaleX: 1,
          duration: 0.55,
          ease: 'power2.out',
        },
        2.55
      )

      tl.to(
        taglineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'sine.out',
        },
        2.68
      )

      /*
       * PHASE 5
       * BOUQUETS START FALLING.
       */

      bouquetRefs.current.forEach((bouquet, index) => {
        const direction = index % 2 === 0 ? 1 : -1

        tl.to(
          bouquet,
          {
            x: `+=${direction * (12 + index * 5)}vw`,
            y: `${55 + (index % 4) * 15}vh`,
            scale: BOUQUETS[index].scale * 0.9,
            rotation:
              BOUQUETS[index].rotation +
              (direction * 35) +
              (index * 7),
            opacity: index === 0 || index === 1 ? 0.85 : 0.7,
            duration: 1.15 + index * 0.08,
            ease: 'power2.in',
          },
          2.75 + index * 0.035
        )
      })

      /*
       * PHASE 6
       * Petals drift naturally during the fall.
       */

      petalRefs.current.forEach((petal, index) => {
        const direction = index % 2 === 0 ? 1 : -1

        gsap.to(petal, {
          x: direction * gsap.utils.random(80, 220),
          y: gsap.utils.random(80, 260),
          rotation: gsap.utils.random(-180, 180),
          duration: gsap.utils.random(2.4, 3.4),
          delay: 1.1 + index * 0.025,
          ease: 'sine.inOut',
        })
      })

      /*
       * PHASE 7
       * Hold BLOOM briefly.
       */

      tl.to({}, { duration: 0.55 }, 4.35)

      /*
       * PHASE 8
       * Entire loader slides upward.
       * No white flash.
       */

      tl.to(
        containerRef.current,
        {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
        },
        4.9
      )
    }, containerRef)

    return () => {
      ctx.revert()
      document.body.style.overflow = previousOverflow
    }
  }, [onComplete])

  return (
    <div
      className="loader"
      ref={containerRef}
      aria-hidden="true"
    >
      <div className="loader__background" />

      <div
        className="loader__stage"
        ref={stageRef}
      >
        {BOUQUETS.map((bouquet, index) => (
          <img
            key={`${bouquet.className}-${index}`}
            ref={addBouquetRef}
            className={`loader__bouquet ${bouquet.className}`}
            src={bouquet.src}
            alt=""
          />
        ))}

        {PETALS.map((petal, index) => (
          <span
            key={`petal-${index}`}
            ref={addPetalRef}
            className="loader__petal"
            style={{
              left: petal.left,
              top: petal.top,
              width: `${petal.size}px`,
              height: `${petal.size * 1.45}px`,
              transform: `rotate(${petal.rotation}deg)`,
            }}
          />
        ))}

        <div className="loader__brand" ref={brandRef}>
          <h1 className="loader__logo" ref={logoRef}>
            BLOOM
          </h1>

          <span
            className="loader__line"
            ref={lineRef}
          />

          <p
            className="loader__tagline"
            ref={taglineRef}
          >
            flowers, arranged with feeling
          </p>
        </div>
      </div>
    </div>
  )
}

export default Loader