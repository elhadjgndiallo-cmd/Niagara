import { useQuery } from '@tanstack/react-query'
import { fetchShopSettings } from '../api/settingsApi.js'

export function useShopSettings() {
  return useQuery({
    queryKey: ['shopSettings'],
    queryFn: fetchShopSettings,
    staleTime: 1000 * 60 * 10,
  })
}
