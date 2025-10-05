'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [me, setMe] = useState<any>(null)
  useEffect(()=>{ fetch('/api/me').then(r=>r.json()).then(setMe).catch(()=>{}) },[])
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-3">
        <Link href="/" className="font-semibold">Quiz Webapp</Link>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/quizzes">퀴즈 목록</Link>
          {me?.role === 'ADMIN' && <Link href="/admin">관리자</Link>}
          {me?.email ? (
            <Link href="/logout">로그아웃</Link>
          ) : (
            <Link href="/login">로그인</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
