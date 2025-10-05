import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { compare } from '@/lib/auth'
import { sign } from '@/lib/jwt'

export async function POST(req: Request){
  const { email, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  if(!user || !compare(password, user.passwordHash)){
    return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }
  const token = sign({ id: user.id, role: user.role, name: user.name, email: user.email })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, { httpOnly: true, sameSite: 'lax', path: '/', secure: true, maxAge: 60*60*24*7 })
  return res
}
