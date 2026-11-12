import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../constants/routes.js'

export function CategoryGrid({ categories = [] }) {
  const list = categories.length ? categories : []

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h2 className="text-center text-2xl font-bold text-niagara-text">Parcourir par catégorie</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {list.map((c) => (
          <motion.div key={c._id} whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}>
            <Link
              to={ROUTES.category(c.slug)}
              className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-niagara-dark shadow-[var(--shadow-card)]"
            >
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-niagara-primary to-niagara-secondary opacity-90" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent transition duration-300 group-hover:bg-[#0D7377]/30" />
              <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent pb-4 text-center text-sm font-bold text-white">
                {c.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
