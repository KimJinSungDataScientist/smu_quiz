import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { parseQuizCSV } from '@/utils/csv'

export async function POST(req: Request, { params }: { params: { id: string }}){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const text = await req.text()
  const questions = parseQuizCSV(text)
  await prisma.question.deleteMany({ where: { quizId: params.id } })
  for(const q of questions){
    await prisma.question.create({ data: { quizId: params.id, text: q.text, options: { create: q.options } } })
  }
  const updated = await prisma.quiz.findUnique({ where: { id: params.id }, include: { questions: { include: { options: true } } } })
  return NextResponse.json(updated)
}
