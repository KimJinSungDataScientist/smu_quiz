import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateStudentCode } from '@/utils/code'

function randomLocalEmail() {
  const s = Math.random().toString(36).slice(2, 10)
  return `student-${s}@code.local`
}

export async function GET() {
  const s = getSession()
  if (!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status:403 })
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { createdAt: 'desc' },
    include: { codes: true },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const s = getSession()
  if (!s || s.role !== 'ADMIN') return NextResponse.json({ error:'ADMIN_ONLY' }, { status:403 })

  const { name, email, daysValid = 7 } = await req.json()
  const user = await prisma.user.create({
    data: {
      email: email?.trim() || randomLocalEmail(),
      name: name?.trim() || '학생',
      passwordHash: 'code-login',
      role: 'STUDENT',
    }
  })

  const code = generateStudentCode(8)
  const expiresAt = new Date(Date.now() + Number(daysValid) * 24 * 60 * 60 * 1000)
  const row = await prisma.studentAccessCode.create({
    data: { code, expiresAt, userId: user.id, studentName: user.name }
  })

  return NextResponse.json({ user, code: row.code, expiresAt: row.expiresAt })
}
