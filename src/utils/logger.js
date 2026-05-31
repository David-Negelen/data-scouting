const MAX = 200
const entries = []
const subscribers = new Set()

const notify = () => subscribers.forEach((fn) => fn([...entries]))

export const log = (message, data) => {
  const entry = {
    id: Date.now() + Math.random(),
    ts: new Date().toISOString().slice(11, 23),
    level: 'info',
    message: typeof message === 'string' ? message : JSON.stringify(message),
    data: data !== undefined ? data : undefined,
  }
  entries.push(entry)
  if (entries.length > MAX) entries.shift()
  console.log(`[LOG] ${entry.ts} ${entry.message}`, data ?? '')
  notify()
}

export const logError = (message, data) => {
  const entry = {
    id: Date.now() + Math.random(),
    ts: new Date().toISOString().slice(11, 23),
    level: 'error',
    message: typeof message === 'string' ? message : String(message),
    data: data !== undefined ? data : undefined,
  }
  entries.push(entry)
  if (entries.length > MAX) entries.shift()
  console.error(`[ERR] ${entry.ts} ${entry.message}`, data ?? '')
  notify()
}

export const clearLog = () => {
  entries.length = 0
  notify()
}

export const subscribe = (fn) => {
  subscribers.add(fn)
  fn([...entries])
  return () => subscribers.delete(fn)
}
