import { parse } from 'csv-parse/sync'
export function parseCategoryCSV(text: string){
  const rows = parse(text, { columns: true, skip_empty_lines: true }) as any[]
  return rows.map(r=>{
    const ans = String(r.answer||'').trim().toUpperCase()
    const isO = ans === 'O' || ans === 'TRUE' || ans === '1'
    const isX = ans === 'X' || ans === 'FALSE' || ans === '0'
    if(!isO && !isX) throw new Error('answer must be O or X')
    return {
      category: String(r.category||'기타').trim(),
      text: String(r.question||'').trim(),
      explanation: String(r.explanation||'').trim(),
      correctIsO: isO
    }
  })
}
