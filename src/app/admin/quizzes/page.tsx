'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())

export default function AdminQuizzes(){
  const { data, mutate } = useSWR('/api/quizzes', fetcher)
  const [title,setTitle]=useState('')
  const [desc,setDesc]=useState('')
  const [err,setErr]=useState<string|null>(null)
  const create=async()=>{
    setErr(null)
    if(!title.trim()) return alert('제목을 입력하세요.')
    const res=await fetch('/api/quizzes',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({title,description:desc})
    })
    if(res.ok){
      setTitle('');setDesc(''); mutate()
    } else {
      let msg = res.status + ' '
      try{
        const j = await res.json()
        msg += (j.error || '') + (j.detail ? (' - ' + j.detail) : '')
      }catch{}
      setErr('생성 실패: ' + msg)
      alert('생성 실패: ' + msg)
    }
  }
  const removeQuiz = async (id:string)=>{
    if(!confirm('해당 퀴즈를 삭제할까요? (복구 불가)')) return
    const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' })
    if(res.ok) mutate(); else alert('삭제 실패')
  }
  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h2 className="font-semibold">새 퀴즈</h2>
        <input className="input" placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)}/>
        <input className="input" placeholder="설명" value={desc} onChange={e=>setDesc(e.target.value)}/>
        <button onClick={create} className="btn-primary">생성</button>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data?.map((q:any)=> (
          <li key={q.id} className="card">
            <div className="font-semibold">{q.title}</div>
            <div className="text-sm text-gray-600">{q.description}</div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link className="text-blue-600 underline" href={`/admin/quizzes/${q.id}`}>CSV 업로드/편집</Link>
              <button className="text-red-600" onClick={()=>removeQuiz(q.id)}>삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
