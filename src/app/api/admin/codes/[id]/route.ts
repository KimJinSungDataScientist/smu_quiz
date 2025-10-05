import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const s = getSession()
  if (!s || s.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ADMIN_ONLY' }, { status: 403 })
  }
  await prisma.studentAccessCode.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
