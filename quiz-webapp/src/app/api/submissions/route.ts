import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(){
  const s = getSession()
  if(!s) return NextResponse.json({ error:'UNAUTHORIZED' }, { status: 401 })
  const subs = await prisma.submission.findMany({ where: { userId: s.id }, include: { quiz: true } })
  return NextResponse.json(subs)
}

export async function POST(req: Request){
  const s = getSession()
  if(!s) return NextResponse.json({ error:'UNAUTHORIZED' }, { status: 401 })
  const { quizId, answers } = await req.json() as { quizId: string, answers: { questionId: string, optionId: string }[] }
  const q = await prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: { include: { options: true } } } })
  if(!q || (!q.isPublished && s.role!=='ADMIN')) return NextResponse.json({ error:'FORBIDDEN' }, { status: 403 })
  let score = 0
  const correct = new Map<string,string>()
  q.questions.forEach(qq=>{
    const c = qq.options.find(o=>o.isCorrect)
    if(c) correct.set(qq.id, c.id)
  })
  for(const a of answers){ if(correct.get(a.questionId) === a.optionId) score++ }

  const sub = await prisma.submission.create({ data: {
    quizId, userId: s.id, score,
    answers: { create: answers.map(a=>({ questionId: a.questionId, optionId: a.optionId })) }
  }})
  return NextResponse.json({ submissionId: sub.id, score, total: q.questions.length })
}
