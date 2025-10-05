import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Item = { questionId: string, choice: 'O'|'X' }

export async function POST(req: Request){
  const s = getSession()
  if(!s) return NextResponse.json({ error:'UNAUTHENTICATED' }, { status:401 })

  const { quizId, items } = await req.json() as { quizId: string, items: Item[] }
  if(!quizId || !Array.isArray(items) || items.length === 0){
    return NextResponse.json({ error:'INVALID_PAYLOAD' }, { status:400 })
  }

  // fetch questions & options
  const questions = await prisma.question.findMany({
    where: { quizId, id: { in: items.map(i=>i.questionId) } },
    include: { options: true }
  })
  if(questions.length !== items.length){
    return NextResponse.json({ error:'MISSING_QUESTIONS' }, { status:400 })
  }

  let score = 0
  const answerCreates: any[] = []
  for(const q of questions){
    const picked = items.find(i=>i.questionId === q.id)!
    const chosen = q.options.find(o=>o.text === picked.choice)
    const correct = q.options.find(o=>o.isCorrect)
    if(!chosen || !correct){
      return NextResponse.json({ error:'INVALID_OPTIONS' }, { status:400 })
    }
    if(chosen.id === correct.id) score += 1
    answerCreates.push({ questionId: q.id, optionId: chosen.id })
  }

  const sub = await prisma.submission.create({
    data: {
      quizId,
      userId: s.id,
      score,
      answers: { create: answerCreates }
    }
  })

  return NextResponse.json({ id: sub.id, score })
}
