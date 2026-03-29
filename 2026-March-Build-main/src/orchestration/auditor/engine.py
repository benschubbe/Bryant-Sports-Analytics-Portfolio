"""
FDA General Wellness Compliance Engine
=======================================
Deterministic predicate-logic validation and cryptographic audit logging
for FDA General Wellness device claims.

Design goals:
  - Non-LLM-based for formal verifiability
  - Immutable, SHA-256-chained audit trail
  - Clear separation between rule loading, validation, and auditing
"""

from __future__ import annotations

import hashlib
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data containers
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ValidationResult:
    """Immutable result of a single compliance validation pass."""

    passed: bool
    violations: tuple[str, ...]  # frozen so it's hashable / safe to share

    @property
    def violation_count(self) -> int:
        return len(self.violations)

    def __bool__(self) -> bool:
        return self.passed


@dataclass(frozen=True)
class AuditEntry:
    """A single link in the cryptographic audit chain."""

    timestamp: str
    agent: str
    input_hash: str
    output_hash: str
    prev_hash: str
    hash: str  # hash of all fields above; computed on construction


# ---------------------------------------------------------------------------
# Rule loading
# ---------------------------------------------------------------------------

@dataclass
class ComplianceRule:
    """Parsed representation of one YAML compliance rule."""

    id: str
    code: str
    forbidden_patterns: tuple[str, ...]
    required_phrases: tuple[str, ...]  # only enforced for specific rule IDs

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ComplianceRule":
        return cls(
            id=data["id"],
            code=data["code"],
            forbidden_patterns=tuple(p.lower() for p in data.get("forbidden_patterns", [])),
            required_phrases=tuple(p.lower() for p in data.get("required_phrases", [])),
        )


# ---------------------------------------------------------------------------
# Compliance engine
# ---------------------------------------------------------------------------

class ComplianceEngine:
    """
    Deterministic predicate-logic engine for FDA General Wellness compliance.

    Validates free-form text against a YAML rule set.  Each rule may declare:
      - ``forbidden_patterns``  – substrings that must *not* appear in the text.
      - ``required_phrases``    – at least one must appear (enforced only for
                                  rules whose ``id`` is listed in
                                  ``_DISCLAIMER_RULE_IDS``).

    The engine is intentionally non-LLM-based so its behaviour is fully
    deterministic and formally verifiable.

    Parameters
    ----------
    rules_path:
        Path to the YAML configuration file.

    Raises
    ------
    FileNotFoundError
        If *rules_path* does not exist.
    KeyError
        If a rule entry is missing the required ``id`` or ``code`` fields.
    """

    # Rule IDs whose ``required_phrases`` list is actively enforced.
    _DISCLAIMER_RULE_IDS: frozenset[str] = frozenset({"GW-033"})

    def __init__(self, rules_path: str | Path) -> None:
        rules_path = Path(rules_path)
        if not rules_path.exists():
            raise FileNotFoundError(f"Rules file not found: {rules_path}")

        with rules_path.open("r", encoding="utf-8") as fh:
            config: dict[str, Any] = yaml.safe_load(fh) or {}

        self._rules: list[ComplianceRule] = [
            ComplianceRule.from_dict(r) for r in config.get("rules", [])
        ]
        logger.info("Loaded %d compliance rules from %s", len(self._rules), rules_path)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def validate(self, text: str) -> ValidationResult:
        """
        Validate *text* against all loaded rules.

        Parameters
        ----------
        text:
            The content to evaluate (e.g. a marketing claim or UI label).

        Returns
        -------
        ValidationResult
            ``passed`` is ``True`` only when no violations are found.
        """
        violations: list[str] = []
        normalised = text.lower()

        for rule in self._rules:
            violations.extend(self._check_forbidden(rule, normalised))
            violations.extend(self._check_required(rule, normalised))

        return ValidationResult(passed=not violations, violations=tuple(violations))

    @property
    def rules(self) -> list[ComplianceRule]:
        """Read-only view of the loaded rule set."""
        return list(self._rules)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _check_forbidden(rule: ComplianceRule, normalised_text: str) -> list[str]:
        return [
            f"[{rule.code}] Forbidden term detected: '{pattern}'"
            for pattern in rule.forbidden_patterns
            if pattern in normalised_text
        ]

    def _check_required(self, rule: ComplianceRule, normalised_text: str) -> list[str]:
        if rule.id not in self._DISCLAIMER_RULE_IDS:
            return []
        if rule.required_phrases and not any(
            phrase in normalised_text for phrase in rule.required_phrases
        ):
            return [f"[{rule.code}] Required disclaimer is missing"]
        return []


# ---------------------------------------------------------------------------
# Cryptographic audit chain
# ---------------------------------------------------------------------------

class AuditChain:
    """
    Append-only, SHA-256-chained audit log.

    Every entry commits to the hash of the previous entry, making the
    log tamper-evident: altering any past record invalidates all
    subsequent hashes.

    Example
    -------
    >>> chain = AuditChain()
    >>> chain.log("validator", {"text": "foo"}, {"passed": True})
    >>> assert chain.verify_integrity()
    """

    _GENESIS_HASH = "0" * 64  # sentinel for the first entry

    def __init__(self) -> None:
        self._chain: list[AuditEntry] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def log(self, agent: str, input_data: Any, output_data: Any) -> str:
        """
        Append a new entry to the chain and return its hash.

        Parameters
        ----------
        agent:
            Name of the agent / component that produced the output.
        input_data:
            The data consumed by the agent (will be hashed, not stored raw).
        output_data:
            The data produced by the agent (will be hashed, not stored raw).

        Returns
        -------
        str
            The SHA-256 hex digest of the new entry.
        """
        prev_hash = self._chain[-1].hash if self._chain else self._GENESIS_HASH

        # Build the payload dict (without its own hash first).
        payload: dict[str, str] = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "agent": agent,
            "input_hash": self._hash(input_data),
            "output_hash": self._hash(output_data),
            "prev_hash": prev_hash,
        }
        entry_hash = self._hash(payload)

        entry = AuditEntry(**payload, hash=entry_hash)
        self._chain.append(entry)
        logger.debug("Audit entry logged for agent '%s' → %s…", agent, entry_hash[:12])
        return entry_hash

    def verify_integrity(self) -> bool:
        """
        Re-derive every hash in the chain and confirm consistency.

        Returns
        -------
        bool
            ``True`` if the chain is intact, ``False`` if any entry has
            been tampered with.
        """
        for i, entry in enumerate(self._chain):
            expected_prev = self._chain[i - 1].hash if i > 0 else self._GENESIS_HASH
            if entry.prev_hash != expected_prev:
                logger.warning("Chain integrity failure at index %d (prev_hash mismatch)", i)
                return False

            payload = {
                "timestamp": entry.timestamp,
                "agent": entry.agent,
                "input_hash": entry.input_hash,
                "output_hash": entry.output_hash,
                "prev_hash": entry.prev_hash,
            }
            if self._hash(payload) != entry.hash:
                logger.warning("Chain integrity failure at index %d (hash mismatch)", i)
                return False

        return True

    def export(self) -> list[dict[str, str]]:
        """Return the full chain as a list of plain dicts (JSON-safe)."""
        return [entry.__dict__ for entry in self._chain]

    def __len__(self) -> int:
        return len(self._chain)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _hash(data: Any) -> str:
        serialised = json.dumps(data, sort_keys=True, default=str, ensure_ascii=False)
        return hashlib.sha256(serialised.encode("utf-8")).hexdigest()
        
