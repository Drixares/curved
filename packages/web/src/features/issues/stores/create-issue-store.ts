import { create } from 'zustand'

interface CreateIssueState {
  isOpen: boolean
  defaultTeamId: string | null
  open: (teamId?: string) => void
  close: () => void
}

export const useCreateIssue = create<CreateIssueState>((set) => ({
  isOpen: false,
  defaultTeamId: null,
  open: (teamId) => set({ isOpen: true, defaultTeamId: teamId ?? null }),
  close: () => set({ isOpen: false, defaultTeamId: null }),
}))
