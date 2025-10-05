export function generateStudentCode(len = 8){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for(let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)]
  return s
}
