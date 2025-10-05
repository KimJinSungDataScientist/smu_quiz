import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sign } from '@/lib/jwt'

export async function POST(req: Request){
  try{
    const { code } = await req.json()
    if(!code) return NextResponse.json({ error:'CODE_REQUIRED' }, { status:400 })
    const now = new Date()
    const row = await prisma.studentAccessCode.findUnique({ where: { code } })
    if(!row) return NextResponse.json({ error:'INVALID_CODE' }, { status:401 })
    if(row.expiresAt < now) return NextResponse.json({ error:'EXPIRED_CODE' }, { status:401 })
    let userId = row.userId
    if(!userId){
      const email = `${code}@code.local`
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: row.studentName || '학생', passwordHash: 'code-login', role: 'STUDENT' }
      })
      userId = user.id
      await prisma.studentAccessCode.update({ where: { id: row.id }, data: { userId } })
    }
    const user = await prisma.user.findUnique({ where: { id: userId! } })
    const token = sign({ id: user!.id, role: user!.role as any, name: user!.name, email: user!.email })
    const res = NextResponse.json({ ok:true })
    res.cookies.set('session', token, { httpOnly:true, sameSite:'lax', path:'/', secure:true, maxAge: 60*60*24*30 })
    return res
  }catch(e:any){
    return NextResponse.json({ error:'LOGIN_CODE_INTERNAL', detail:String(e?.message||e) }, { status:500 })
  }
}
