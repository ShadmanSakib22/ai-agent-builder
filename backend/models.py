"""
Pydantic models for all request and response bodies.
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Agent Blueprint  (mirrors the frontend types)
# ──────────────────────────────────────────────

class AgentProfile(BaseModel):
    id: str
    name: str
    description: str


class Skill(BaseModel):
    id: str
    name: str
    category: str
    description: str


class Layer(BaseModel):
    id: str
    name: str
    type: str
    description: str


class AgentBlueprint(BaseModel):
    """
    Full agent configuration sent from the frontend.
    Mirrors the fields stored in localStorage on the client.
    """
    profile: Optional[AgentProfile] = None
    skills: list[Skill] = Field(default_factory=list)
    layers: list[Layer] = Field(default_factory=list)
    provider: str = ""
    agent_name: str = ""


# ──────────────────────────────────────────────
# Chat primitives
# ──────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


# ──────────────────────────────────────────────
# Request bodies
# ──────────────────────────────────────────────

class SystemPromptRequest(BaseModel):
    blueprint: AgentBlueprint


class ValidateKeyRequest(BaseModel):
    provider: str
    api_key: str = Field(..., min_length=1)


class AgentRunRequest(BaseModel):
    blueprint: AgentBlueprint
    messages: list[ChatMessage]
    api_key: str = Field(..., min_length=1)
    provider: str
    model: str
    max_tokens: int = Field(default=1024, ge=1, le=8192)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class ChatRequest(AgentRunRequest):
    """Identical to AgentRunRequest; kept separate for clarity / future divergence."""
    pass


# ──────────────────────────────────────────────
# Response bodies
# ──────────────────────────────────────────────

class SystemPromptResponse(BaseModel):
    system_prompt: str
    token_estimate: int


class ValidateKeyResponse(BaseModel):
    valid: bool
    provider: str


class HealthResponse(BaseModel):
    status: str
    version: str
