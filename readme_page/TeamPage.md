# Team page (home)

**Route:** `/` (index, protected)  
**Source:** `src/pages/TeamPage.tsx`  
**Data:** `src/data/team.ts` — exports `teamIntro`, `teamMembers`

## Purpose

After login, this is the default landing screen: explains the fire & safety team role and lists contacts in cards.

## UI structure

| Section | Content source |
|---------|----------------|
| **Header** | `teamIntro.title` (h1), `teamIntro.subtitle` (muted line), `teamIntro.body` (paragraph). |
| **Member list** | One `<li>` card per entry in `teamMembers`; **`key={m.role}`** (roles must stay unique in data). |

## Card fields (per `TeamMember`)

Each card shows:

| Field | Semantics |
|-------|-----------|
| **Role** | `m.role` — rendered as red-tinted heading (`h2`). |
| **Name** | `m.name` — bold body text. |
| **Contact** | `m.contact` — free text (emails/phones as a single string today). |
| **Notes** | `m.notes` — smaller descriptive paragraph. |

## Current data snapshot (POC placeholders)

**Intro** (`teamIntro`):

- **title:** `Fire & Safety Team`
- **subtitle:** `Jalsa Salana 2026 · 24–26 July · Islamabad, UK`
- **body:** Short paragraph pointing users to rota, incident reports, and site map.

**Roster** (`teamMembers`): three entries — Fire Safety Lead (Person A), Deputy Lead (Person B), Site Liaison (Person C) with example emails and `07xxx` phone strings.

**When you edit `team.ts`, replace the snapshot above in this README** so the guide matches production copy.

## Interactions

- No buttons, forms, or dropdowns; read-only.

## POC limitations & likely adjustments

- Pull roster from a managed source; avoid redeploy for name/phone changes.
- Consider masking phone numbers or using “tap to reveal” for privacy.
- If `role` stops being unique, change React `key` to something stable (e.g. id).
