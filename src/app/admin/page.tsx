'use client'
import Link from 'next/link'

export default function AdminHome(){
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">관리자</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/admin/codes" className="block p-4 rounded-2xl shadow bg-white hover:bg-gray-50">
          <div className="font-semibold">학생 코드 발급/관리</div>
          <div className="text-sm text-gray-600 mt-1">코드 생성, 유효기간 설정, 삭제(회수)</div>
        </Link>
        <Link href="/admin/submissions" className="block p-4 rounded-2xl shadow bg-white hover:bg-gray-50">
          <div className="font-semibold">성적 보기</div>
          <div className="text-sm text-gray-600 mt-1">학생 제출 내역 및 점수</div>
        </Link>
        <Link href="/categories" className="block p-4 rounded-2xl shadow bg-white hover:bg-gray-50">
          <div className="font-semibold">카테고리로 풀기</div>
          <div className="text-sm text-gray-600 mt-1">학생용 진입</div>
        </Link>
      </div>
    </div>
  )
}
