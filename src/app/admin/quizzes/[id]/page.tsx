'use client'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { useState } from 'react'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())

export default function AdminQuizEdit(){
  const { id } = useParams<{id:string}>()
  const { data, mutate } = useSWR(`/api/quizzes/${id}`, fetcher)
  const [csvText, setCsvText] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const [err, setErr] = useState<string|null>(null)

  const onFile = async (f?: File)=>{
    if(!f) return
    const text = await f.text()
    setCsvText(text)
  }

  const upload = async ()=>{
    if(!csvText.trim()) { alert('CSV 내용이 비어있습니다.'); return }
    setBusy(true); setMsg(null); setErr(null)
    try{
      const res = await fetch(`/api/quizzes/${id}/upload-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: csvText
      })
      const bodyText = await res.text()
      let j:any = null
      try{ j = JSON.parse(bodyText) } catch {}
      if(!res.ok){
        const detail = j?.detail || bodyText || 'UNKNOWN'
        throw new Error(detail)
      }
      setMsg('업로드 완료! 문항/카테고리가 갱신되었습니다.')
      await mutate()
    }catch(e:any){
      setErr('업로드 실패: ' + (e?.message || e))
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">퀴즈 CSV 업로드</h1>
      {data ? (
        <div className="text-sm text-gray-600">
          <div>퀴즈: <b>{data.title}</b></div>
          <div>현재 문항 수: {data.questions?.length ?? 0}</div>
        </div>
      ) : <div className="text-sm text-gray-500">퀴즈 정보를 불러오는 중...</div>}

      <div className="card space-y-3">
        <div className="text-sm">CSV 업로드 (.csv / 엑셀에서 복붙도 가능)</div>
        <input type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={e=>onFile(e.target.files?.[0])} />
        <textarea
          className="w-full h-56 border rounded-xl p-3 font-mono text-sm"
          value={csvText}
          onChange={e=>setCsvText(e.target.value)}
          placeholder="category,question,answer,explanation ... 또는 탭/세미콜론 구분도 가능"
        />
        <div className="flex gap-2 items-center">
          <button className="btn-primary" disabled={busy} onClick={upload}>{busy?'업로드 중...':'업로드'}</button>
          {msg && <div className="text-sm text-green-700">{msg}</div>}
          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
        <div className="text-xs text-gray-500">
          포맷: <code>category,question,answer(O/X),explanation</code> — 엑셀에서 그대로 붙여넣기(탭)도 지원합니다.
        </div>
      </div>

      {data?.questions?.length ? (
        <div className="card">
          <div className="font-semibold mb-2">미리보기(상위 10개)</div>
          <ul className="text-sm space-y-1 max-h-64 overflow-auto">
            {data.questions.slice(0,10).map((q:any)=>(
              <li key={q.id}>• {q.text} <span className="text-gray-500">/ 카테고리: {q.category?.name ?? '-'}</span></li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
