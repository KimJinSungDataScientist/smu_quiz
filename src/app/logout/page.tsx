'use client'
import { useEffect } from 'react'

export default function Logout(){
  useEffect(()=>{ fetch('/api/auth/logout', { method:'POST' }).then(()=>location.href='/') },[])
  return <p>로그아웃 중...</p>
}
