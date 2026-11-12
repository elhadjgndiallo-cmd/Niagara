import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../../constants/routes.js'
import { Spinner } from '../ui/Spinner.jsx'

export function ProtectedRoute({ children }) {
  const location = useLocation()
  const user = useSelector((s) => s.auth.user)
  const status = useSelector((s) => s.auth.status)
  const token = useSelector((s) => s.auth.accessToken)

  const bootstrapping = Boolean(token && !user && (status === 'idle' || status === 'loading'))

  if (status === 'loading' || bootstrapping) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return children
}
