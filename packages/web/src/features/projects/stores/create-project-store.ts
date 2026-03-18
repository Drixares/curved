import { create } from 'zustand'

interface CreateProjectState {
  isOpen: boolean
  defaultTeamId: string | null
  onCreated: ((projectId: string) => void) | null
  open: (teamId?: string, onCreated?: (projectId: string) => void) => void
  close: () => void
}

export const useCreateProject = create<CreateProjectState>((set) => ({
  isOpen: false,
  defaultTeamId: null,
  onCreated: null,
  open: (teamId, onCreated) =>
    set({ isOpen: true, defaultTeamId: teamId ?? null, onCreated: onCreated ?? null }),
  close: () => set({ isOpen: false, defaultTeamId: null, onCreated: null }),
}))
