import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(){
  const rows = await prisma.category.findMany({
    orderBy:{ name:'asc' },
    include: { _count: { select: { questions: true } } }
  })
  return NextResponse.json(rows.map(r=>({
    id:r.id, name:r.name, count:r._count.questions
  })))
}
