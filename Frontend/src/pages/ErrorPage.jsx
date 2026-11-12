import { Link, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../constants/routes.js'
import { Button } from '../components/ui/Button.jsx'

export default function ErrorPage() {
  const [params] = useSearchParams()
  const msg = params.get('message') || 'Une erreur est survenue.'

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-niagara-text">Oups</h1>
      <p className="mt-3 text-niagara-muted">{msg}</p>
      <Link to={ROUTES.home} className="mt-8">
        <Button type="button">Retour à l&apos;accueil</Button>
      </Link>
    </div>
  )
}
