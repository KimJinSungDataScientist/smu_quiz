'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CodeLogin(){
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try{
      const res = await fetch('/api/auth/login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })
      if(!res.ok){
        const j = await res.json().catch(()=>({error:'LOGIN_FAILED'}))
        throw new Error(j.error || 'LOGIN_FAILED')
      }
      // 로그인 성공 → 메인이나 카테고리로
      router.push('/categories')
      router.refresh()
    }catch(err:any){
      setError(err?.message || 'LOGIN_FAILED')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-xl font-bold">학생 코드 로그인</h1>
      <p className="text-sm text-gray-600 mt-1">관리자로부터 받은 8자리 코드를 입력하세요.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          className="w-full border rounded-xl px-4 py-3 font-mono tracking-widest text-center text-lg"
          placeholder="ABCDEFG1"
          value={code}
          onChange={e=>setCode(e.target.value)}
          maxLength={16}
          required
        />
        {error && <div className="text-sm text-red-600">에러: {error === 'INVALID_CODE' ? '잘못된 코드입니다.' : error === 'EXPIRED_CODE' ? '만료된 코드입니다.' : '로그인에 실패했습니다.'}</div>}
        <button
          type="submit"
          disabled={loading || code.trim().length < 6}
          className="w-full rounded-xl px-4 py-3 bg-black text-white disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
