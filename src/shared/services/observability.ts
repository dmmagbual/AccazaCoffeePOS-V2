export type LogLevel = 'error' | 'warn' | 'info'

export interface ApplicationLog {
  readonly level: LogLevel
  readonly event: string
  readonly correlationId: string
  readonly occurredAt: string
  readonly context?: Readonly<Record<string, string | number | boolean>>
}

export function createCorrelationId(): string {
  return crypto.randomUUID()
}

export function logApplicationEvent(level: LogLevel, event: string, correlationId = createCorrelationId(), context?: ApplicationLog['context']): string {
  const record: ApplicationLog = { level, event, correlationId, occurredAt: new Date().toISOString(), context }
  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info
  logger(record)
  return correlationId
}
