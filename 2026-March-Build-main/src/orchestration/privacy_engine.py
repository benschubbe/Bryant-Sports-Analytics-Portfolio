"""
BioGuardian Privacy Engine
============================
Simulated Homomorphic Encryption (HE) and Federated Learning (FL) layer
for the BioGuardian platform.

Design notes
------------
- This module is an *engineering-accurate simulation* of HE/FL primitives.
  A real deployment would replace the internals of each method with a
  library such as Microsoft SEAL, OpenFHE, or TenSEAL.  The public API
  is intentionally shaped to allow that substitution without changes to
  callers.

- All ciphertext state is encapsulated in the ``Ciphertext`` dataclass
  rather than opaque strings, which eliminates fragile string-parsing
  and aligns with the typed-model conventions in ``models.py``.

- Noise tracking follows the CKKS scheme's approximate arithmetic model:
    - Addition   → noise sums linearly.
    - Multiplication → noise grows multiplicatively (bootstrapping needed
                       in a real system when budget is exhausted).

- ``EncryptionContext`` replaces bare class-level string constants with a
  typed, validatable key pair.  In production, keys are never stored in
  source code; this context object is the injection point for a proper
  key-management service (KMS).

- ``AuditChain`` integration: every encrypt / decrypt / computation event
  is committed to the same chain used by the swarm agents in ``swarm.py``,
  giving end-to-end auditability from raw data ingestion through
  privacy-preserving computation.
"""

from __future__ import annotations

import hashlib
import json
import logging
import random
import secrets
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Sequence

from orchestration.auditor.engine import AuditChain

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Noise budget ceiling: above this level a ciphertext is considered corrupted.
# In CKKS this corresponds to exhausting the rescaling budget.
_MAX_SAFE_NOISE: float = 0.05

# Multiplication noise amplification range (models CKKS relinearisation cost).
_MUL_NOISE_AMPLIFICATION: tuple[float, float] = (1.5, 3.0)

# Prefix tokens embedded in ciphertext IDs to distinguish operation types.
_PREFIX_ENCRYPT = "HE_CT"
_PREFIX_SUM     = "HE_SUM"
_PREFIX_PROD    = "HE_PROD"
_PREFIX_GLOBAL  = "FL_GLOBAL"


# ---------------------------------------------------------------------------
# Encryption context  (replaces bare string class-level constants)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class EncryptionContext:
    """
    Holds the public / secret key pair for a single HE session.

    In production, ``secret_key`` never travels outside the local device;
    only ``public_key`` is shared for remote computation.

    Parameters
    ----------
    public_key:
        Serialised public key identifier.  Callers performing remote HE
        operations only need this value.
    secret_key:
        Serialised secret key identifier.  Must remain local.
    scheme:
        HE scheme label (informational; e.g. ``"CKKS"`` or ``"BFV"``).
    """

    public_key: str
    secret_key: str
    scheme: str = "CKKS"

    @classmethod
    def generate(cls, scheme: str = "CKKS") -> "EncryptionContext":
        """Create a fresh context with random 128-bit key identifiers."""
        return cls(
            public_key=f"PK_{secrets.token_hex(16).upper()}",
            secret_key=f"SK_{secrets.token_hex(16).upper()}",
            scheme=scheme,
        )

    def public_only(self) -> "EncryptionContext":
        """Return a context with the secret key redacted (for remote parties)."""
        return EncryptionContext(
            public_key=self.public_key,
            secret_key="<REDACTED>",
            scheme=self.scheme,
        )


# ---------------------------------------------------------------------------
# Ciphertext  (replaces opaque strings)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Ciphertext:
    """
    Typed representation of a simulated HE ciphertext.

    Attributes
    ----------
    id:
        Unique identifier derived from the content hash and operation prefix.
    public_key_id:
        Identifier of the public key used to encrypt this value.
        Allows key rotation checks without exposing the key material.
    noise_budget:
        Remaining noise budget in [0, 1].  Operations consume budget;
        ``noise_budget < _MAX_SAFE_NOISE`` signals potential data loss.
    created_at:
        UTC timestamp of the operation that produced this ciphertext.
    operation:
        Human-readable label for the operation that created this value
        (e.g. ``"encrypt"``, ``"add"``, ``"multiply"``).
    """

    id: str
    public_key_id: str
    noise_budget: float
    created_at: str
    operation: str

    @property
    def is_safe(self) -> bool:
        """True when the noise budget has not been exhausted."""
        return self.noise_budget <= _MAX_SAFE_NOISE

    def __str__(self) -> str:
        return (
            f"Ciphertext(id={self.id[:24]}…, op={self.operation}, "
            f"noise={self.noise_budget:.4f}, safe={self.is_safe})"
        )


# ---------------------------------------------------------------------------
# ZKP proof result
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ZKProofResult:
    """
    Simulated Zero-Knowledge Proof attached to a secure computation result.

    Attributes
    ----------
    status:
        Computation status string.
    operation:
        Name of the computation that was performed.
    proof_token:
        Short proof token that a verifier can check without seeing the input.
    result_ciphertext:
        The output ciphertext carrying the computed (still encrypted) result.
    """

    status: str
    operation: str
    proof_token: str
    result_ciphertext: Ciphertext


# ---------------------------------------------------------------------------
# Privacy Engine
# ---------------------------------------------------------------------------

class PrivacyEngine:
    """
    BioGuardian Privacy Engine.

    Simulates Homomorphic Encryption (CKKS scheme) and Federated Learning
    secure aggregation.  All operations are committed to the shared
    ``AuditChain`` so privacy-layer events appear alongside agent events
    in the audit log.

    Parameters
    ----------
    context:
        ``EncryptionContext`` carrying the key pair for this session.
        Defaults to a freshly generated context if not supplied.
    audit:
        Shared ``AuditChain`` instance.  Pass the same instance used by
        the swarm agents in ``swarm.py`` for a unified audit trail.

    Example
    -------
    >>> from orchestration.auditor.engine import AuditChain
    >>> audit = AuditChain()
    >>> pe = PrivacyEngine(audit=audit)
    >>> ct = pe.encrypt({"value": 110.5, "unit": "mg/dL"})
    >>> ct.is_safe
    True
    >>> result = pe.secure_compute(ct, "MetabolicRiskModel")
    >>> result.status
    'COMPUTED_ON_CIPHERTEXT'
    """

    def __init__(
        self,
        context: EncryptionContext | None = None,
        audit: AuditChain | None = None,
    ) -> None:
        self._ctx = context or EncryptionContext.generate()
        self._audit = audit or AuditChain()
        logger.info(
            "PrivacyEngine initialised — scheme=%s pk=%s…",
            self._ctx.scheme,
            self._ctx.public_key[:12],
        )

    # ------------------------------------------------------------------
    # Public key exposure (for remote computation parties)
    # ------------------------------------------------------------------

    @property
    def public_context(self) -> EncryptionContext:
        """Return the context with the secret key redacted."""
        return self._ctx.public_only()

    # ------------------------------------------------------------------
    # Core HE operations
    # ------------------------------------------------------------------

    def encrypt(self, data: dict[str, Any]) -> Ciphertext:
        """
        Encrypt *data* under the session public key.

        Parameters
        ----------
        data:
            JSON-serialisable dict (e.g. a patient biomarker reading).

        Returns
        -------
        Ciphertext
            Typed ciphertext with an initial noise budget.
        """
        raw = json.dumps(data, sort_keys=True, default=str).encode("utf-8")
        content_hash = hashlib.sha256(raw).hexdigest()[:20]
        noise = _sample_base_noise()
        ct = Ciphertext(
            id=f"{_PREFIX_ENCRYPT}_{content_hash}",
            public_key_id=self._ctx.public_key,
            noise_budget=noise,
            created_at=_utcnow(),
            operation="encrypt",
        )
        self._audit.log("PrivacyEngine.encrypt", _redact(data), ct.id)
        logger.debug("Encrypted data → %s", ct)
        return ct

    def decrypt(self, ct: Ciphertext, original_data: dict[str, Any]) -> dict[str, Any]:
        """
        Decrypt *ct* using the session secret key.

        In a real system this is computationally intensive; here we simulate
        the two main failure modes:
          1. Key mismatch (wrong public key embedded in the ciphertext).
          2. Noise budget exhausted (data integrity cannot be guaranteed).

        Parameters
        ----------
        ct:
            Ciphertext to decrypt.
        original_data:
            The plaintext used to create *ct* (simulation stand-in for
            actual polynomial inversion).

        Returns
        -------
        dict
            The recovered plaintext, or an error dict on failure.
        """
        if ct.public_key_id != self._ctx.public_key:
            logger.warning("Decrypt failed: public key mismatch for %s.", ct.id)
            return {"error": "Decryption failed: ciphertext was encrypted under a different key."}

        if not ct.is_safe:
            logger.warning("Decrypt failed: noise budget exhausted for %s (noise=%.4f).", ct.id, ct.noise_budget)
            return {"error": f"Decryption failed: noise budget exhausted ({ct.noise_budget:.4f} > {_MAX_SAFE_NOISE})."}

        self._audit.log("PrivacyEngine.decrypt", ct.id, "plaintext_recovered")
        logger.debug("Decrypted %s successfully.", ct.id)
        return original_data

    def add(self, ct1: Ciphertext, ct2: Ciphertext) -> Ciphertext:
        """
        Homomorphic addition of two ciphertexts.

        Noise accumulates linearly (CKKS additive noise model).

        Raises
        ------
        ValueError
            If the two ciphertexts were encrypted under different public keys.
        """
        _assert_same_key(ct1, ct2)
        combined_hash = _combine_hash(ct1.id, ct2.id)
        new_noise = ct1.noise_budget + ct2.noise_budget + _sample_base_noise()
        ct = Ciphertext(
            id=f"{_PREFIX_SUM}_{combined_hash}",
            public_key_id=ct1.public_key_id,
            noise_budget=new_noise,
            created_at=_utcnow(),
            operation="add",
        )
        self._audit.log("PrivacyEngine.add", [ct1.id, ct2.id], ct.id)
        logger.debug("HE add → %s", ct)
        return ct

    def multiply(self, ct1: Ciphertext, ct2: Ciphertext) -> Ciphertext:
        """
        Homomorphic multiplication of two ciphertexts.

        Noise grows multiplicatively; in a real CKKS scheme this typically
        requires a bootstrapping (noise refresh) step when the budget drops
        below a safe threshold.

        Raises
        ------
        ValueError
            If the two ciphertexts were encrypted under different public keys.
        """
        _assert_same_key(ct1, ct2)
        combined_hash = _combine_hash(ct1.id, ct2.id)
        amplification = random.uniform(*_MUL_NOISE_AMPLIFICATION)
        new_noise = (ct1.noise_budget + ct2.noise_budget) * amplification + _sample_base_noise()
        ct = Ciphertext(
            id=f"{_PREFIX_PROD}_{combined_hash}",
            public_key_id=ct1.public_key_id,
            noise_budget=new_noise,
            created_at=_utcnow(),
            operation="multiply",
        )
        self._audit.log("PrivacyEngine.multiply", [ct1.id, ct2.id], ct.id)
        if not ct.is_safe:
            logger.warning("Noise budget exhausted after multiplication: %.4f — bootstrapping required.", new_noise)
        logger.debug("HE multiply → %s", ct)
        return ct

    def secure_compute(self, ct: Ciphertext, operation_name: str) -> ZKProofResult:
        """
        Simulate a secure computation over an encrypted value, returning
        an encrypted result and a Zero-Knowledge Proof token.

        Parameters
        ----------
        ct:
            Input ciphertext.
        operation_name:
            Label for the computation (e.g. ``"MetabolicRiskModel"``).

        Returns
        -------
        ZKProofResult
            Typed result carrying the output ciphertext and a ZKP token.
        """
        new_noise = ct.noise_budget + _sample_base_noise() * 2
        result_ct = Ciphertext(
            id=f"HE_COMPUTED_{_hash_token(ct.id)[:16]}",
            public_key_id=ct.public_key_id,
            noise_budget=new_noise,
            created_at=_utcnow(),
            operation=f"compute:{operation_name}",
        )
        proof_token = f"ZKP_{_hash_token(ct.id + operation_name)[:12].upper()}"
        self._audit.log("PrivacyEngine.secure_compute", {"input": ct.id, "op": operation_name}, result_ct.id)
        logger.info("Secure compute '%s' complete — proof=%s noise=%.4f", operation_name, proof_token, new_noise)
        return ZKProofResult(
            status="COMPUTED_ON_CIPHERTEXT",
            operation=operation_name,
            proof_token=proof_token,
            result_ciphertext=result_ct,
        )

    # ------------------------------------------------------------------
    # Federated Learning
    # ------------------------------------------------------------------

    def aggregate_federated_weights(
        self, local_ciphertexts: Sequence[Ciphertext]
    ) -> Ciphertext:
        """
        Simulate Federated Learning secure aggregation.

        Averages the noise budgets of local model update ciphertexts and
        adds a small aggregation cost, modelling the server-side secure
        aggregation step (e.g. SecAgg protocol).

        Parameters
        ----------
        local_ciphertexts:
            Encrypted local model weight updates from participating devices.

        Returns
        -------
        Ciphertext
            Encrypted global model update.

        Raises
        ------
        ValueError
            If ``local_ciphertexts`` is empty or encrypted under mixed keys.
        """
        if not local_ciphertexts:
            raise ValueError("Cannot aggregate an empty list of local weight ciphertexts.")

        key_ids = {ct.public_key_id for ct in local_ciphertexts}
        if len(key_ids) > 1:
            raise ValueError(
                f"All local ciphertexts must share the same public key; "
                f"found {len(key_ids)} distinct keys."
            )

        combined_hash = _combine_hash(*[ct.id for ct in local_ciphertexts])
        avg_noise = sum(ct.noise_budget for ct in local_ciphertexts) / len(local_ciphertexts)
        aggregated_noise = avg_noise + _sample_base_noise()

        global_ct = Ciphertext(
            id=f"{_PREFIX_GLOBAL}_{combined_hash}",
            public_key_id=local_ciphertexts[0].public_key_id,
            noise_budget=aggregated_noise,
            created_at=_utcnow(),
            operation="fl_aggregate",
        )
        self._audit.log(
            "PrivacyEngine.fl_aggregate",
            [ct.id for ct in local_ciphertexts],
            global_ct.id,
        )
        logger.info(
            "FL aggregation: %d local updates → %s (noise=%.4f)",
            len(local_ciphertexts),
            global_ct.id[:28],
            aggregated_noise,
        )
        return global_ct


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat()


def _sample_base_noise() -> float:
    """Sample a small base noise value matching CKKS fresh ciphertext noise."""
    return random.uniform(0.0001, 0.01)


def _hash_token(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _combine_hash(*parts: str) -> str:
    return hashlib.sha256("".join(sorted(parts)).encode("utf-8")).hexdigest()[:20]


def _assert_same_key(ct1: Ciphertext, ct2: Ciphertext) -> None:
    if ct1.public_key_id != ct2.public_key_id:
        raise ValueError(
            "Cannot operate on ciphertexts from different encryption contexts: "
            f"{ct1.public_key_id!r} vs {ct2.public_key_id!r}."
        )


def _redact(data: dict[str, Any]) -> dict[str, Any]:
    """
    Return a copy of *data* with values replaced by their types.
    Used for audit logging so patient data never enters the audit chain.
    """
    return {k: type(v).__name__ for k, v in data.items()}


# ---------------------------------------------------------------------------
# Self-test / demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from orchestration.auditor.engine import AuditChain

    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(name)s: %(message)s")

    shared_audit = AuditChain()
    pe = PrivacyEngine(audit=shared_audit)

    # 1. Encrypt a biomarker reading
    glucose_data = {"value": 110.5, "unit": "mg/dL", "patient_id": "PT-XYZ"}
    ct_glucose = pe.encrypt(glucose_data)
    print(f"\nEncrypted:  {ct_glucose}")

    # 2. Decrypt it
    plaintext = pe.decrypt(ct_glucose, glucose_data)
    print(f"Decrypted:  {plaintext}")

    # 3. Add two ciphertexts
    ct_other = pe.encrypt({"value": 120.3, "unit": "mg/dL", "patient_id": "PT-ABC"})
    ct_sum = pe.add(ct_glucose, ct_other)
    print(f"\nHE Add:     {ct_sum}")

    # 4. Multiply two ciphertexts (noise grows faster)
    ct_prod = pe.multiply(ct_glucose, ct_other)
    print(f"HE Multiply:{ct_prod}")
    if not ct_prod.is_safe:
        print("  ⚠ Noise budget exhausted — bootstrapping required in production.")

    # 5. Secure computation with ZKP
    zkp_result = pe.secure_compute(ct_glucose, "MetabolicRiskModel")
    print(f"\nZKP Result: status={zkp_result.status} proof={zkp_result.proof_token}")
    print(f"  Output CT: {zkp_result.result_ciphertext}")

    # 6. Federated Learning aggregation
    local_cts = [
        pe.encrypt({"weights": [0.1, 0.2]}),
        pe.encrypt({"weights": [0.15, 0.25]}),
        pe.encrypt({"weights": [0.12, 0.22]}),
    ]
    global_ct = pe.aggregate_federated_weights(local_cts)
    print(f"\nFL Global:  {global_ct}")

    # 7. Audit chain integrity
    print(f"\nAudit chain length: {len(shared_audit)} entries")
    print(f"Chain integrity:    {'✓ VALID' if shared_audit.verify_integrity() else '✗ TAMPERED'}")
