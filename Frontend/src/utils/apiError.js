/**
 * Extrait un message d'erreur lisible depuis une erreur Axios.
 * @param {unknown} err
 * @param {string} [fallback]
 */
export function getApiErrorMessage(err, fallback = 'Une erreur est survenue.') {
  if (!err) return fallback
  if (typeof err === 'string') return err
  const axiosMsg = err?.response?.data?.message
  if (axiosMsg) return axiosMsg
  if (err?.message) return err.message
  return fallback
}
