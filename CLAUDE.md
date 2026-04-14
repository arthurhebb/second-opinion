# Second Opinion — Project Context for Claude Code

## What we're building
A retro-styled medical diagnosis game called **Second Opinion**. The core mechanic: a previous doctor has already seen the patient and made an error. The player reviews the case and must identify what was missed or wrong.

This is an MBBS SSC (Special Study Component) project. It needs to be technically impressive, educationally grounded, and work as a compelling demo.

---

## Game concept

### Core mechanic
- Player receives a patient case: notes, history, investigations, previous doctor's assessment
- The previous doctor's notes are confident and well-written — the error is subtle and buried
- Player must identify the misdiagnosis or missed finding
- Cases are generated dynamically by Claude using NICE guidelines as a knowledge base
- At the end: structured feedback on what went wrong and which cognitive bias caused it

### Entry point variation (rotate between these)
- Inheriting a case mid-clerking — previous doctor took partial history, player spots missing questions
- Reviewing a registrar's decision as the consultant
- Reviewing your own decision from 48 hours ago — patient is back, worse
- Pharmacist perspective — something in the prescription doesn't add up

### Difficulty axes (all configurable, no time pressure)
1. **Presentation clarity** — classic vs atypical presentation
2. **Red herrings** — none / one / multiple plausible distractors
3. **Information availability** — full history upfront vs incomplete/fragmented
4. **Cognitive bias traps** — none / anchoring / multiple stacked biases

### End-of-case feedback
- Which cognitive bias was exploited (anchoring, availability, premature closure etc.)
- Where the fork in the road was
- Confidence calibration: player rates confidence at each key decision, end screen shows where they were confidently wrong
- Session replay: scroll back through decisions with annotations

---

## Visual style
**Retro aesthetic** — think old EHR systems, green-on-black terminal feel, or pixel-art RPG UI. NOT a modern clean SaaS look. The interface should feel like navigating a real clinical system from the early 2000s, or a stylised retro game. Use CSS to achieve this — no image generation needed for UI.

---

## Tech stack

### Core
- **Claude API** (claude-sonnet-4-20250514) — case generation engine + patient/notes character
- **Multi-agent architecture**: one Claude call authors the case (hidden diagnosis, planted errors, red herrings); a separate Claude call plays the patient/characters. They never share context so the game master can't leak the answer.
- **Structured JSON outputs** — case data, vitals, blood results returned as JSON, rendered as EHR-style UI components (troponin in a results table, not a chat bubble)
- **Streaming responses** — patient/character answers stream word by word

### Knowledge base
- **NICE guidelines** — stored as PDFs in Google Drive, fetched via Google Drive MCP before case generation. This means guidelines can be updated without touching code.
- Claude uses the relevant guideline section as grounding when generating each case

### Clinical images (Phase 2)
- **MIMIC-CXR dataset** — subset of ~50-100 curated chest X-rays covering key pathologies (pneumothorax, pleural effusion, pulmonary oedema, pneumonia, normal), stored in Google Drive
- Only used for cases that specifically involve chest X-ray interpretation
- Fetched via Google Drive MCP at runtime
- PhysioNet official credentialing to be completed for clean licensing

### Persistence
- **Artifact persistent storage** (or localStorage equivalent in the app) for:
  - Leaderboard
  - Per-user cognitive bias profile over time
  - Session history

### What we're NOT using (cost reasons)
- No Supabase (free tier limitations for a demo)
- No Gemini image generation API (separate billing from Gemini subscription)
- No external paid APIs beyond Claude

---

## Google Drive MCP integration
- User is connected to Google Drive MCP at `https://drivemcp.googleapis.com/mcp/v1`
- Drive acts as the content management layer: NICE guideline PDFs live here
- Guidelines can be swapped/updated without code changes
- Phase 2: MIMIC-CXR image subset also stored here

### Drive folder structure (to set up)
```
/Second Opinion/
  /guidelines/
    nice-chest-pain.pdf
    nice-sepsis.pdf
    nice-pneumonia.pdf
    [etc]
  /images/
    /chest-xrays/
      pneumothorax/
      pleural-effusion/
      pulmonary-oedema/
      pneumonia/
      normal/
```

---

## Case generation architecture

### Two-agent system
**Agent 1 — Game Master** (never shown to player)
- Receives: relevant NICE guideline section, difficulty settings
- Outputs structured JSON:
```json
{
  "diagnosis": "...",
  "previous_doctor_error": "...",
  "cognitive_bias_planted": "anchoring | availability | premature_closure | ...",
  "patient_history": {...},
  "investigations": {
    "bloods": {"troponin": "...", "CRP": "...", ...},
    "ecg": "...",
    "imaging": "..."
  },
  "previous_doctor_notes": "...",
  "red_herrings": [...],
  "difficulty": {...},
  "reveal": {
    "what_was_missed": "...",
    "nice_guideline_reference": "...",
    "fork_in_the_road": "..."
  }
}
```

**Agent 2 — Patient/Character** (shown to player)
- Receives: only the patient-facing facts (NOT the hidden diagnosis or reveal)
- Plays the patient, or the nurse handing over, or the previous doctor's notes
- Streams responses

### NICE guideline retrieval
Before generating a case, fetch the relevant guideline from Google Drive and inject the key section into Agent 1's system prompt. This grounds the case in real UK clinical pathways.

---

## Suggested starting pathologies / guidelines
- **Sepsis** (NICE NG51) — high stakes, famous misdiagnosis stories, clear pathway
- **Chest pain / ACS** (NICE CG95) — troponin, ECG, risk scores
- **Pulmonary embolism** (NICE NG158) — Wells score, classic missed diagnosis
- **Meningitis** (NICE NG125) — time-critical, devastating when missed

---

## What's still to decide / Phase 2
- Exact UI component breakdown (results viewer, ECG display, obs chart)
- Google Drive folder setup and first guideline PDFs uploaded
- MIMIC-CXR subset curation and Drive upload
- Whether to add a live vitals monitor (patient deteriorates in real time if key decision missed)
- Whether to add multiplayer / shared leaderboard later

---

## First build priorities
1. Core game loop working end-to-end: case generation → player interaction → reveal → feedback
2. Retro EHR UI aesthetic
3. Structured JSON → rendered investigation results (bloods table, basic ECG description)
4. Streaming patient responses
5. Confidence rating at key decision points
6. End-of-case cognitive bias breakdown

Google Drive MCP and image integration come after the core loop is solid.

---

## Project owner context
- MBBS medical student, UK
- Technically oriented, comfortable with APIs, authentication, JSON architecture
- Has Claude Max subscription (API calls free within this)
- Has Gemini subscription (consumer, not API)
- Connected to Google Drive MCP already
- This will be demoed to an SSC panel — needs to look polished and be explainable technically
