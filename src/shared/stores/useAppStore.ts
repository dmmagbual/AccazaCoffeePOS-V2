import { create } from 'zustand'
type AppState = { branchName: string; sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }
export const useAppStore = create<AppState>((set) => ({ branchName: 'Accaza Coffee House', sidebarOpen: false, setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }) }))
