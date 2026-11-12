/**
 * @param {object} data
 * @param {string} [message]
 */
export function success(data, message = 'OK') {
  return { success: true, data, message }
}

/**
 * @param {string} message
 * @param {Array|undefined} errors
 */
export function fail(message, errors) {
  return { success: false, message, ...(errors ? { errors } : {}) }
}

/**
 * @param {Array} data
 * @param {object} pagination
 */
export function listSuccess(data, pagination, message = 'OK') {
  return { success: true, data, pagination, message }
}
