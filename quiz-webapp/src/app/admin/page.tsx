'use client'
import Link from 'next/link'
import useSWR from 'swr'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())
export default function AdminHome(){
  const { data: me } = useSWR('/api/me', fetcher)
  if(!me?.role) return <p>접근 불가: 관리자만</p>
  if(me.role!=='ADMIN') return <p>접근 불가: 관리자만</p>
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">관리자</h1>
      <ul className="list-disc ml-5">
        <li><Link className="text-blue-600" href="/admin/quizzes">퀴즈 관리</Link></li>
      </ul>
    </div>
  )
}
