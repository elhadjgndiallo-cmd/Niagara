import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'

export function Footer() {
  return (
    <footer className="mt-16 bg-niagara-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-lg font-bold text-niagara-secondary">NIAGARA</p>
          <p className="mt-2 text-sm text-white/70">
            Mode &amp; lifestyle. Livraison offerte dès 50 €, retours 30 jours.
          </p>
        </div>
        <div>
          <p className="font-semibold">Boutique</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <Link to={ROUTES.category('femme')} className="hover:text-niagara-secondary">
                Femme
              </Link>
            </li>
            <li>
              <Link to={ROUTES.category('homme')} className="hover:text-niagara-secondary">
                Homme
              </Link>
            </li>
            <li>
              <Link to={ROUTES.category('enfant')} className="hover:text-niagara-secondary">
                Enfant
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Aide</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <span className="cursor-default">Livraison &amp; retours</span>
            </li>
            <li>
              <span className="cursor-default">Paiement sécurisé</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Newsletter</p>
          <p className="mt-2 text-sm text-white/70">Bientôt : offres exclusives.</p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="Votre e-mail"
              className="flex-1 rounded-[var(--radius-btn)] border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder:text-white/40"
              disabled
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} NIAGARA — Tous droits réservés.
      </div>
    </footer>
  )
}
