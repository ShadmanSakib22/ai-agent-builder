import { create } from "zustand";
import type { AgentData, SavedAgent } from "@/types/agent_types";

interface AgentStore {
  // State
  data: AgentData | null;
  loading: boolean;
  error: string | null;
  selectedProfile: string;
  selectedSkills: string[];
  selectedLayers: string[];
  selectedProvider: string;
  agentName: string;
  savedAgents: SavedAgent[];

  // Actions
  setSelectedProfile: (id: string) => void;
  setSelectedSkills: (ids: string[]) => void;
  setSelectedLayers: (ids: string[]) => void;
  setSelectedProvider: (p: string) => void;
  setAgentName: (n: string) => void;
  toggleSkill: (id: string) => void;
  toggleLayer: (id: string) => void;
  saveAgent: () => boolean;
  deleteAgent: (index: number) => void;
  loadAgent: (agent: SavedAgent) => void;
  resetAgent: () => void;
  fetchData: () => Promise<void>;
}

const getInitialSavedAgents = (): SavedAgent[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("savedAgents");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  data: null,
  loading: true,
  error: null,
  selectedProfile: "",
  selectedSkills: [],
  selectedLayers: [],
  selectedProvider: "",
  agentName: "",
  savedAgents: getInitialSavedAgents(),

  // Actions
  setSelectedProfile: (id) => set({ selectedProfile: id }),
  setSelectedSkills: (ids) => set({ selectedSkills: ids }),
  setSelectedLayers: (ids) => set({ selectedLayers: ids }),
  setSelectedProvider: (p) => set({ selectedProvider: p }),
  setAgentName: (n) => set({ agentName: n }),

  toggleSkill: (id) =>
    set((state) => {
      const newSkills = state.selectedSkills.includes(id)
        ? state.selectedSkills.filter((x) => x !== id)
        : [...state.selectedSkills, id];
      return { selectedSkills: newSkills };
    }),

  toggleLayer: (id) =>
    set((state) => {
      const newLayers = state.selectedLayers.includes(id)
        ? state.selectedLayers.filter((x) => x !== id)
        : [...state.selectedLayers, id];
      return { selectedLayers: newLayers };
    }),

  saveAgent: () => {
    const { agentName, selectedProfile, selectedSkills, selectedLayers, selectedProvider, savedAgents } = get();
    if (!agentName.trim()) return false;
    const newAgent: SavedAgent = {
      name: agentName.trim(),
      profileId: selectedProfile,
      skillIds: selectedSkills,
      layerIds: selectedLayers,
      provider: selectedProvider,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedAgents, newAgent];
    localStorage.setItem("savedAgents", JSON.stringify(updated));
    set({ savedAgents: updated });
    return true;
  },

  deleteAgent: (index) =>
    set((state) => {
      const updated = state.savedAgents.filter((_, i) => i !== index);
      localStorage.setItem("savedAgents", JSON.stringify(updated));
      return { savedAgents: updated };
    }),

  loadAgent: (agent) =>
    set({
      selectedProfile: agent.profileId || "",
      selectedSkills: agent.skillIds || [],
      selectedLayers: agent.layerIds || [],
      selectedProvider: agent.provider || "",
      agentName: agent.name,
    }),

  resetAgent: () =>
    set({
      selectedProfile: "",
      selectedSkills: [],
      selectedLayers: [],
      selectedProvider: "",
      agentName: "",
    }),

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/data.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as AgentData;
      set({ data, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load data", loading: false });
    }
  },
}));
