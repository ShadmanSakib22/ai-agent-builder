"""
Assembles a rich system prompt from an AgentBlueprint.

The prompt is structured so that:
  1. The agent's core identity / role is established first.
  2. Capabilities (skills) are listed clearly.
  3. Behavioural / personality constraints (layers) are applied last,
     so they act as a filter over everything above.
"""

from __future__ import annotations
from models import AgentBlueprint

# ── Category / type labels for readability ────────────────────────────────────
SKILL_CATEGORY_LABELS: dict[str, str] = {
    "information": "Information & Research",
    "action":      "Action & Execution",
}

LAYER_TYPE_LABELS: dict[str, str] = {
    "reasoning":   "Reasoning Approach",
    "personality": "Personality & Tone",
    "context":     "Context & Memory",
    "formatting":  "Output Formatting",
}


def build_system_prompt(blueprint: AgentBlueprint) -> str:
    """Return the fully assembled system prompt string."""
    sections: list[str] = []

    # ── 1. Identity ───────────────────────────────────────────────────────────
    if blueprint.profile:
        sections.append(_identity_section(blueprint))
    else:
        sections.append(
            "You are a helpful, knowledgeable AI assistant. "
            "Answer questions clearly and accurately."
        )

    # ── 2. Skills / capabilities ──────────────────────────────────────────────
    if blueprint.skills:
        sections.append(_skills_section(blueprint))

    # ── 3. Personality / behavioural layers ───────────────────────────────────
    if blueprint.layers:
        sections.append(_layers_section(blueprint))

    # ── 4. Universal safety footer ────────────────────────────────────────────
    sections.append(_safety_footer())

    return "\n\n".join(s.strip() for s in sections if s.strip())


# ── Section builders ──────────────────────────────────────────────────────────

def _identity_section(bp: AgentBlueprint) -> str:
    p = bp.profile
    name_part = f' named "{bp.agent_name}"' if bp.agent_name else ""
    lines = [
        f"## Role & Identity",
        f"You are an AI agent{name_part} configured as a **{p.name}**.",
        f"",
        p.description,
    ]
    return "\n".join(lines)


def _skills_section(bp: AgentBlueprint) -> str:
    lines = ["## Capabilities"]
    lines.append(
        "You have access to the following capabilities. "
        "Use them proactively when they are relevant to the user's request."
    )

    # Group by category for a cleaner prompt
    grouped: dict[str, list] = {}
    for skill in bp.skills:
        grouped.setdefault(skill.category, []).append(skill)

    for category, skills in grouped.items():
        label = SKILL_CATEGORY_LABELS.get(category, category.title())
        lines.append(f"\n### {label}")
        for skill in skills:
            lines.append(f"- **{skill.name}**: {skill.description}")

    return "\n".join(lines)


def _layers_section(bp: AgentBlueprint) -> str:
    lines = ["## Behavioural Instructions"]
    lines.append(
        "Apply the following behavioural rules to every response you generate."
    )

    grouped: dict[str, list] = {}
    for layer in bp.layers:
        grouped.setdefault(layer.type, []).append(layer)

    for ltype, layers in grouped.items():
        label = LAYER_TYPE_LABELS.get(ltype, ltype.title())
        lines.append(f"\n### {label}")
        for layer in layers:
            lines.append(f"- **{layer.name}**: {layer.description}")

    return "\n".join(lines)


def _safety_footer() -> str:
    return (
        "## General Guidelines\n"
        "- Always be honest. If you are uncertain, say so.\n"
        "- Never fabricate facts, citations, or data.\n"
        "- Decline requests that are harmful, illegal, or unethical.\n"
        "- Keep responses focused and relevant to the user's actual need."
    )
