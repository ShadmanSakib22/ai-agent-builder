export type { AgentProfile, Skill, Layer, AgentBlueprint, ChatMessage } from "@/lib/api";

export interface AgentData {
  agentProfiles: import("@/lib/api").AgentProfile[];
  skills: import("@/lib/api").Skill[];
  layers: import("@/lib/api").Layer[];
}

export interface SavedAgent {
  name: string;
  profileId: string;
  skillIds: string[];
  layerIds: string[];
  provider?: string;
  createdAt?: string;
}
