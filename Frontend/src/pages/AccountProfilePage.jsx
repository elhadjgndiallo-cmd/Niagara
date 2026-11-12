import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from '../api/authApi.js'
import { getStoredToken } from '../api/axiosInstance.js'
import { updatePassword, updateProfile, uploadAvatar } from '../api/userApi.js'
import { Button } from '../components/ui/Button.jsx'
import { setCredentials } from '../store/authSlice.js'

const inputClass =
  'mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2'

export default function AccountProfilePage() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [defaultSize, setDefaultSize] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarErr, setAvatarErr] = useState('')
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName || '')
    setLastName(user.lastName || '')
    setNewsletter(Boolean(user.preferences?.newsletter))
    setDefaultSize(user.preferences?.defaultSize || '')
  }, [user])

  async function onSaveProfile(e) {
    e.preventDefault()
    setProfileErr('')
    setProfileMsg('')
    setSavingProfile(true)
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferences: {
          newsletter,
          defaultSize: defaultSize.trim(),
        },
      })
      const me = await fetchMe()
      dispatch(setCredentials({ user: me, accessToken: getStoredToken() }))
      setProfileMsg('Profil enregistré.')
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Enregistrement impossible.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function onChangePassword(e) {
    e.preventDefault()
    setPwdErr('')
    setPwdMsg('')
    if (newPassword.length < 8) {
      setPwdErr('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdErr('La confirmation ne correspond pas.')
      return
    }
    setSavingPwd(true)
    try {
      await updatePassword({ currentPassword, newPassword })
      setPwdMsg('Mot de passe modifié. Vous pouvez continuer avec le nouveau.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwdErr(err.response?.data?.message || 'Modification impossible.')
    } finally {
      setSavingPwd(false)
    }
  }

  async function onPickAvatar(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarErr('Veuillez choisir un fichier image.')
      return
    }
    setAvatarErr('')
    setAvatarBusy(true)
    try {
      await uploadAvatar(file)
      const me = await fetchMe()
      dispatch(setCredentials({ user: me, accessToken: getStoredToken() }))
    } catch (err) {
      setAvatarErr(err.message || 'Envoi impossible (vérifiez Cloudinary côté serveur).')
    } finally {
      setAvatarBusy(false)
    }
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-bold text-niagara-text">Photo de profil</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-niagara-surface text-2xl text-niagara-muted">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-semibold uppercase text-niagara-muted">
                {user?.firstName?.[0] || user?.email?.[0] || '?'}
              </span>
            )}
          </div>
          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onPickAvatar}
            />
            <Button
              type="button"
              variant="outline"
              disabled={avatarBusy}
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarBusy ? 'Envoi…' : 'Choisir une image'}
            </Button>
            {avatarErr && <p className="mt-2 text-sm text-red-600">{avatarErr}</p>}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 pt-10">
        <h2 className="text-lg font-bold text-niagara-text">Informations personnelles</h2>
        <form onSubmit={onSaveProfile} className="mt-6 max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-niagara-text">Prénom</label>
            <input
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Nom</label>
            <input
              className={inputClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">
              Taille habituelle (optionnel)
            </label>
            <input
              className={inputClass}
              value={defaultSize}
              onChange={(e) => setDefaultSize(e.target.value)}
              placeholder="ex. M, 40, 38"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <span>Je souhaite recevoir la newsletter NIAGARA</span>
          </label>
          {profileErr && <p className="text-sm text-red-600">{profileErr}</p>}
          {profileMsg && <p className="text-sm text-green-700">{profileMsg}</p>}
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </form>
      </section>

      <section className="border-t border-black/10 pt-10">
        <h2 className="text-lg font-bold text-niagara-text">Mot de passe</h2>
        <form onSubmit={onChangePassword} className="mt-6 max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-niagara-text">Mot de passe actuel</label>
            <input
              type="password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Nouveau mot de passe</label>
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Confirmer</label>
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {pwdErr && <p className="text-sm text-red-600">{pwdErr}</p>}
          {pwdMsg && <p className="text-sm text-green-700">{pwdMsg}</p>}
          <Button type="submit" disabled={savingPwd}>
            {savingPwd ? 'Mise à jour…' : 'Changer le mot de passe'}
          </Button>
        </form>
      </section>
    </div>
  )
}
