'use client'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { useState } from 'react'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())
export default function Practice(){
  const { id } = useParams<{id:string}>()
  const { data } = useSWR(`/api/categories/${id}`, fetcher)
  const [answers, setAnswers] = useState<Record<string,'O'|'X'|null>>({})
  if(!data) return <p>로딩...</p>
  const { category, questions } = data
  const onAnswer = (qid:string, val:'O'|'X', correctIsO:boolean, explanation:string)=>{
    setAnswers(a=>({ ...a, [qid]: val }))
    const correct = correctIsO ? 'O':'X'
    const ok = correct === val
    alert(`${ok ? '정답 ✅' : '오답 ❌'}\n설명: ${explanation||'설명 없음'}`)
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{category.name}</h1>
      {questions.map((q:any)=>{
        const correctIsO = q.options.find((o:any)=>o.isCorrect)?.text === 'O'
        return (
          <div key={q.id} className="bg-white rounded-2xl shadow p-4 space-y-2">
            <div className="font-medium">{q.text}</div>
            <div className="flex gap-2">
              <button className={"px-4 py-2 rounded-xl flex-1 " + (answers[q.id]==='O'?'bg-green-600 text-white':'border')} onClick={()=>onAnswer(q.id,'O',correctIsO,q.explanation)}>O</button>
              <button className={"px-4 py-2 rounded-xl flex-1 " + (answers[q.id]==='X'?'bg-red-600 text-white':'border')} onClick={()=>onAnswer(q.id,'X',correctIsO,q.explanation)}>X</button>
            </div>
            {answers[q.id] && (
              <div className="text-sm text-gray-700">
                선택: {answers[q.id]} • 정답: {correctIsO?'O':'X'}<br/>
                {q.explanation ? `설명: ${q.explanation}` : '설명 없음'}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
