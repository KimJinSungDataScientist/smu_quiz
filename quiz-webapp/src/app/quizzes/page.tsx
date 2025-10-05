'use client'
import useSWR from 'swr'
import Link from 'next/link'
const fetcher = (url:string)=>fetch(url).then(r=>r.json())
export default function QuizList(){
  const { data } = useSWR('/api/quizzes', fetcher)
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">퀴즈 목록</h1>
      <ul className="grid md:grid-cols-2 gap-3">
        {data?.map((q:any)=> (
          <li key={q.id} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold">{q.title}</h3>
            <p className="text-sm text-gray-600">{q.description}</p>
            <Link href={`/quiz/${q.id}`} className="inline-block mt-2 text-blue-600">응시하기</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
