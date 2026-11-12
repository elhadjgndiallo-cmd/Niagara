const LABELS = ['Livraison', 'WhatsApp', 'Confirmation']

export function CheckoutStepper({ activeIndex }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 md:gap-6">
      {LABELS.map((label, i) => {
        const done = i < activeIndex
        const current = i === activeIndex
        return (
          <li key={label} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? 'bg-niagara-primary text-white'
                  : current
                    ? 'bg-niagara-secondary text-white ring-2 ring-niagara-primary/30'
                    : 'bg-niagara-surface text-niagara-muted'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span
              className={
                current ? 'font-semibold text-niagara-text' : 'text-niagara-muted'
              }
            >
              {label}
            </span>
            {i < LABELS.length - 1 && (
              <span className="hidden text-niagara-muted md:inline">→</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
