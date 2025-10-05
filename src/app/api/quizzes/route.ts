import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try{
    const s = getSession()
    if(!s || s.role !== 'ADMIN'){
      return NextResponse.json({ error: 'ADMIN_ONLY' }, { status: 403 })
    }
    const rows = await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, createdAt: true }
    })
    return NextResponse.json(rows)
  }catch(e:any){
    return NextResponse.json({ error: 'SERVER_ERROR', detail: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try{
    const s = getSession()
    if(!s || s.role !== 'ADMIN'){
      return NextResponse.json({ error: 'ADMIN_ONLY' }, { status: 403 })
    }
    const body = await req.json().catch(()=>null)
    const title = String(body?.title ?? '').trim()
    const description = String(body?.description ?? '')
    if(!title) return NextResponse.json({ error: 'TITLE_REQUIRED' }, { status: 400 })

    // Prisma 스키마상 Quiz.author(필수) 관계가 있는 경우를 지원
    // 세션에 userId가 있으면 id로 연결, 없으면 email로 연결 시도
    const data:any = { title, description }
    if('userId' in s && s.userId){
      data.author = { connect: { id: s.userId as string } }
    } else if ('email' in s && s.email){
      data.author = { connect: { email: s.email as string } }
    }

    const q = await prisma.quiz.create({ data })
    return NextResponse.json(q, { status: 201 })
  }catch(e:any){
    // author가 필수인데 연결이 실패한 경우 자세한 안내
    return NextResponse.json({ error: 'SERVER_ERROR', detail: String(e?.message || e) }, { status: 500 })
  }
}
