export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-semibold transition duration-200 ease-in-out disabled:opacity-50'
  const variants = {
    primary: 'bg-niagara-primary text-white hover:bg-niagara-secondary shadow-[var(--shadow-card)]',
    outline:
      'border-2 border-niagara-primary text-niagara-primary bg-transparent hover:bg-niagara-surface',
    ghost: 'text-niagara-text hover:bg-niagara-surface',
    accent: 'bg-niagara-accent text-white hover:opacity-90',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
