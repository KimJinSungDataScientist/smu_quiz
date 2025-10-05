import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(){
  const s = getSession()
  const where = s?.role === 'ADMIN' ? {} : { isPublished: true }
  const quizzes = await prisma.quiz.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(quizzes)
}

export async function POST(req: Request){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const { title, description } = await req.json()
  const quiz = await prisma.quiz.create({ data: { title, description, authorId: s.id } })
  return NextResponse.json(quiz)
}
