"""
BioGuardian Vector Store and MCP Server — Unit Tests
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from orchestration.vector_store import EmbeddedVectorStore, build_clinical_reference_store
from orchestration.mcp_server import MCPServer


class TestEmbeddedVectorStore:

    def test_add_and_search(self):
        store = EmbeddedVectorStore()
        store.add("hemoglobin a1c diabetes", {"loinc": "4544-3"})
        store.add("glucose blood sugar", {"loinc": "2339-0"})
        store.add("cholesterol lipid", {"loinc": "2093-3"})

        results = store.search("hemoglobin a1c", top_k=2)
        assert len(results) == 2
        assert results[0]["loinc"] == "4544-3"
        assert results[0]["score"] > results[1]["score"]

    def test_size(self):
        store = EmbeddedVectorStore()
        assert store.size == 0
        store.add("test", {})
        assert store.size == 1

    def test_get_by_id(self):
        store = EmbeddedVectorStore()
        doc_id = store.add("test document", {"key": "value"})
        result = store.get_by_id(doc_id)
        assert result is not None
        assert result["key"] == "value"

    def test_clinical_store_has_20_entries(self):
        store = build_clinical_reference_store()
        assert store.size == 20

    def test_clinical_store_finds_statin_marker(self):
        store = build_clinical_reference_store()
        results = store.search("creatine kinase CK statin myopathy", top_k=1)
        assert len(results) == 1
        assert results[0]["loinc_code"] == "2157-6"

    def test_clinical_store_finds_hrv(self):
        store = build_clinical_reference_store()
        results = store.search("heart rate variability HRV autonomic", top_k=1)
        assert len(results) == 1
        assert results[0]["loinc_code"] == "80404-7"

    def test_cosine_similarity_range(self):
        store = EmbeddedVectorStore()
        store.add("identical text", {})
        results = store.search("identical text", top_k=1)
        assert 0.99 <= results[0]["score"] <= 1.01  # near-perfect match


class TestMCPServer:

    def test_list_tools(self):
        server = MCPServer()
        tools = server.list_tools()
        assert len(tools) == 4
        names = [t["name"] for t in tools]
        assert "bioguardian.scribe" in names
        assert "bioguardian.pharmacist" in names
        assert "bioguardian.correlation_engine" in names
        assert "bioguardian.compliance_auditor" in names

    def test_get_tool(self):
        server = MCPServer()
        tool = server.get_tool("bioguardian.scribe")
        assert tool is not None
        assert "inputSchema" in tool
        assert "outputSchema" in tool

    def test_validate_input_valid(self):
        server = MCPServer()
        valid, errors = server.validate_input("bioguardian.scribe", {
            "patient_id": "PT-2026-SARAH",
            "raw_lab_text": "Hemoglobin A1c: 6.4%",
        })
        assert valid
        assert len(errors) == 0

    def test_validate_input_missing_required(self):
        server = MCPServer()
        valid, errors = server.validate_input("bioguardian.scribe", {
            "raw_lab_text": "test",
        })
        assert not valid
        assert any("patient_id" in e for e in errors)

    def test_validate_input_unknown_tool(self):
        server = MCPServer()
        valid, errors = server.validate_input("unknown.tool", {})
        assert not valid

    def test_register_tool(self):
        server = MCPServer()
        server.register_tool("bioguardian.genomics", {
            "name": "bioguardian.genomics",
            "description": "Genomics Agent",
            "inputSchema": {"type": "object", "properties": {}},
        })
        assert server.get_tool("bioguardian.genomics") is not None
        assert len(server.list_tools()) == 5

    def test_schema_summary(self):
        server = MCPServer()
        summary = server.schema_summary()
        assert summary["tool_count"] == 4
        assert len(summary["tools"]) == 4
