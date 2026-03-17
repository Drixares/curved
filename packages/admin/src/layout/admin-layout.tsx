import { Outlet } from 'react-router-dom'
import { Separator } from '@curved/ui'
import { Shield } from 'lucide-react'
import { SidebarNav } from './sidebar-nav'
import { ThemeToggle } from './theme-toggle'
import { UserProfile } from './user-profile'

export default function AdminLayout() {
  return (
    <div className="bg-background flex min-h-screen">
      <aside className="border-border flex w-56 flex-col border-r">
        <div className="flex h-14 items-center gap-2 px-4">
          <Shield className="text-primary h-5 w-5" />
          <span className="text-sm font-semibold">Curved Admin</span>
        </div>
        <Separator />
        <SidebarNav />
        <div className="space-y-2 p-3">
          <ThemeToggle />
          <Separator />
          <UserProfile />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
