import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
export async function GET(){
  const s = getSession()
  if(!s) return NextResponse.json({})
  return NextResponse.json(s)
}
