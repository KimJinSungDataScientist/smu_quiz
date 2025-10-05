import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: { id: string }}){
  const s = getSession()
  const q = await prisma.quiz.findUnique({ where: { id: params.id }, include: { questions: { include: { options: true } } } })
  if(!q) return NextResponse.json({ error:'NOT_FOUND' }, { status: 404 })
  if(!q.isPublished && s?.role !== 'ADMIN') return NextResponse.json({ error:'FORBIDDEN' }, { status: 403 })
  return NextResponse.json(q)
}

export async function PUT(req: Request, { params }: { params: { id: string }}){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const body = await req.json()
  const { title, description, questions } = body
  const up = await prisma.quiz.update({
    where: { id: params.id },
    data: {
      title, description,
      questions: { deleteMany: {}, create: questions.map((q:any)=>({
        text: q.text,
        options: { create: q.options.map((o:any)=>({ text: o.text, isCorrect: !!o.isCorrect })) }
      }))}
    },
    include: { questions: { include: { options: true } } }
  })
  return NextResponse.json(up)
}

export async function DELETE(_: Request, { params }: { params: { id: string }}){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  await prisma.quiz.delete({ where: { id: params.id } })
  return NextResponse.json({ ok:true })
}
