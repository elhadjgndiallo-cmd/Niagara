import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { fetchDefaultShop, fetchNearbyShops, fetchShops } from '../../api/shopsApi.js'
import { closeShopPicker, setAllShops, setCurrentShop } from '../../store/shopSlice.js'
import { Spinner } from '../ui/Spinner.jsx'

function normalizeShopForStore(shop) {
  return {
    id: shop._id,
    name: shop.name,
    city: shop.address?.city || '',
    whatsapp: shop.whatsapp?.number || '',
    displayNumber: shop.whatsapp?.displayNumber || '',
    whatsappEnabled: shop.whatsapp?.isEnabled !== false,
  }
}

export function ShopPickerModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [nearbyShops, setNearbyShops] = useState([])
  const [geoStatus, setGeoStatus] = useState('idle')

  const { data: allShops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: fetchShops,
    staleTime: 30 * 60 * 1000,
  })

  useEffect(() => {
    dispatch(setAllShops(allShops))
  }, [allShops, dispatch])

  const displayShops = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return nearbyShops.length ? nearbyShops : allShops
    return allShops.filter((s) => {
      const city = String(s.address?.city || '').toLowerCase()
      const neigh = String(s.address?.neighborhood || '').toLowerCase()
      const name = String(s.name || '').toLowerCase()
      return name.includes(q) || city.includes(q) || neigh.includes(q)
    })
  }, [allShops, nearbyShops, search])

  const groupedShops = useMemo(() => {
    return displayShops.reduce((acc, s) => {
      const key = s.address?.country || 'Autres'
      if (!acc[key]) acc[key] = []
      acc[key].push(s)
      return acc
    }, {})
  }, [displayShops])

  async function handleConfirm() {
    if (!selected) return
    dispatch(setCurrentShop(normalizeShopForStore(selected)))
    if (onClose) onClose()
    else dispatch(closeShopPicker())
  }

  async function handleSkip() {
    let fallback = allShops.find((s) => s.isDefault)
    if (!fallback) {
      try {
        fallback = await fetchDefaultShop()
      } catch {
        fallback = null
      }
    }
    if (fallback) dispatch(setCurrentShop(normalizeShopForStore(fallback)))
    if (onClose) onClose()
    else dispatch(closeShopPicker())
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const shops = await fetchNearbyShops({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            maxKm: 100,
          })
          setNearbyShops(shops)
          if (shops.length) setSelected(shops[0])
          setGeoStatus('success')
        } catch {
          setGeoStatus('error')
        }
      },
      () => setGeoStatus('error'),
      { timeout: 10000, enableHighAccuracy: false },
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex max-h-[72vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
          >
            <div className="border-b px-4 pb-3 pt-4">
              <h2 className="text-xl font-bold text-niagara-text">📍 Choisissez votre boutique</h2>
            </div>

            <div className="border-b bg-blue-50 px-4 py-2.5">
              {geoStatus === 'idle' && (
                <button
                  type="button"
                  onClick={handleGeolocate}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  📡 Me géolocaliser automatiquement
                </button>
              )}
              {geoStatus === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Spinner className="h-4 w-4" />
                </div>
              )}
              {geoStatus === 'success' && nearbyShops.length > 0 && (
                <span className="text-sm font-medium text-green-700" aria-hidden>
                  ✅
                </span>
              )}
            </div>

            <div className="border-b px-4 py-2.5">
              <input
                type="text"
                placeholder="Rechercher une ville, un quartier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-niagara-primary/40"
              />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                Object.entries(groupedShops).map(([country, shops]) => (
                  <div key={country}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-niagara-muted">
                      {country}
                    </p>
                    {shops.map((shop) => (
                      <button
                        type="button"
                        key={shop._id}
                        onClick={() => setSelected(shop)}
                        className={`mb-2 w-full rounded-xl border-2 p-3 text-left transition ${
                          selected?._id === shop._id
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-black/10 hover:border-black/25 hover:bg-niagara-surface'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-niagara-text">{shop.name}</p>
                            <p className="text-sm text-niagara-muted">
                              📍 {shop.address?.neighborhood ? `${shop.address.neighborhood} · ` : ''}
                              {shop.address?.city}
                            </p>
                            {!!shop.openingHours && (
                              <p className="text-xs text-niagara-muted">🕐 {shop.openingHours}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {shop.isDefault && (
                              <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                                Principal
                              </span>
                            )}
                            {typeof shop.distance === 'number' && (
                              <p className="mt-1 text-xs font-medium text-blue-700">
                                {shop.distance < 1
                                  ? `${Math.round(shop.distance * 1000)} m`
                                  : `${shop.distance.toFixed(1)} km`}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
              {!isLoading && displayShops.length === 0 && <div className="py-8" />}
            </div>

            <div className="flex gap-2 border-t px-4 py-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 rounded-xl border border-black/20 py-3 text-sm font-medium text-niagara-muted hover:bg-niagara-surface"
              >
                Je préfère ne pas choisir
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selected}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                  selected
                    ? 'bg-niagara-primary text-white hover:brightness-95'
                    : 'cursor-not-allowed bg-black/10 text-niagara-muted'
                }`}
              >
                Confirmer ce choix
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
