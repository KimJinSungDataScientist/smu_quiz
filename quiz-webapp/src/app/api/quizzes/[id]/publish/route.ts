import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: { id: string }}){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const { isPublished } = await req.json()
  const q = await prisma.quiz.update({ where: { id: params.id }, data: { isPublished: !!isPublished } })
  return NextResponse.json(q)
}
