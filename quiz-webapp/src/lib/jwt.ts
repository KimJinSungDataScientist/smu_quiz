import crypto from 'crypto'

const secret = process.env.JWT_SECRET!
export type SessionPayload = { id: string; role: 'ADMIN'|'STUDENT'; name: string; email: string; exp: number }

function base64url(input: Buffer | string) {
  return Buffer.from(input as any).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
}

export function sign(payload: Omit<SessionPayload,'exp'>, ttlSec = 60*60*24*7) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Math.floor(Date.now()/1000) + ttlSec
  const body = { ...payload, exp }
  const seg1 = base64url(JSON.stringify(header))
  const seg2 = base64url(JSON.stringify(body))
  const data = `${seg1}.${seg2}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  return `${data}.${sig}`
}

export function verify(token: string): SessionPayload | null {
  try {
    const [seg1, seg2, sig] = token.split('.')
    const data = `${seg1}.${seg2}`
    const expected = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
    if (sig !== expected) return null
    const payload = JSON.parse(Buffer.from(seg2, 'base64').toString()) as SessionPayload
    if (payload.exp < Math.floor(Date.now()/1000)) return null
    return payload
  } catch { return null }
}
