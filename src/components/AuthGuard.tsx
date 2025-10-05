'use client'
import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }:{ children: ReactNode }){
  const [ok, setOk] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(()=>{
    let alive = true
    fetch('/api/me')
      .then(r=>r.json())
      .then(me=>{
        if(!alive) return
        if(!me?.email){ router.replace('/code-login'); setOk(false) }
        else setOk(true)
      })
      .catch(()=>{ if(alive){ router.replace('/code-login'); setOk(false) } })
    return ()=>{ alive = false }
  },[router])

  if(ok === null) return <div className="p-6 text-sm text-gray-500">확인 중...</div>
  if(ok === false) return null
  return <>{children}</>
}
