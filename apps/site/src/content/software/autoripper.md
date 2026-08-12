---
title: "autoripper"
date: 2026-08-12
published: true
description: "Hands-off optical disc ripping for a Linux media server, packaged as a .deb."
summary: Insert a disc and walk away — a udev rule fires a pipeline that rips, identifies, transcodes, files, and notifies, all in restart-safe background stages.
heroSubtitle: Insert a disc and walk away
role: Author & Maintainer
tech: ["Python", "systemd", "udev", "Debian packaging", "ffmpeg", "Bash"]
tags: ["Python", "Linux", "Automation", "Self-Hosted"]
links:
  repo: "https://github.com/fmorrisey/autoripper"
  # Points at /latest rather than a pinned version: releases are cut often, and
  # a hardcoded version number would be stale within a day.
  download: "https://github.com/fmorrisey/autoripper/releases/latest"
featured: true
ctaLabel: View Project
---

## Overview

autoripper turns a Linux box with an optical drive into an unattended ripping
station. Insert a disc and walk away: a udev rule fires a pipeline that detects
the media type, rips it, identifies and names it, transcodes it, moves it into a
Plex or Jellyfin library, and pings your phone.

It installs as a Debian package — `apt install ./autoripper_*.deb` — with plain
systemd units and no container to operate.

## How it works

- **Audio CD** → whipper, producing AccurateRip-verified FLAC
- **DVD / Blu-ray** → MakeMKV, with an optional HandBrake NVENC transcode
- **Old or scratched discs** → automatic `ddrescue` recovery: image first, retry
  the bad sectors, then rip the image
- **Naming** → beets with MusicBrainz and AcoustID fingerprinting for music,
  mnamer against TheMovieDB and TVDb for video
- **Delivery** → rsync to the library share, then a Plex section scan
- **Notifications** → ntfy push, a generic JSON webhook, or both

The stages are decoupled. The drive **ejects as soon as the rip finishes** and
hands off to independent, restart-safe background workers, so discs can be fed
back-to-back instead of waiting on a transcode.

## Design decisions worth defending

**A confident wrong answer is worse than an unconfident right one.** Runtimes
are measured with `ffprobe`, not guessed. A local LLM, when enabled, is allowed
only to expand a cryptic disc label into candidate titles — TheMovieDB then
decides by matching the measured runtime. Below the confidence threshold, discs
are staged for review rather than filed under a name nobody checked.

**Nothing is hidden.** Every rename is journalled and reversible. `autoripper
doctor` explains why a media server is silently ignoring files that look
correct. `SAFETY.md` states exactly what gets changed, moved, and deleted before
you point it at a library you care about.

**It ships no decryption tooling and adds no package repository.** MakeMKV is
proprietary and distributed by its author through a third-party PPA. Adding a
stranger's repository to your machine is the operator's decision, not the
installer's — so the installer reports it missing and stops there. The project
is MIT-licensed orchestration that drives tools you install yourself.

## Is this Automatic Ripping Machine?

No — and if you want ARM, use ARM. It is older, broader, has a web UI and Docker
images, and has an actual community behind it.

autoripper is a smaller, opinionated thing for one situation: a Linux box with
systemd feeding a Plex or Jellyfin library. It is the one to take if measured
identification, reversible renames, and readable systemd units are the things
you care about.
