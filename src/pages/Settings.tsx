import { useState } from "react";
import { useApiKeyStore } from "@/stores/apiKeyStore";
import { validateKey, listModels } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Key,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROVIDERS = ["Gemini", "ChatGPT", "Kimi", "Claude", "DeepSeek", "OpenRouter", "Local LLM"];

export default function Settings() {
  const navigate = useNavigate();
  const {
    keys,
    defaultProvider,
    defaultModel,
    setApiKey,
    removeApiKey,
    setValidating,
    setValid,
    setDefaultProvider,
    setDefaultModel,
  } = useApiKeyStore();

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [modelOptions, setModelOptions] = useState<Record<string, string[]>>({});

  const toggleShowKey = (provider: string) => {
    setShowKey((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSaveKey = async (provider: string, key: string) => {
    if (!key.trim()) {
      toast.error("Please enter an API key.");
      return;
    }

    setApiKey(provider, key.trim());
    setValidating(provider, true);

    try {
      const result = await validateKey(provider, key.trim());
      setValid(provider, result.valid);
      if (result.valid) {
        toast.success(`${provider} API key validated successfully!`);
        
        const models = await listModels(provider);
        setModelOptions((prev) => ({ ...prev, [provider]: models.models }));
      } else {
        toast.error(`Invalid ${provider} API key.`);
      }
    } catch {
      setValid(provider, false);
      toast.error(`Failed to validate ${provider} API key.`);
    }
  };

  const handleRemoveKey = (provider: string) => {
    removeApiKey(provider);
    toast.info(`${provider} API key removed.`);
  };

  const handleProviderChange = (provider: string) => {
    setDefaultProvider(provider);
    if (modelOptions[provider]) {
      setDefaultModel(modelOptions[provider][0] || "");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Key className="size-5" />
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-5 py-3.5">
          <h2 className="text-sm font-semibold">API Keys</h2>
          <p className="text-xs text-muted-foreground">
            Your keys are stored locally and never sent to any server except the
            respective provider.
          </p>
        </div>
        <div className="space-y-4 p-5">
          {PROVIDERS.map((provider) => {
            const entry = keys[provider];
            const isValid = entry?.isValid;
            const isValidating = entry?.isValidating ?? false;
            const currentKey = entry?.key ?? "";
            const isVisible = showKey[provider];

            return (
              <div
                key={provider}
                className="flex flex-col gap-2 rounded-lg border border-border/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{provider}</span>
                    {isValid === true && (
                      <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Check className="size-3" /> Valid
                      </span>
                    )}
                    {isValid === false && (
                      <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <X className="size-3" /> Invalid
                      </span>
                    )}
                    {isValidating && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={isVisible ? "text" : "password"}
                      placeholder={`Enter ${provider} API key`}
                      defaultValue={currentKey}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value !== currentKey) {
                          handleSaveKey(provider, e.target.value);
                        }
                      }}
                      className="pr-10"
                    />
                    {currentKey && (
                      <button
                        type="button"
                        onClick={() => toggleShowKey(provider)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {isVisible ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {currentKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveKey(provider, currentKey)}
                      disabled={isValidating}
                    >
                      Validate
                    </Button>
                  )}
                  {currentKey && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKey(provider)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Default Settings Section */}
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Defaults</h2>
          <p className="text-xs text-muted-foreground">
            Set your preferred provider and model for new conversations.
          </p>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Default Provider</label>
            <select
              value={defaultProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {modelOptions[defaultProvider] && modelOptions[defaultProvider].length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Default Model</label>
              <select
                value={defaultModel || modelOptions[defaultProvider][0]}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {modelOptions[defaultProvider].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Or select a provider in the Builder to use it for a specific agent.
          </p>
        </div>
      </div>
    </div>
  );
}
