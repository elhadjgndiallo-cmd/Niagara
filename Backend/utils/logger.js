import winston from 'winston'

const isProd = process.env.NODE_ENV === 'production'

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`,
    ),
  ),
  transports: [new winston.transports.Console()],
})
