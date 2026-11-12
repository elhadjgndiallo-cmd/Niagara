import { useState, useEffect } from 'react'

/**
 * @param {string|Date} endDate
 * @param {'lg'|'sm'} [size]
 */
export function CountdownTimer({ endDate, size = 'lg' }) {
  const [t, setT] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    const tick = () => {
      const d = new Date(endDate) - Date.now()
      if (d <= 0) {
        setT({ h: '00', m: '00', s: '00' })
        return
      }
      setT({
        h: String(Math.floor(d / 3600000)).padStart(2, '0'),
        m: String(Math.floor((d % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((d % 60000) / 1000)).padStart(2, '0'),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endDate])

  const sz =
    size === 'lg' ? 'text-3xl min-w-[3.5rem] h-16' : 'text-xl min-w-[2.75rem] h-12'

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {[
        ['h', 'H'],
        ['m', 'M'],
        ['s', 'S'],
      ].map(([k, l]) => (
        <div key={k} className="flex flex-col items-center gap-1">
          <span
            className={`flex items-center justify-center rounded-lg bg-gray-900 font-mono font-bold text-white ${sz}`}
          >
            {t[k]}
          </span>
          <span className="text-[10px] font-medium text-gray-500 sm:text-xs">{l}</span>
        </div>
      ))}
    </div>
  )
}
