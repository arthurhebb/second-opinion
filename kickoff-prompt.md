# Kickoff Prompt — Paste this as your first message in Claude Code

---

I'm building a medical diagnosis game called **Second Opinion** for my MBBS SSC project. I've already designed the full concept with Claude in a separate session — the CLAUDE.md file in this project root has the complete context. Please read it before we start.

Here's a quick summary of what we're building and what I want to do first:

## The game
A retro-styled EHR game where a previous doctor has already seen the patient and made an error. The player reviews the case and identifies what was missed. Cases are generated dynamically by Claude using NICE guidelines. At the end, players get a cognitive bias breakdown of what went wrong.

## Tech stack (already decided)
- Claude API (claude-sonnet-4-20250514) with two-agent architecture — one agent authors the case as a Game Master, a separate agent plays the patient/characters. They never share context.
- Structured JSON outputs rendered as EHR-style UI components
- Streaming responses for character dialogue
- NICE guidelines stored as PDFs in Google Drive, fetched via Google Drive MCP
- Retro aesthetic — old EHR / green terminal / early 2000s clinical system feel
- Persistent storage for leaderboard and cognitive bias profile

## What I want to build first
The core game loop, end to end:
1. Case generation (Game Master agent → structured JSON with hidden diagnosis, planted error, cognitive bias trap)
2. Player receives the case in a retro EHR interface — patient notes, previous doctor's assessment, available investigations
3. Player can request additional information (ask the patient questions, order bloods, request imaging)
4. Player submits their verdict: what was missed, what the correct diagnosis is
5. Reveal screen: what the error was, which cognitive bias caused it, NICE guideline reference
6. Confidence calibration display: where the player was confidently wrong

## What I DON'T want yet
- Google Drive / NICE guideline integration (Phase 2)
- Real chest X-ray images (Phase 2)
- Leaderboard / persistence (Phase 2)

For now, hardcode one or two demo cases so we can build and test the full UI and game loop without needing the Drive integration.

## First task
Set up the project structure and build the core game loop with:
- A working Claude API integration (two-agent system)
- Retro EHR UI
- At least one hardcoded demo case end to end
- Streaming responses
- Confidence rating at key decision points
- End-of-case reveal and cognitive bias breakdown

Please read CLAUDE.md first, then suggest a project structure and start building.
