import { NextRequest, NextResponse } from 'next/server'

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get('session')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
