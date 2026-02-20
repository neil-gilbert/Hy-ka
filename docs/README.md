# Engineering Model Evaluation Platform

This project is a platform for evaluating AI models on real-world engineering tasks.

It allows organisations to:

- Compare models objectively
- Compare providers objectively (OpenAI, Anthropic, Azure OpenAI, OpenRouter, etc.)
- Run reproducible experiments ("evals")
- Measure quality, latency, and cost tradeoffs
- Understand which model performs best for their engineering workflows

This is NOT a code generation tool.

This is an evaluation and observability platform.

---

# Core Concepts

Experiment → defines what to test

Run → execution of an experiment

TaskInstance → a single evaluation unit

Attempt → model output for a task

Score → evaluation metrics

Evaluator Score → internal agent rating of attempt quality/risk

Provider Governance → org-level allowlists and credentials for provider access

---

# Initial Goals

Phase 1:
- CLI runner
- Dashboard
- Run experiments on static dataset

Phase 2:
- SWE-bench integration

Phase 3:
- GitHub PR shadow evaluation

Phase 4:
- Multi-org product

---

See ROADMAP.md for full plan.
