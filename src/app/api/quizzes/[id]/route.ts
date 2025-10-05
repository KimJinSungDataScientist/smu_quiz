import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }){
  const s = getSession()
  if(!s || s.role !== 'ADMIN'){
    return NextResponse.json({ error: 'ADMIN_ONLY' }, { status: 403 })
  }
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: { questions: { include: { options: true, category: true } } }
  })
  if(!quiz) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  return NextResponse.json(quiz)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }){
  const s = getSession()
  if(!s || s.role !== 'ADMIN'){
    return NextResponse.json({ error: 'ADMIN_ONLY' }, { status: 403 })
  }
  await prisma.answer.deleteMany({ where: { question: { quizId: params.id } } }).catch(()=>{})
  await prisma.question.deleteMany({ where: { quizId: params.id } }).catch(()=>{})
  await prisma.quiz.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
