import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'
import { Outlet } from 'react-router-dom'
import { CommandMenu } from './command-menu'
import { DashboardSidebar } from './dashboard-sidebar'

function DashboardLayoutContent() {
  const { handleMouseDown, handleClick } = useSidebar()

  return (
    <div className="bg-sidebar flex h-screen">
      <DashboardSidebar />

      <div
        className="group relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-end"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div className="group-hover:bg-primary/40 h-full max-h-[calc(100%-2rem)] w-0.5 rounded-full transition-colors" />
      </div>

      <main className="bg-background border-border m-2 ml-0 min-h-0 flex-1 overflow-auto rounded-lg border">
        <Outlet />
      </main>

      <CommandMenu />
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardLayoutContent />
    </SidebarProvider>
  )
}
