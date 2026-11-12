import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { ProductCard } from '../product/ProductCard.jsx'
import { Button } from '../ui/Button.jsx'
import { ROUTES } from '../../constants/routes.js'
import 'swiper/css'

/**
 * @param {{ products?: object[] }} props
 */
export function NewArrivalsSwiper({ products = [] }) {
  const list = products.slice(0, 12)
  if (!list.length) return null

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-niagara-text">Nouveautés NIAGARA</h2>
          </div>
          <Link to={ROUTES.category('femme')}>
            <Button variant="outline">Tout voir →</Button>
          </Link>
        </div>

        <div className="mt-8">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            loop={list.length > 4}
            autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            className="!pb-2"
          >
            {list.map((p) => (
              <SwiperSlide key={p._id} className="!h-auto">
                <div className="h-full">
                  <ProductCard product={p} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
