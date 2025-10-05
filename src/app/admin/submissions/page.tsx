'use client'
import useSWR from 'swr'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())

export default function AdminSubmissions(){
  const { data } = useSWR('/api/admin/submissions', fetcher)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">성적/제출 내역</h1>
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">일시</th>
              <th className="p-2">학생</th>
              <th className="p-2">이메일</th>
              <th className="p-2">퀴즈</th>
              <th className="p-2">점수</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r:any)=>(
              <tr key={r.id} className="border-t">
                <td className="p-2">{new Date(r.when).toLocaleString()}</td>
                <td className="p-2">{r.user.name}</td>
                <td className="p-2">{r.user.email}</td>
                <td className="p-2">{r.quiz.title}</td>
                <td className="p-2 font-semibold">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
