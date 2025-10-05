'use client'
import useSWR from 'swr'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

const fetcher=(u:string)=>fetch(u).then(r=>r.json())
export default function Categories(){
  const { data } = useSWR('/api/categories', fetcher)
  return (
    <AuthGuard>
      <div className="space-y-3">
        <h1 className="text-xl font-bold">카테고리</h1>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data?.map((c:any)=> (
            <li key={c.id} className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">{c.count} 문항</div>
              </div>
              <Link className="px-4 py-2 rounded-xl bg-black text-white" href={`/practice/${c.id}`}>풀기</Link>
            </li>
          ))}
        </ul>
      </div>
    </AuthGuard>
  )
}
