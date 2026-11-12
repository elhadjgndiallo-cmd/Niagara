import nodemailer from 'nodemailer'
import { logger } from './logger.js'

/**
 * Envoie un e-mail SMTP. En dev sans creds, log uniquement.
 * @param {{ to: string, subject: string, html: string }} opts
 */
export async function sendMail({ to, subject, html }) {
  const host = process.env.EMAIL_HOST
  const port = Number(process.env.EMAIL_PORT) || 587
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!host || !user || !pass) {
    logger.warn(`[email dev] À: ${to} | ${subject}`)
    return { skipped: true }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: `"NIAGARA" <${user}>`,
    to,
    subject,
    html,
  })
  return { sent: true }
}
