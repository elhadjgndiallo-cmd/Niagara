import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../constants/routes.js'

const STORIES = [
  {
    title: 'Soirée & élégance',
    tag: 'Femme',
    img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    to: ROUTES.category('femme'),
  },
  {
    title: 'Street casual',
    tag: 'Homme',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    to: ROUTES.category('homme'),
  },
  {
    title: 'Mini icons',
    tag: 'Enfant',
    img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    to: ROUTES.category('enfant'),
  },
  {
    title: 'Performance',
    tag: 'Sport',
    img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    to: ROUTES.category('sport'),
  },
  {
    title: 'Accessoires',
    tag: 'Détails',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    to: ROUTES.category('accessoires'),
  },
  {
    title: 'Week-end',
    tag: 'Lifestyle',
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    to: ROUTES.search,
  },
  {
    title: 'Denim mood',
    tag: 'Jeans',
    img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    to: ROUTES.search,
  },
  {
    title: 'Soldes',
    tag: 'Promos',
    img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    to: `${ROUTES.search}?onSale=true`,
  },
]

export function StoriesSection() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-niagara-text">Stories & inspirations</h2>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {STORIES.map((s) => (
            <Link key={s.title} to={s.to} className="group block">
              <motion.div
                className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-niagara-surface shadow-[var(--shadow-card)]"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={s.img}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/50" />
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                    {s.tag}
                  </span>
                  <span className="text-sm font-bold text-white">{s.title}</span>
                  <span className="mt-1 text-xs font-semibold text-white/90">Voir →</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
