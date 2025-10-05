'use client'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function EditQuiz(){
  const { id } = useParams<{id:string}>()
  const { data: quiz, mutate } = useSWR(`/api/quizzes/${id}`,(u)=>fetch(u).then(r=>r.json()))
  const [csv,setCsv]=useState('')
  const [local,setLocal]=useState<any>(null)

  if(!quiz) return <p>로딩...</p>
  const q = local ?? quiz

  const save = async ()=>{
    const res = await fetch(`/api/quizzes/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title:q.title, description:q.description, questions:q.questions.map((qq:any)=>({ text: qq.text, options: qq.options.map((o:any)=>({ text:o.text, isCorrect:o.isCorrect })) })) }) })
    if(res.ok){ mutate() } else alert('저장 실패')
  }

  const publish = async (isPublished:boolean)=>{
    const res=await fetch(`/api/quizzes/${id}/publish`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isPublished }) })
    if(res.ok){ mutate() } else alert('실패')
  }

  const uploadCsv = async ()=>{
    const res = await fetch(`/api/quizzes/${id}/upload-csv`, { method:'POST', headers:{'Content-Type':'text/csv; charset=utf-8'}, body: csv })
    if(res.ok){ setCsv(''); mutate() } else alert('CSV 업로드 실패')
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <input className="border p-2 rounded w-full" value={q.title} onChange={e=>setLocal({...q, title:e.target.value})}/>
        <input className="border p-2 rounded w-full" value={q.description||''} onChange={e=>setLocal({...q, description:e.target.value})}/>
        <div className="space-y-2">
          <div className="font-semibold">문항</div>
          {q.questions.map((qq:any,idx:number)=> (
            <div key={qq.id||idx} className="border rounded p-2">
              <input className="w-full border p-2 rounded" value={qq.text} onChange={e=>{
                const qs=[...q.questions]; qs[idx]={...qq, text:e.target.value}; setLocal({...q, questions:qs})
              }}/>
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                {qq.options.map((o:any, j:number)=> (
                  <div key={o.id||j} className="flex items-center gap-2">
                    <input className="flex-1 border p-2 rounded" value={o.text} onChange={e=>{ const qs=[...q.questions]; const ops=[...qq.options]; ops[j]={...o, text:e.target.value}; qs[idx]={...qq, options:ops}; setLocal({...q, questions:qs}) }} />
                    <label className="text-sm flex items-center gap-1">
                      <input type="checkbox" checked={!!o.isCorrect} onChange={e=>{ const qs=[...q.questions]; const ops=qq.options.map((x:any,k:number)=>({ ...x, isCorrect: k===j ? e.target.checked : false })); qs[idx]={...qq, options:ops}; setLocal({...q, questions:qs}) }} /> 정답
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={save} className="bg-black text-white px-3 py-2 rounded">저장</button>
          <button onClick={()=>publish(!q.isPublished)} className="ml-2 border px-3 py-2 rounded">{q.isPublished?'비공개로 전환':'공개하기'}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <div className="font-semibold">CSV로 일괄 업로드</div>
        <textarea className="w-full h-40 border p-2 rounded font-mono" value={csv} onChange={e=>setCsv(e.target.value)} placeholder={`question,option1,option2,option3,option4,correct_index\n2+2=?,3,4,5,6,2`}/>
        <button onClick={uploadCsv} className="border px-3 py-2 rounded">업로드</button>
      </div>

      <Grades quizId={id} />
    </div>
  )
}

function Grades({ quizId }:{ quizId: string }){
  const { data } = useSWR(`/api/grades?quizId=${quizId}`,(u)=>fetch(u).then(r=>r.json()))
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">성적</h2>
        <a className="text-blue-600" href={`/api/grades?quizId=${quizId}&csv=1`}>CSV 다운로드</a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm mt-2">
          <thead><tr className="text-left"><th className="p-2">이메일</th><th className="p-2">이름</th><th className="p-2">점수</th><th className="p-2">제출시각</th></tr></thead>
          <tbody>
            {data?.map((s:any)=>(
              <tr key={s.id} className="border-t"><td className="p-2">{s.user.email}</td><td className="p-2">{s.user.name}</td><td className="p-2">{s.score}</td><td className="p-2">{new Date(s.createdAt).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
