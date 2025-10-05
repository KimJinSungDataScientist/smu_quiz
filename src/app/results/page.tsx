'use client'
import useSWR from 'swr'
const fetcher = (u:string)=>fetch(u).then(r=>r.json())
export default function Results(){
  const { data } = useSWR('/api/submissions', fetcher)
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">내 제출</h1>
      <ul className="space-y-2">
        {data?.map((s:any)=>(
          <li key={s.id} className="bg-white rounded-xl shadow p-3">
            <div className="font-medium">{s.quiz.title}</div>
            <div className="text-sm text-gray-600">점수: {s.score} | {new Date(s.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
