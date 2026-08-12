---
title: "Magi-01"
date: 2026-07-14
published: true
category: personal
description: "Three AI agents with conflicting objectives answer the same question, then see each other, then a reducer collapses them."
summary: An agentic voting panel — independent answers first, cross-examination second, synthesis last, streaming live as it happens.
heroSubtitle: Disagreement as a design goal
role: Author
tech: ["Python", "Claude API", "Ollama", "Streaming UI"]
tags: ["Python", "AI", "Agents"]
featured: false
ctaLabel: View Project
---

Magi-01 puts three agents with **deliberately conflicting objectives** on the
same question. Each answers independently, then they are shown each other's
answers, then a reducer collapses the three into one. The whole exchange streams
live as it happens.

The name is borrowed from *Neon Genesis Evangelion*, whose Magi are three
computers that deliberate and vote rather than compute a single answer.

## Why conflicting objectives

A panel of identical models is an expensive way to get one opinion repeated
three times. Agreement between agents that share a prior tells you nothing about
whether the answer is right — only that they were built the same way.

Giving the units genuinely different objectives makes disagreement informative.
Where they diverge is where the question is actually contested, and that shows up
in the transcript rather than being averaged away before you see it.

The two-stage structure matters for the same reason. If agents see each other
first, the first confident answer anchors the rest. Independent answers first,
cross-examination second, keeps the disagreement real long enough to be useful.

## Model-agnostic by unit

Each unit can point at a different model — a hosted Claude model, or anything
running locally through Ollama, chosen per unit per run. An all-local panel
needs no API key at all, which makes the interesting experiment — *what happens
when the three units are genuinely different kinds of model?* — cheap enough to
actually run.

---

*Source is private. Happy to walk through the architecture.*
