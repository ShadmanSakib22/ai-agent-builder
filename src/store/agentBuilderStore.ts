import { create } from 'zustand';

export interface SavedAgent {
  id: string;
  name: string;
  profileId: string;
  skillIds: string[];
  layerIds: string[];
  providerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface AgentBuilderState {
  selectedProfileId: string | null;
  selectedSkillIds: string[];
  selectedLayerIds: string[];
  selectedProvider: string | null;
  currentStep: number;
  editingModelId: string | null;
  editingModelName: string | null;
  
  // Actions
  setProfile: (profileId: string) => void;
  addSkill: (skillId: string) => void;
  removeSkill: (skillId: string) => void;
  addLayer: (layerId: string) => void;
  removeLayer: (layerId: string) => void;
  setProvider: (provider: string) => void;
  setCurrentStep: (step: number) => void;
  loadFromModel: (model: SavedAgent) => void;
  resetBuilder: () => void;
}

export const useAgentBuilderStore = create<AgentBuilderState>((set) => ({
  selectedProfileId: null,
  selectedSkillIds: [],
  selectedLayerIds: [],
  selectedProvider: null,
  currentStep: 1,
  editingModelId: null,
  editingModelName: null,

  setProfile: (profileId: string) =>
    set({ selectedProfileId: profileId }),

  addSkill: (skillId: string) =>
    set((state) => {
      const newSkills = new Set(state.selectedSkillIds);
      newSkills.add(skillId);
      return { selectedSkillIds: Array.from(newSkills) };
    }),

  removeSkill: (skillId: string) =>
    set((state) => ({
      selectedSkillIds: state.selectedSkillIds.filter((id) => id !== skillId),
    })),

  addLayer: (layerId: string) =>
    set((state) => {
      const newLayers = new Set(state.selectedLayerIds);
      newLayers.add(layerId);
      return { selectedLayerIds: Array.from(newLayers) };
    }),

  removeLayer: (layerId: string) =>
    set((state) => ({
      selectedLayerIds: state.selectedLayerIds.filter((id) => id !== layerId),
    })),

  setProvider: (provider: string) =>
    set({ selectedProvider: provider }),

  setCurrentStep: (step: number) =>
    set({ currentStep: step }),

  loadFromModel: (model: SavedAgent) =>
    set({
      selectedProfileId: model.profileId,
      selectedSkillIds: model.skillIds,
      selectedLayerIds: model.layerIds,
      selectedProvider: model.providerId,
      currentStep: 1,
      editingModelId: model.id,
      editingModelName: model.name,
    }),

  resetBuilder: () =>
    set({
      selectedProfileId: null,
      selectedSkillIds: [],
      selectedLayerIds: [],
      selectedProvider: null,
      currentStep: 1,
      editingModelId: null,
      editingModelName: null,
    }),
}));
