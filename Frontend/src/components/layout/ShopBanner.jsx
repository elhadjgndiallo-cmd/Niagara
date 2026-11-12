import { useDispatch } from 'react-redux'
import { openShopPicker } from '../../store/shopSlice.js'

export function ShopBanner({ shop }) {
  const dispatch = useDispatch()
  if (!shop) return null

  return (
    <div className="bg-teal-700 px-4 py-2 text-xs text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 lg:px-4">
        <span className="truncate">
          📍 <strong>{shop.name}</strong>
          {shop.city ? ` — ${shop.city}` : ''}
        </span>
        <button
          type="button"
          onClick={() => dispatch(openShopPicker())}
          className="shrink-0 underline opacity-90 hover:opacity-100"
        >
          Changer →
        </button>
      </div>
    </div>
  )
}
