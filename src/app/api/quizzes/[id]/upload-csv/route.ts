import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { parseQuizCSV } from '@/utils/csv'

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const s = getSession()
  if (!s || s.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ADMIN_ONLY' }, { status: 403 })
  }

  const text = await req.text()
  const rows = parseQuizCSV(text) as {
    category: string
    text: string
    explanation?: string
    correctIsO: boolean
  }[]

  await prisma.$transaction(async (tx) => {
    await tx.answer.deleteMany({ where: { question: { quizId: params.id } } }).catch(() => {})
    await tx.question.deleteMany({ where: { quizId: params.id } })

    for (const q of rows) {
      let categoryId: string | undefined
      if (q.category && q.category.trim().length > 0) {
        const cat = await tx.category.upsert({
          where: { name: q.category.trim() },
          update: {},
          create: { name: q.category.trim() },
        })
        categoryId = cat.id
      }

      await tx.question.create({
        data: {
          quizId: params.id,
          text: q.text,
          explanation: q.explanation || null,
          ...(categoryId ? { categoryId } : {}),
          options: {
            create: [
              { text: 'O', isCorrect: q.correctIsO },
              { text: 'X', isCorrect: !q.correctIsO },
            ],
          },
        },
      })
    }
  })

  const updated = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: { questions: { include: { options: true } } },
  })
  return NextResponse.json(updated)
}
