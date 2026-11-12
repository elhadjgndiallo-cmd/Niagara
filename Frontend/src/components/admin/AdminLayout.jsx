import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminSidebar } from './AdminSidebar.jsx'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      <Toaster position="top-center" />
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
