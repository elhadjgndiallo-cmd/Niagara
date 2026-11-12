import { Link } from 'react-router-dom'
import { CountdownTimer } from '../ui/CountdownTimer.jsx'
import { ProductCard } from '../product/ProductCard.jsx'
import { ROUTES } from '../../constants/routes.js'

/**
 * @param {{ bannerText?: string, endDate?: string|Date, products?: object[] }} props
 */
export function FlashSaleSection({ bannerText = 'VENTE FLASH', endDate, products = [] }) {
  if (!endDate) return null

  const list = products.slice(0, 4)
  if (!list.length) return null

  return (
    <section className="border-b border-red-100 bg-gradient-to-b from-red-50/80 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-red-600 md:text-3xl">
              ⚡ {bannerText}
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <CountdownTimer endDate={endDate} size="lg" />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to={`${ROUTES.search}?flashSale=true`}
            className="text-sm font-bold text-niagara-primary underline-offset-4 hover:underline"
          >
            Voir toutes les offres flash →
          </Link>
        </div>
      </div>
    </section>
  )
}
