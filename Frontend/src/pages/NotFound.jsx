import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes.js'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-niagara-text">404</h1>
      <Link
        to={ROUTES.home}
        className="mt-8 rounded-[var(--radius-btn)] bg-niagara-primary px-6 py-3 text-sm font-semibold text-white hover:bg-niagara-secondary"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
