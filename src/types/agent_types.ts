// Define the types based on data.json
interface AgentProfile {
  id: string;
  name: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Layer {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface AgentData {
  agentProfiles: AgentProfile[];
  skills: Skill[];
  layers: Layer[];
}

interface SavedAgent {
  name: string;
  profileId: string;
  skillIds: string[];
  layerIds: string[];
  provider?: string;
}

export type { AgentProfile, Skill, Layer, AgentData, SavedAgent };
