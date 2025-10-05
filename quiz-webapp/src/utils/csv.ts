import { parse } from 'csv-parse/sync'
export function parseQuizCSV(text: string){
  const records = parse(text, { columns: true, skip_empty_lines: true }) as any[]
  return records.map(r=>({
    text: r.question,
    options: [1,2,3,4].map(i=>({ text: r[`option${i}`], isCorrect: Number(r.correct_index)===i }))
  }))
}
