import { create } from 'zustand'

interface CreateProjectState {
  isOpen: boolean
  defaultTeamId: string | null
  open: (teamId?: string) => void
  close: () => void
}

export const useCreateProject = create<CreateProjectState>((set) => ({
  isOpen: false,
  defaultTeamId: null,
  open: (teamId) => set({ isOpen: true, defaultTeamId: teamId ?? null }),
  close: () => set({ isOpen: false, defaultTeamId: null }),
}))
