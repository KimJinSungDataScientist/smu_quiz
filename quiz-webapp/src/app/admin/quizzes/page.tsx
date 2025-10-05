'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())
export default function AdminQuizzes(){
  const { data, mutate } = useSWR('/api/quizzes', fetcher)
  const [title,setTitle]=useState('')
  const [desc,setDesc]=useState('')
  const create=async()=>{
    const res=await fetch('/api/quizzes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description:desc})})
    if(res.ok){ setTitle('');setDesc(''); mutate() } else alert('생성 실패')
  }
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <h2 className="font-semibold">새 퀴즈</h2>
        <input className="border p-2 rounded w-full" placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)}/>
        <input className="border p-2 rounded w-full" placeholder="설명" value={desc} onChange={e=>setDesc(e.target.value)}/>
        <button onClick={create} className="bg-black text-white px-3 py-2 rounded">생성</button>
      </div>

      <ul className="grid md:grid-cols-2 gap-3">
        {data?.map((q:any)=> (
          <li key={q.id} className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold">{q.title}</div>
            <div className="text-sm text-gray-600">{q.description}</div>
            <div className="flex gap-3 mt-2">
              <Link className="text-blue-600" href={`/admin/quizzes/${q.id}`}>편집</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
