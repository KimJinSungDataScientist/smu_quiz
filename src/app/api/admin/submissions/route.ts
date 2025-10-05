import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status:403 })

  const rows = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      quiz: true
    }
  })

  return NextResponse.json(rows.map(r=>({
    id: r.id,
    when: r.createdAt,
    score: r.score,
    user: { id: r.user.id, name: r.user.name, email: r.user.email },
    quiz: { id: r.quiz.id, title: r.quiz.title }
  })))
}
