import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroCarousel } from '../components/home/HeroCarousel.jsx'
import { ProductGrid } from '../components/product/ProductGrid.jsx'
import { ProductCard } from '../components/product/ProductCard.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ROUTES } from '../constants/routes.js'
import {
  fetchFeatured,
  fetchNewArrivals,
  fetchOnSale,
  fetchFlashSale,
  fetchBestsellers,
} from '../api/productApi.js'
import { fetchCategories } from '../api/categoryApi.js'
import { useShopSettings } from '../hooks/useShopSettings.js'
import { FlashSaleSection } from '../components/home/FlashSaleSection.jsx'
import { CategoryGrid } from '../components/home/CategoryGrid.jsx'
import { NewArrivalsSwiper } from '../components/home/NewArrivalsSwiper.jsx'
import { StoriesSection } from '../components/home/StoriesSection.jsx'
import { BrandsMarquee } from '../components/home/BrandsMarquee.jsx'

export default function Home() {
  const { data: settings } = useShopSettings()
  const [featured, setFeatured] = useState([])
  const [newIn, setNewIn] = useState([])
  const [sale, setSale] = useState([])
  const [flashProducts, setFlashProducts] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)

  const flashGlobal = settings?.flashSale
  const showFlashBlock =
    flashGlobal?.isActive && flashGlobal?.endDate && new Date(flashGlobal.endDate) > new Date()

  useEffect(() => {
    let ok = true
    ;(async () => {
      try {
        const [f, n, s, flash, best, cats] = await Promise.all([
          fetchFeatured(),
          fetchNewArrivals(),
          fetchOnSale(),
          fetchFlashSale(),
          fetchBestsellers(),
          fetchCategories(),
        ])
        if (!ok) return
        setFeatured(Array.isArray(f) ? f : [])
        setNewIn(Array.isArray(n) ? n : [])
        setSale(Array.isArray(s) ? s.slice(0, 12) : [])
        setFlashProducts(Array.isArray(flash) ? flash : [])
        setBestsellers(Array.isArray(best) ? best : [])
        setParents((cats || []).filter((c) => !c.parent))
      } catch {
        if (ok) {
          setFeatured([])
          setNewIn([])
          setSale([])
          setFlashProducts([])
          setBestsellers([])
        }
      } finally {
        if (ok) setLoading(false)
      }
    })()
    return () => {
      ok = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  return (
    <>
      <HeroCarousel />

      {showFlashBlock && flashProducts.length > 0 && (
        <FlashSaleSection
          bannerText={flashGlobal.bannerText || 'VENTE FLASH'}
          endDate={flashGlobal.endDate}
          products={flashProducts}
        />
      )}

      <CategoryGrid categories={parents} />

      <NewArrivalsSwiper products={newIn} />

      <StoriesSection />

      <section className="bg-niagara-primary py-10 text-center text-white">
        <h2 className="text-2xl font-bold">SOLDES — Jusqu&apos;à -60 %</h2>
        <Link to={`${ROUTES.search}?onSale=true`} className="mt-6 inline-block">
          <Button variant="accent">Profiter de l&apos;offre</Button>
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h2 className="text-2xl font-bold text-niagara-text">Meilleures ventes</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {bestsellers.slice(0, 8).map((p, idx) => (
            <ProductCard key={p._id} product={p} bestsellerRank={idx === 0 ? 1 : undefined} />
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-niagara-text">En promotion</h2>
          <div className="mt-8">
            <ProductGrid products={sale} />
          </div>
        </div>
      </section>

      <section className="bg-niagara-surface py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-niagara-text">Coup de cœur</h2>
          <div className="mt-8">
            <ProductGrid products={featured.slice(0, 12)} />
          </div>
        </div>
      </section>

      <BrandsMarquee />
    </>
  )
}
