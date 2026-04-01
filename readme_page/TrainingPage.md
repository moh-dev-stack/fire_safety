# Training hub & fire extinguisher module

**Routes:** `/training` (index), `/training/fire-extinguishers` (reading + quiz) — protected, inside `AppLayout`.  
**Feature toggle:** `src/config/features.ts` → `ENABLE_TRAINING_MODULE`; set `VITE_ENABLE_TRAINING=false` to hide routes and nav.  
**Sources:** `src/pages/TrainingPage.tsx`, `src/pages/TrainingFireExtinguishersPage.tsx`, `src/data/trainingFireExtinguishers.ts`  
**Assets:** `public/training/*.svg` — extinguishers + fire triangle diagram  

## Purpose

Short on-site refreshers. The extinguisher module covers UK-style fire classes, the **fire triangle**, one stylised image per major extinguisher type, cautions, and **exactly five** multiple-choice questions scored on the client.

## Quiz behaviour

- All five questions must be answered before **Submit answers**.
- After submit: score line, rationale per question (whether correct or not), optional **Try again**.
- Last score may be stored in `localStorage` under `fire-safety-training-extinguishers-last-score-v1` (ISO timestamp + score + total).

## Deep spec

[`plan/TrainingModule.md`](../plan/TrainingModule.md)
