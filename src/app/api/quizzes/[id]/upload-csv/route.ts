import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { parseCategoryCSV } from '@/utils/csv'

export async function POST(req: Request, { params }: { params: { id: string }}){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const text = await req.text()
  const items = parseCategoryCSV(text)

  const byCat = new Map<string, any[]>()
  items.forEach(i=>{ const arr = byCat.get(i.category) || []; arr.push(i); byCat.set(i.category, arr) })

  for(const [catName, arr] of byCat){
    const cat = await prisma.category.upsert({ where: { name: catName }, update: {}, create: { name: catName } })
    await prisma.question.deleteMany({ where: { quizId: params.id, categoryId: cat.id } })
    for(const r of arr){
      await prisma.question.create({ data: {
        quizId: params.id,
        categoryId: cat.id,
        text: r.text,
        explanation: r.explanation || null,
        options: { create: [{ text:'O', isCorrect: !!r.correctIsO }, { text:'X', isCorrect: !r.correctIsO }] }
      }})
    }
  }

  const updated = await prisma.quiz.findUnique({ where: { id: params.id }, include: { questions: { include: { options: true } } } })
  return NextResponse.json(updated)
}
