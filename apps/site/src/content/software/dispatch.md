---
title: "Dispatch"
date: 2026-08-12
published: true
category: personal
description: "Cross-domain dependency tracking for work humans and AI agents do together."
summary: One question — which decisions, right now, unblock the most downstream work? A graph of what blocks what, and a ranked queue of the decisions that release it.
heroSubtitle: Which decision unblocks the most work?
role: Author
tech: ["TypeScript", "MCP", "Event Sourcing", "Graph Modeling"]
tags: ["TypeScript", "AI", "Agents", "Tooling"]
featured: false
ctaLabel: View Project
---

Dispatch tracks what blocks what across a body of work, and ranks the open
decisions by how much they would release.

It is **not an orchestrator**. Agents run wherever they already run — Claude
Code, Cursor, n8n — and report in. Dispatch owns the dependency graph and the
decision queue, not the execution.

## The gap it fills

GitHub sees code. Figma sees design. Notion sees docs. Each of them will
eventually ship its own view of agent work, and none of them can see the union —
or represent the edge that crosses between them:

> a research finding blocks a design decision blocks a ticket blocks a PR

Every node in that chain lives in a different tool. The chain itself lives
nowhere. That absence is the product.

## What changes in practice

The interesting move is what an agent does when it hits something it should not
decide alone. Instead of guessing, or stopping dead, it opens a decision with a
concrete proposal and an honest confidence, then reports itself blocked and picks
up something else.

The decision does not land in a human's inbox as one more undifferentiated ping.
It enters a queue ranked by how much work it unblocks — so the question that
releases four downstream tasks is asked before the one that releases none.

Confidence has to be honest rather than promotional for that ranking to hold up
over time, which is a more interesting constraint on agent design than it first
appears.

---

*Source is private. Happy to walk through the architecture.*
