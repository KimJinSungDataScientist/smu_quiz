'use client'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TakeQuiz(){
  const { id } = useParams<{id:string}>()
  const { data: quiz } = useSWR(`/api/quizzes/${id}`, (u)=>fetch(u).then(r=>r.json()))
  const r = useRouter()
  const [answers, setAnswers] = useState<Record<string,string>>({})
  if(!quiz) return <p>로딩...</p>

  const submit = async ()=>{
    const payload = { quizId: id, answers: Object.entries(answers).map(([questionId, optionId])=>({ questionId, optionId })) }
    const res = await fetch('/api/submissions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const j = await res.json(); if(res.ok){ alert(`점수: ${j.score}/${j.total}`); r.push('/results') } else { alert(j.error||'제출 실패') }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{quiz.title}</h1>
      {quiz.questions.map((q:any)=> (
        <div key={q.id} className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold">{q.text}</p>
          <div className="mt-2 space-y-1">
            {q.options.map((o:any)=> (
              <label key={o.id} className="flex items-center gap-2">
                <input type="radio" name={q.id} value={o.id} onChange={()=>setAnswers(a=>({ ...a, [q.id]: o.id }))} checked={answers[q.id]===o.id} />
                <span>{o.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={submit} className="bg-black text-white px-4 py-2 rounded">제출</button>
    </div>
  )
}
