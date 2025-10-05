import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1) })

export async function POST(req: Request){
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if(!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const { email, password, name } = parsed.data
  const exists = await prisma.user.findUnique({ where:{ email } })
  if(exists) return NextResponse.json({ error: '이미 가입된 이메일' }, { status: 409 })
  const u = await prisma.user.create({ data: { email, name, passwordHash: hash(password), role: 'STUDENT' } })
  return NextResponse.json({ id: u.id, email: u.email })
}
