import { create } from "zustand";

export interface ApiKeyEntry {
  key: string;
  isValid: boolean | null;
  isValidating: boolean;
}

interface ApiKeyStore {
  keys: Record<string, ApiKeyEntry>;
  defaultProvider: string;
  defaultModel: string;
  setApiKey: (provider: string, key: string) => void;
  removeApiKey: (provider: string) => void;
  setValidating: (provider: string, validating: boolean) => void;
  setValid: (provider: string, valid: boolean) => void;
  setDefaultProvider: (provider: string) => void;
  setDefaultModel: (model: string) => void;
  getApiKey: (provider: string) => string;
}

const getInitialState = () => {
  if (typeof window === "undefined") {
    return { keys: {}, defaultProvider: "ChatGPT", defaultModel: "" };
  }
  const saved = localStorage.getItem("apiKeys");
  const savedDefaults = localStorage.getItem("apiDefaults");
  return {
    keys: saved ? JSON.parse(saved) : {},
    ...(savedDefaults ? JSON.parse(savedDefaults) : { defaultProvider: "ChatGPT", defaultModel: "" }),
  };
};

export const useApiKeyStore = create<ApiKeyStore>((set, get) => ({
  ...getInitialState(),

  setApiKey: (provider, key) => {
    set((state) => {
      const updated = {
        ...state.keys,
        [provider]: { key, isValid: null, isValidating: false },
      };
      localStorage.setItem("apiKeys", JSON.stringify(updated));
      return { keys: updated };
    });
  },

  removeApiKey: (provider) => {
    set((state) => {
      const updated = { ...state.keys };
      delete updated[provider];
      localStorage.setItem("apiKeys", JSON.stringify(updated));
      return { keys: updated };
    });
  },

  setValidating: (provider, validating) => {
    set((state) => ({
      keys: {
        ...state.keys,
        [provider]: {
          ...state.keys[provider],
          key: state.keys[provider]?.key ?? "",
          isValid: state.keys[provider]?.isValid ?? null,
          isValidating: validating,
        },
      },
    }));
  },

  setValid: (provider, valid) => {
    set((state) => ({
      keys: {
        ...state.keys,
        [provider]: {
          ...state.keys[provider],
          key: state.keys[provider]?.key ?? "",
          isValid: valid,
          isValidating: false,
        },
      },
    }));
  },

  setDefaultProvider: (provider) => {
    set((state) => {
      const updated = { defaultProvider: provider, defaultModel: state.defaultModel };
      localStorage.setItem("apiDefaults", JSON.stringify(updated));
      return updated;
    });
  },

  setDefaultModel: (model) => {
    set((state) => {
      const updated = { defaultProvider: state.defaultProvider, defaultModel: model };
      localStorage.setItem("apiDefaults", JSON.stringify(updated));
      return updated;
    });
  },

  getApiKey: (provider) => {
    return get().keys[provider]?.key ?? "";
  },
}));
