'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage(){
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e:any)=>{
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
    if(res.ok){ r.push('/') } else { const j=await res.json(); setError(j.error||'로그인 실패') }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      <form onSubmit={submit} className="space-y-3 bg-white rounded-xl shadow p-4">
        <input className="w-full border p-2 rounded" placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="비밀번호" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-black text-white py-2 rounded">로그인</button>
      </form>
      <p className="text-sm text-gray-600 mt-3">초기 관리자 계정은 seed로 생성됩니다.</p>
    </div>
  )
}
