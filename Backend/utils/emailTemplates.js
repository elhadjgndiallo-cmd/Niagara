/**
 * Corps HTML minimal pour e-mails transactionnels NIAGARA.
 */
export function verifyEmailHtml(link) {
  return `
    <h1>NIAGARA</h1>
    <p>Confirmez votre adresse e-mail :</p>
    <p><a href="${link}">Vérifier mon e-mail</a></p>
  `
}

export function resetPasswordHtml(link) {
  return `
    <h1>NIAGARA</h1>
    <p>Réinitialisation du mot de passe :</p>
    <p><a href="${link}">Choisir un nouveau mot de passe</a></p>
    <p>Ce lien expire sous 1 heure.</p>
  `
}
