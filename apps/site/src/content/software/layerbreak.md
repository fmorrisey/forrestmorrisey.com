---
title: "LayerBreak"
date: 2026-08-12
published: true
description: "Hands-off optical disc ripping for a Linux media server, packaged as a .deb."
summary: Insert a disc and walk away — a udev-triggered pipeline rips, identifies, transcodes, files, and notifies, in restart-safe background stages.
heroSubtitle: Insert a disc and walk away
role: Author & Maintainer
tech: ["Python", "systemd", "udev", "Debian packaging", "ffmpeg", "Bash"]
tags: ["Python", "Linux", "Automation", "Self-Hosted"]
links:
  # Still resolves under the old repo name; GitHub redirects if and when the
  # repository itself is renamed to match.
  repo: "https://github.com/fmorrisey/autoripper"
  download: "https://github.com/fmorrisey/autoripper/releases/latest"
featured: true
ctaLabel: View Project
---

LayerBreak turns a Linux box with an optical drive into an unattended ripping
station. Insert a disc and walk away: a udev rule fires a pipeline that detects
the media type, rips it, identifies and names it, transcodes it, moves it into a
media library, and pings your phone. It installs as a Debian package, with plain
systemd units and no container to operate.

**Full write-up coming soon.**
