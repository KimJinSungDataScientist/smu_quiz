import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateStudentCode } from '@/utils/code'

export async function GET(){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const rows = await prisma.studentAccessCode.findMany({ orderBy:{ createdAt:'desc' } })
  return NextResponse.json(rows)
}

export async function POST(req: Request){
  const s = getSession()
  if(!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status: 403 })
  const { studentName, daysValid } = await req.json()
  const code = generateStudentCode(8)
  const expiresAt = new Date(Date.now() + (Number(daysValid||7) * 24*60*60*1000))
  const row = await prisma.studentAccessCode.create({ data: { code, studentName: studentName||null, expiresAt } })
  return NextResponse.json(row)
}
