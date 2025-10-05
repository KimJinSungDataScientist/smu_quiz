import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: Request){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const quizId = searchParams.get('quizId')!
  const exportCsv = searchParams.get('csv') === '1'
  const subs = await prisma.submission.findMany({ where: { quizId }, include: { user: true, quiz: true }, orderBy: { createdAt: 'desc' } })

  if(!exportCsv){ return NextResponse.json(subs) }

  const rows = [ ['email','name','score','submittedAt'] ].concat(subs.map(s=>[s.user.email, s.user.name, String(s.score), s.createdAt.toISOString()]))
  const text = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  return new NextResponse(text, { headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="grades.csv"' } })
}
