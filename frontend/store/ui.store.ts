import { create } from "zustand";
import { Task } from "@/lib/types";

type ViewMode = "list" | "board";

interface UIState {
  viewMode: ViewMode;
  sidebarOpen: boolean;
  taskModalOpen: boolean;
  editingTask: Task | null;
  searchQuery: string;
  selectedStatus: string;
  selectedPriority: string;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openTaskModal: (task?: Task) => void;
  closeTaskModal: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: string) => void;
  setSelectedPriority: (priority: string) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: "list",
  sidebarOpen: false,
  taskModalOpen: false,
  editingTask: null,
  searchQuery: "",
  selectedStatus: "",
  selectedPriority: "",

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openTaskModal: (task) =>
    set({ taskModalOpen: true, editingTask: task ?? null }),

  closeTaskModal: () => set({ taskModalOpen: false, editingTask: null }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedStatus: (status) => set({ selectedStatus: status }),

  setSelectedPriority: (priority) => set({ selectedPriority: priority }),

  clearFilters: () =>
    set({ searchQuery: "", selectedStatus: "", selectedPriority: "" }),
}));
