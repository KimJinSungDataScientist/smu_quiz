import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(_: Request, { params }: { params: { id: string } }){
  const category = await prisma.category.findUnique({ where: { id: params.id } })
  if(!category) return NextResponse.json({ error:'NOT_FOUND' }, { status:404 })
  const questions = await prisma.question.findMany({
    where: { categoryId: params.id },
    include: { options: true }
  })
  return NextResponse.json({ category, questions })
}
