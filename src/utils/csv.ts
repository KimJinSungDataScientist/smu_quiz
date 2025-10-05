import { parse } from 'csv-parse/sync'

// 탭(\t), 쉼표(,), 세미콜론(;) 모두 허용 + 한글 헤더 감지
export function parseCategoryCSV(text: string){
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    delimiter: [',', '\t', ';'],
    trim: true
  }) as any[]

  return rows.map(r=>{
    const ansRaw =
      r.answer ?? (r as any).정답 ?? (r as any).ox ?? (r as any).OX ?? (r as any)['O/X'] ?? ''
    const ans = String(ansRaw).trim().toUpperCase()

    const isO = ['O','TRUE','1','Y','YES','맞다','정답','○','ㅇ'].includes(ans)
    const isX = ['X','FALSE','0','N','NO','아니다','오답','✗','×'].includes(ans)
    if(!isO && !isX) throw new Error('answer must be O or X')

    const category =
      String(r.category ?? (r as any).카테고리 ?? (r as any).구분 ?? '기타').trim()
    const textQ =
      String(r.question ?? (r as any).문제 ?? (r as any).문항내용 ?? '').trim()
    const expl =
      String(r.explanation ?? (r as any).설명 ?? (r as any).정답설명 ?? '').trim()

    return {
      category,
      text: textQ,
      explanation: expl,
      correctIsO: isO,
    }
  })
}

// 호환용: 기존 업로드 API가 parseQuizCSV를 import하므로 동일 함수명으로 export
export const parseQuizCSV = parseCategoryCSV
