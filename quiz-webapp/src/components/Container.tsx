import { ReactNode } from 'react'
export default function Container({ children }: { children: ReactNode }) {
  return <div className="bg-white rounded-xl shadow p-4">{children}</div>
}
