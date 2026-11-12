import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button.jsx'
import { ROUTES } from '../../constants/routes.js'

const slides = [
  {
    title: 'Nouvelle saison',
    cta: 'Découvrir les nouveautés',
    to: ROUTES.category('femme'),
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
  },
  {
    title: 'Street & confort',
    cta: 'Voir la collection',
    to: ROUTES.category('homme'),
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=80',
  },
  {
    title: 'Petits explorateurs',
    cta: 'Shopper',
    to: ROUTES.category('enfant'),
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&q=80',
  },
]

export function HeroCarousel() {
  const [i, setI] = useState(0)
  const [pause, setPause] = useState(false)

  useEffect(() => {
    if (pause) return undefined
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [pause])

  const slide = slides[i]

  return (
    <section
      className="relative h-[min(70vh,520px)] overflow-hidden bg-niagara-dark"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-niagara-dark/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 lg:px-8">
        <motion.h1
          key={slide.title + 'h'}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-lg text-4xl font-bold text-white md:text-5xl"
        >
          {slide.title}
        </motion.h1>
        <div className="mt-6">
          <Link to={slide.to}>
            <Button variant="primary" className="!bg-niagara-secondary !text-white hover:!opacity-95">
              {slide.cta}
            </Button>
          </Link>
        </div>
        <div className="mt-8 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 w-2 rounded-full transition ${idx === i ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
