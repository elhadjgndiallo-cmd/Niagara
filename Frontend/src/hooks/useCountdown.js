import { useState, useEffect } from 'react'

/**
 * @param {string|Date} endDate
 * @returns {{ h: string, m: string, s: string, isExpired: boolean }}
 */
export function useCountdown(endDate) {
  const [state, setState] = useState({
    h: '00',
    m: '00',
    s: '00',
    isExpired: false,
  })

  useEffect(() => {
    const tick = () => {
      const d = new Date(endDate) - Date.now()
      if (d <= 0) {
        setState({ h: '00', m: '00', s: '00', isExpired: true })
        return
      }
      setState({
        h: String(Math.floor(d / 3600000)).padStart(2, '0'),
        m: String(Math.floor((d % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((d % 60000) / 1000)).padStart(2, '0'),
        isExpired: false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endDate])

  return state
}
