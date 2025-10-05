
'use client'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())

export default function Practice(){
  const { id } = useParams<{id:string}>()
  const { data } = useSWR(`/api/categories/${id}`, fetcher)
  const router = useRouter()

  // 모든 훅은 컴포넌트 최상단에서 호출 (조기 return 금지)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string,'O'|'X'|undefined>>({})
  const [lastResult, setLastResult] = useState<{ok:boolean, expl:string, correct:'O'|'X'}|null>(null)
  const [saving, setSaving] = useState(false)

  // data가 없을 수도 있으므로 안전하게 접근
  const category = data?.category
  const questions = data?.questions ?? []
  const q:any = questions[idx]

  const correctIsO = q?.options?.find((o:any)=>o.isCorrect)?.text === 'O'
  const onAnswer = (val:'O'|'X')=>{
    if(!q) return
    setAnswers(a=>({ ...a, [q.id]: val }))
    const ok = (correctIsO ? 'O' : 'X') === val
    setLastResult({ ok, expl: q.explanation || '설명 없음', correct: correctIsO ? 'O':'X' })
  }
  const next = ()=>{
    setLastResult(null)
    setIdx(i=>Math.min(i+1, questions.length-1))
  }

  const finished = useMemo(
    ()=> Object.keys(answers).length >= (questions?.length ?? 0),
    [answers, questions?.length]
  )

  const submitAll = async ()=>{
    if(!finished) return alert('모든 문항을 풀어주세요.')
    setSaving(true)
    try{
      const payload = {
        quizId: questions[0].quizId,
        items: questions.map((qq:any)=>({ questionId: qq.id, choice: answers[qq.id] || 'O' }))
      }
      const res = await fetch('/api/submissions',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      if(!res.ok){
        const t = await res.text()
        throw new Error(t || 'SAVE_FAILED')
      }
      const j = await res.json()
      alert(`제출 완료! 점수: ${j.score} / ${questions.length}`)
      router.push('/categories')
    }catch(e:any){
      alert('저장 실패: ' + (e?.message || e))
    }finally{ setSaving(false) }
  }

  return (
    <AuthGuard>
      {!data ? (
        <div className="p-6 text-sm text-gray-500">로딩...</div>
      ) : !q ? (
        <div className="p-6">문항이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">{category?.name}</h1>
          <div className="card space-y-3">
            <div className="text-sm text-gray-500">문항 {idx+1} / {questions.length}</div>
            <div className="font-medium">{q.text}</div>
            {!lastResult ? (
              <div className="flex gap-2">
                <button className="btn flex-1 border" onClick={()=>onAnswer('O')}>O</button>
                <button className="btn flex-1 border" onClick={()=>onAnswer('X')}>X</button>
              </div>
            ) : (
              <div className={`p-3 rounded-xl ${lastResult.ok?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>
                <div className="font-semibold">{lastResult.ok ? '정답 ✅' : '오답 ❌'}</div>
                <div className="text-sm mt-1">정답: {lastResult.correct}</div>
                <div className="text-sm mt-1">설명: {lastResult.expl}</div>
                <div className="flex gap-2">
                  <button className="btn mt-3 flex-1" onClick={next} disabled={idx>=questions.length-1}>
                    {idx>=questions.length-1 ? '마지막 문항' : '다음 문제'}
                  </button>
                  {idx>=questions.length-1 && (
                    <button className="btn-primary mt-3 flex-1" disabled={saving} onClick={submitAll}>
                      {saving ? '저장 중...' : '제출/저장'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
