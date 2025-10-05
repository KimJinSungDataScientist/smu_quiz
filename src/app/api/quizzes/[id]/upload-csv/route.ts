import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { parseQuizCSV } from '@/utils/csv'

// 대용량 CSV에서도 타임아웃 없이 안전하게 동작하도록
// 1) 기존 데이터 삭제만 짧은 트랜잭션으로 처리
// 2) 행 삽입은 트랜잭션 없이 순차/청크 처리 (Neon, pgbouncer 친화적)
// 3) 카테고리 upsert는 실패하면 생략 (fail-soft)

export async function POST(req: Request, { params }: { params: { id: string }}){
  const s = getSession()
  if(!s || s.role !== 'ADMIN'){
    return NextResponse.json({ error: 'ADMIN_ONLY' }, { status: 403 })
  }

  try{
    const text = await req.text()
    const rows = parseQuizCSV(text) as {
      category: string
      text: string
      explanation?: string
      correctIsO: boolean
    }[]

    // 1) 기존 데이터 삭제만 짧게 트랜잭션으로 처리
    await prisma.$transaction(async (tx)=>{
      await tx.answer.deleteMany({ where: { question: { quizId: params.id } } })
      await tx.question.deleteMany({ where: { quizId: params.id } })
    }, { timeout: 10_000 }) // 10초

    // 2) 질문/옵션 생성은 트랜잭션 없이 순차/청크 처리
    //    (Neon serverless + pgbouncer 환경에서 긴 트랜잭션을 피한다)
    const CHUNK = 50
    for(let i=0; i<rows.length; i+=CHUNK){
      const slice = rows.slice(i, i+CHUNK)

      for(let j=0; j<slice.length; j++){
        const r = slice[j]
        let categoryId: string | undefined = undefined

        // 카테고리 upsert (name이 unique가 아니면 실패할 수 있음 → 그러면 생략)
        try{
          const name = (r.category || '').trim()
          if(name){
            const cat = await prisma.category.upsert({
              where: { name },
              update: {},
              create: { name }
            })
            categoryId = cat.id
          }
        }catch{ categoryId = undefined }

        try{
          const q = await prisma.question.create({
            data: {
              quizId: params.id,
              text: r.text,
              explanation: r.explanation || null,
              ...(categoryId ? { categoryId } : {}),
            }
          })
          await prisma.option.createMany({
            data: [
              { questionId: q.id, text: 'O', isCorrect: r.correctIsO },
              { questionId: q.id, text: 'X', isCorrect: !r.correctIsO },
            ]
          })
        }catch(e:any){
          throw new Error(`QUESTION_CREATE_FAILED at row ${i + j + 1}: ${e?.message || e}`)
        }
      }
    }

    const updated = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: { include: { options: true, category: true } } }
    })
    return NextResponse.json(updated)
  }catch(e:any){
    return NextResponse.json(
      { error: 'UPLOAD_FAILED', detail: String(e?.message || e) },
      { status: 500 }
    )
  }
}
