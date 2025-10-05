'use client'
import useSWR from 'swr'
import { useState } from 'react'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())

export default function Codes(){
  const { data, mutate } = useSWR('/api/admin/codes', fetcher)

  // 기존: 코드만 발급
  const [name,setName]=useState('')
  const [days,setDays]=useState(7)

  // 신규: 학생 계정 + 코드 한번에
  const [sName,setSName]=useState('')
  const [sEmail,setSEmail]=useState('')
  const [sDays,setSDays]=useState(7)
  const [createdInfo,setCreatedInfo]=useState<any>(null)

  const issue=async()=>{
    const res=await fetch('/api/admin/codes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:name, daysValid:days})})
    if(res.ok){ setName(''); setDays(7); mutate() } else alert('발급 실패')
  }
  const del=async(id:string)=>{
    if(!confirm('정말 삭제(회수)할까요?')) return
    const res=await fetch(`/api/admin/codes/${id}`,{method:'DELETE'})
    if(res.ok) mutate(); else alert('삭제 실패')
  }
  const copy=(t:string)=>navigator.clipboard.writeText(t).then(()=>alert('복사됨'))

  const createStudentAndCode = async()=>{
    const res = await fetch('/api/admin/students',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: sName, email: sEmail, daysValid: sDays })
    })
    if(res.ok){
      const j = await res.json()
      setCreatedInfo(j)
      setSName(''); setSEmail(''); setSDays(7)
      mutate()
    } else {
      const t = await res.text(); alert('생성 실패: ' + t)
    }
  }

  return (
    <div className="space-y-6">
      {/* 학생 계정 + 코드 한번에 */}
      <div className="card space-y-2">
        <h2 className="font-semibold">학생 계정 + 코드 생성</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className="input" placeholder="이름(선택)" value={sName} onChange={e=>setSName(e.target.value)} />
          <input className="input" placeholder="이메일(선택)" value={sEmail} onChange={e=>setSEmail(e.target.value)} />
          <input className="input" type="number" min={1} value={sDays} onChange={e=>setSDays(Number(e.target.value))} placeholder="유효기간(일)"/>
        </div>
        <button className="btn-primary" onClick={createStudentAndCode}>생성</button>
        {createdInfo && (
          <div className="text-sm text-green-700">
            생성 완료: {createdInfo.user.email} / 코드 <b className="font-mono">{createdInfo.code}</b> (만료 {new Date(createdInfo.expiresAt).toLocaleDateString()})
          </div>
        )}
      </div>

      {/* 기존: 코드만 발급 */}
      <div className="card space-y-2">
        <h2 className="font-semibold">학생 코드 발급(기존)</h2>
        <label className="label">학생 이름(선택)</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="홍길동"/>
        <label className="label">유효기간(일)</label>
        <input className="input" type="number" min={1} value={days} onChange={e=>setDays(Number(e.target.value))}/>
        <button className="btn-primary" onClick={issue}>발급</button>
      </div>

      {/* 목록 + 삭제 */}
      <div className="card">
        <h3 className="font-semibold mb-2">발급 내역</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left">
              <th className="p-2">코드</th><th className="p-2">학생명</th><th className="p-2">만료</th>
              <th className="p-2">바인딩 사용자</th><th className="p-2">복사</th><th className="p-2">삭제</th>
            </tr></thead>
            <tbody>
            {data?.map((r:any)=>(
              <tr key={r.id} className="border-t">
                <td className="p-2 font-mono">{r.code}</td>
                <td className="p-2">{r.studentName||'-'}</td>
                <td className="p-2">{new Date(r.expiresAt).toLocaleDateString()}</td>
                <td className="p-2">{r.userId? '사용중':'-'}</td>
                <td className="p-2"><button className="btn" onClick={()=>copy(r.code)}>복사</button></td>
                <td className="p-2"><button className="btn" onClick={()=>del(r.id)}>삭제</button></td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
