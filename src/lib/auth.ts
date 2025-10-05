import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { verify } from '@/lib/jwt'

export const hash = (s: string) => bcrypt.hashSync(s, 10)
export const compare = (p: string, h: string) => bcrypt.compareSync(p, h)

export function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verify(token)
}
