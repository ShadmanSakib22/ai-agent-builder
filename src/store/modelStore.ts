import { create } from 'zustand';
import { SavedAgent } from './agentBuilderStore';

export interface ModelStoreState {
  models: SavedAgent[];
  recentModels: SavedAgent[];
  
  // Actions
  loadModelsFromStorage: () => void;
  saveModel: (model: Omit<SavedAgent, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateModel: (id: string, updates: Partial<SavedAgent>) => void;
  deleteModel: (id: string) => void;
  getRecentModels: (limit: number) => SavedAgent[];
}

const STORAGE_KEY = 'ai_agent_models';

export const useModelStore = create<ModelStoreState>((set, get) => ({
  models: [],
  recentModels: [],

  loadModelsFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const models = stored ? JSON.parse(stored) : [];
      
      // Sort by updatedAt in descending order and get first 3 for recent
      const sortedModels = [...models].sort((a: SavedAgent, b: SavedAgent) => b.updatedAt - a.updatedAt);
      const recent = sortedModels.slice(0, 3);
      
      set({ models, recentModels: recent });
    } catch (error) {
      console.error('[v0] Error loading models from storage:', error);
      set({ models: [], recentModels: [] });
    }
  },

  saveModel: (model: Omit<SavedAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const models = get().models;
      const newModel: SavedAgent = {
        ...model,
        id: `agent_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const updatedModels = [...models, newModel];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedModels));
      
      // Update state with new models
      const sortedModels = [...updatedModels].sort((a, b) => b.updatedAt - a.updatedAt);
      const recent = sortedModels.slice(0, 3);
      
      set({ models: updatedModels, recentModels: recent });
      return newModel.id;
    } catch (error) {
      console.error('[v0] Error saving model:', error);
      throw error;
    }
  },

  updateModel: (id: string, updates: Partial<SavedAgent>) => {
    try {
      const models = get().models;
      const updatedModels = models.map((model) =>
        model.id === id
          ? {
              ...model,
              ...updates,
              updatedAt: Date.now(),
              id: model.id, // preserve original ID
              createdAt: model.createdAt, // preserve original creation date
            }
          : model
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedModels));
      
      // Update state with recent models
      const sortedModels = [...updatedModels].sort((a, b) => b.updatedAt - a.updatedAt);
      const recent = sortedModels.slice(0, 3);
      
      set({ models: updatedModels, recentModels: recent });
    } catch (error) {
      console.error('[v0] Error updating model:', error);
      throw error;
    }
  },

  deleteModel: (id: string) => {
    try {
      const models = get().models.filter((model) => model.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
      
      // Update state with recent models
      const sortedModels = [...models].sort((a, b) => b.updatedAt - a.updatedAt);
      const recent = sortedModels.slice(0, 3);
      
      set({ models, recentModels: recent });
    } catch (error) {
      console.error('[v0] Error deleting model:', error);
      throw error;
    }
  },

  getRecentModels: (limit: number = 3) => {
    return get().recentModels.slice(0, limit);
  },
}));

// Initialize store on app load
if (typeof window !== 'undefined') {
  useModelStore.getState().loadModelsFromStorage();
}
