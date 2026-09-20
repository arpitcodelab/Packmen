# PRD — Packmen (working title): A High-Quality Browser Pac-Man-Style Game

> **Audience:** an AI-assisted IDE (Cursor, Claude Code, Copilot, Windsurf, etc.) and a beginner game developer.
> **Read with:** `Architecture.md` (how to build it). This file says **what** to build and **how it must behave**.
> **Rule for the IDE:** implement milestone by milestone (Section 12). Do not skip ahead. After each milestone, the game must run and its "Done when" checks must pass.

---

## 1. Product Overview

A free, open-source, browser-based maze-chase arcade game modeled on the classic Pac-Man gameplay loop, matching the "no fuss, instant play" feel of https://freepacman.org/:

- Opens in the browser, one click to play, no sign-up, no ads, no install.
- Works with keyboard on desktop and touch (swipe + on-screen D-pad) on phones/tablets.
- Faithful arcade mechanics (grid movement, four distinct ghost personalities, scatter/chase cycles, frightened mode, fruit, escalating levels), with a polished, modern presentation layer (crisp pixel art, smooth animation, juicy audio, responsive scaling).

**Working title:** `Packmen`. Keep the title in one config constant (`GAME_TITLE`) so it can be renamed (see Section 5, Legal).

## 2. Goals and Non-Goals

### Goals
1. Feel like a real arcade Pac-Man: tight controls, correct ghost behavior, correct scoring.
2. 60 FPS on mid-range phones and any modern desktop browser.
3. Built only with free, open-source tools and freely licensed (or self-made) assets.
4. Clean, modular, tested code that a beginner can read, tweak, and extend.
5. Deployable as a static site (GitHub Pages / Netlify / itch.io) and installable as a PWA.

### Non-Goals (v1)
- Online multiplayer, accounts, global leaderboards (local high score only).
- Monetization, ads, analytics that track users.
- Level editor UI (levels are data files).
- Native mobile app store builds.

## 3. Reference Analysis: freepacman.org

**How it was analyzed:** the site renders its game with JavaScript, so only the HTML shell and metadata were directly readable. The rest of this section combines those observations with the well-documented behavior of the classic arcade game. Do **not** copy the site's code, sprites or audio; it is © FreeVideoGames.org. Use it as a UX/behavior reference only.

### Observed on the site
| Area | Observation | Implication for us |
|---|---|---|
| Entry | Single **PLAY** button over a logo and backdrop image | Minimal start screen, one primary action |
| HUD | **1UP** score and **HIGH SCORE** shown at top of the playfield | Classic arcade HUD, retro font |
| Controls | Keyboard arrows plus on-screen **up/down/left/right arrows** (touch) | Support both; show touch D-pad only on touch devices |
| Pause | Dedicated **pause** button and a **PAUSED** overlay | Pause button + `P`/`Esc` key |
| Maze art | Maze is a blue **SVG** sprite in a "spriteSheets" folder | Vector or crisp pixel maze scaled cleanly |
| Loading | Preloads images/sounds; friendly **"OOPS! unable to load images/sounds"** message on failure | Preloader with graceful error screen |
| Mobile | `apple-mobile-web-app-capable`, viewport meta, black theme color | Ship as a PWA, black background, no zoom/scroll |
| Positioning | "No fuss, 100% free" | No ads, no signup, instant start |
| Other | Notes that some sibling games "require keyboard" | We do better: full touch support |

### Taken from classic arcade behavior (the spec in Section 7)
Grid-based maze, wrap-around tunnel, 4 ghosts with distinct targeting, scatter/chase timers, energizers that frighten ghosts, escalating ghost-eat points, bonus fruit, extra life at 10,000, speed tables per level.

## 4. Target Users and Platforms

- **Users:** casual players who want instant retro fun; secondary: developers learning from clean open-source code.
- **Platforms:** latest 2 versions of Chrome, Edge, Firefox, Safari (desktop), Chrome Android, Safari iOS.
- **Screens:** 360px wide phones up to 4K desktop. Portrait and landscape.
- **Input:** keyboard, touch (swipe + D-pad), gamepad (P1 nice-to-have).

## 5. Legal / IP Notes (important)

- "PAC-MAN", the character, ghost designs/names, sounds and the exact maze are trademarks/copyrights of Bandai Namco. Gameplay mechanics themselves are not protected, but branding and assets are.
- **For personal learning:** fine. **For public release:** use an original title, original character art, original ghost designs/names, and original audio. Keep everything overridable via config and asset folders so re-skinning is trivial.
- Keep an `ASSETS_LICENSES.md` listing every third-party asset, its author and license. Use only CC0, CC-BY (with credit) or MIT/OFL assets.
- The maze layout must be an **original design** that obeys the structural rules in 7.1 (a validator enforces them).

## 6. Feature Requirements

Priority: **P0** = must ship in v1, **P1** = should ship in v1, **P2** = later.

### 6.1 Core Gameplay
| ID | Requirement | Pri |
|---|---|---|
| G-01 | Grid maze, 28×31 playable tiles; player moves continuously along corridors, turning at intersections | P0 |
| G-02 | Buffered input: a turn pressed slightly early is remembered and executed at the next possible tile center | P0 |
| G-03 | Player can reverse direction instantly at any time | P0 |
| G-04 | Player stops when facing a wall; resumes when a valid direction is pressed | P0 |
| G-05 | Wrap-around side tunnel (player and ghosts), ghosts slow down inside it | P0 |
| G-06 | Dots (10 pts) and 4 energizers (50 pts); level completes when all are eaten | P0 |
| G-07 | 4 ghosts with distinct AI personalities (7.4) | P0 |
| G-08 | Ghost modes: scatter, chase, frightened, eaten (7.5–7.7) | P0 |
| G-09 | Ghost house with staged release rules (7.8) | P0 |
| G-10 | Bonus fruit twice per level (7.10) | P0 |
| G-11 | 3 starting lives, extra life at 10,000 points (once) | P0 |
| G-12 | Level progression with the speed/timer table (7.9) | P0 |
| G-13 | Slight speed penalty for eating dots, ghost-eat freeze, death animation (7.11) | P1 |
| G-14 | "Cruise Elroy" behavior for the red ghost (7.9) | P1 |
| G-15 | Faithful quirks toggle (`authenticBugs`) for the pink/cyan ghost targeting overflow bug | P2 |
| G-16 | Intermission cutscenes after levels 2, 5, 9 (original art) | P2 |

### 6.2 Screens and Flow
| ID | Requirement | Pri |
|---|---|---|
| U-01 | **Boot/Preload** screen with progress bar and friendly error state if assets fail | P0 |
| U-02 | **Title/Menu** with PLAY, high score, mute toggle | P0 |
| U-03 | **READY!** intro before every life/level (~2 s) | P0 |
| U-04 | **In-game HUD:** 1UP score, HIGH SCORE, lives icons, fruit/level indicators | P0 |
| U-05 | **Pause** via button, `P`, or `Esc`; overlay text "PAUSED"; auto-pause when tab loses focus | P0 |
| U-06 | **Game Over** screen with score, "NEW HIGH SCORE" state, PLAY AGAIN | P0 |
| U-07 | Level-complete maze flash animation | P1 |
| U-08 | Settings: master volume, mute, (optional) CRT filter toggle | P1 |
| U-09 | Credits screen listing asset licenses | P1 |

### 6.3 Controls
| ID | Requirement | Pri |
|---|---|---|
| C-01 | Keyboard: Arrow keys and WASD; `P`/`Esc` pause; `M` mute; `Enter`/`Space` start | P0 |
| C-02 | Touch: swipe anywhere on the game area sets direction (min swipe distance ~24 px) | P0 |
| C-03 | Touch: on-screen D-pad shown only on touch devices, toggleable | P1 |
| C-04 | Gamepad D-pad/left stick support | P2 |
| C-05 | Prevent page scroll/zoom/text-selection/context menu during play on touch devices | P0 |

### 6.4 Audio
| ID | Requirement | Pri |
|---|---|---|
| A-01 | Sound effects: dot-eat (alternating two tones), energizer, ghost-eat, fruit-eat, death, extra life, level start jingle | P0 |
| A-02 | Looping siren that speeds up as dots decrease; frightened loop; "eyes returning" loop | P1 |
| A-03 | Audio unlocks on first user gesture (browser autoplay policy) | P0 |
| A-04 | Mute toggle persisted in localStorage | P0 |

### 6.5 Persistence
| ID | Requirement | Pri |
|---|---|---|
| S-01 | High score saved in `localStorage` (guarded with try/catch for private mode) | P0 |
| S-02 | Settings (mute, volume) saved | P1 |

### 6.6 Platform
| ID | Requirement | Pri |
|---|---|---|
| P-01 | Responsive scaling: keep aspect ratio, integer scaling when possible, letterbox in black | P0 |
| P-02 | PWA: manifest + service worker, installable, works offline after first load | P1 |
| P-03 | Static build deployable to GitHub Pages | P0 |
| P-04 | Respect `prefers-reduced-motion` (disable screen flash effects) | P2 |

## 7. Game Rules Specification

> All numbers below live in data/config files (`src/data/*`), never hard-coded in logic, so they can be tuned. Values in the level table are the widely documented arcade values (see "Pac-Man Dossier" by Jamey Pittman); treat them as tunable defaults and verify against that reference if something feels off.

### 7.1 Maze
- Grid: **28 columns × 31 rows** of playable tiles. Tile size in game pixels: **8**. Full screen incl. HUD: **224 × 288** logical pixels (28×36 tiles).
- Defined as an ASCII map in `src/data/maze.classic.ts` with this legend:
  - `#` wall, `.` dot, `o` energizer, ` ` empty walkable, `-` ghost-house door (ghosts only), `T` tunnel tile (slow zone for ghosts), `P` player start, `1 2 3 4` ghost starts (Blinky, Pinky, Inky, Clyde), `F` fruit spawn tile, `X` no-upturn intersection for ghosts (the 2 tiles above the ghost house entrance and the 2 tiles near the bottom-middle in the classic design).
- **Structural rules the validator must enforce** (`npm run validate:maze`):
  1. Exactly 28 columns and 31 rows, left/right mirror-symmetric.
  2. Exactly 4 energizers, one per quadrant.
  3. Total collectible pellets = 244 (240 dots + 4 energizers) in the default maze.
  4. Every walkable tile is reachable from the player start (no isolated regions).
  5. A wrap tunnel exists on one row, open at both edges.
  6. Exactly one ghost house with a door; ghosts can leave it.
  7. Corridors are 1 tile wide; no 2×2 fully open blocks (keeps grid movement classic).
- The maze must be an **original layout** in the classic style. Multiple mazes/levels are P2.

### 7.2 Player Movement
- Position stored in pixels; decisions made when the center of the player crosses a tile center.
- Base speed (100%) = **75.75 px/s** (at 8 px tiles). Actual speed = base × level multiplier (7.9).
- Input buffering: store the last requested direction; at each tile center, if that direction is open, take it; else continue straight if open; else stop.
- Reversal is always allowed immediately (mid-tile).
- Eating a dot pauses the player for **1 frame** (60 fps basis); an energizer for **3 frames** (P1).
- Optional cornering feel: player is allowed to start a turn up to ~1 px before the tile center (P2).

### 7.3 Collision
- Player collides with a ghost when both occupy the **same tile** (compare tile coordinates, not pixels).
- If the ghost is frightened → ghost is eaten. Otherwise → player dies.
- Check collisions after each movement step for player and ghosts to avoid pass-through at high speed.

### 7.4 Ghost Personalities (targeting in **chase** mode)
Each ghost picks a **target tile**; movement decides direction by minimizing distance to it (7.6).

| Ghost | Classic role | Chase target |
|---|---|---|
| **Blinky** (red) | Chaser | Player's current tile |
| **Pinky** (pink) | Ambusher | 4 tiles ahead of the player's facing direction. (With `authenticBugs`, when the player faces up, also 4 tiles left.) |
| **Inky** (cyan) | Flanker | Take the tile 2 ahead of the player, draw a vector from Blinky to it, double it; target is the resulting tile. (Same up-facing bug applies with `authenticBugs`.) |
| **Clyde** (orange) | Shy | If distance to player > 8 tiles → player's tile; otherwise → his scatter corner |

Names/colors are configurable so a re-skin can rename them.

**Scatter corner targets** (unreachable tiles outside the maze corners): Blinky top-right, Pinky top-left, Inky bottom-right, Clyde bottom-left.

### 7.5 Ghost Modes and Timers
- **Scatter / Chase cycle** (global timer, in seconds, paused during frightened):
  - Level 1: scatter 7, chase 20, scatter 7, chase 20, scatter 5, chase 20, scatter 5, chase forever.
  - Levels 2–4: 7, 20, 7, 20, 5, 1033, 1/60 (one frame), then chase forever.
  - Levels 5+: 5, 20, 5, 20, 5, 1037, 1/60, then chase forever.
- **On every mode switch** (scatter↔chase), ghosts reverse direction immediately (except ghosts in the house or eaten).
- **Frightened:** triggered by an energizer. All ghosts not already eaten turn blue and reverse direction. At intersections they choose **random** valid directions (no reversing). Duration from the level table; flash warning for the last 5 flashes (or the level's flash count). Ghost-eat chain: 200 → 400 → 800 → 1600 per energizer.
- **Eaten:** only the eyes remain, move at fast speed back to the ghost-house entrance, enter, then exit as normal.

### 7.6 Ghost Movement Rules
- Ghosts move tile to tile; at each **tile center** they decide their next direction.
- They can **never reverse** by choice (only on forced mode switch).
- Candidate directions exclude walls and the reverse direction. In normal chase/scatter, candidates also exclude **up** on `X` tiles.
- Choose the candidate whose next tile has the smallest **squared Euclidean distance** to the target. Tie-break priority: **Up, Left, Down, Right**.
- Ghost door tiles are walkable only when leaving/entering the house.
- In tunnel tiles, ghost speed uses the tunnel multiplier.

### 7.7 Ghost House
- Blinky starts outside, above the house. Pinky starts inside center and leaves immediately. Inky (left) and Clyde (right) wait.
- Release uses **personal dot counters** (a dot eaten increments the counter of the preferred ghost in order Pinky → Inky → Clyde):

| Level | Pinky | Inky | Clyde |
|---|---|---|---|
| 1 | 0 | 30 | 60 |
| 2 | 0 | 0 | 50 |
| 3+ | 0 | 0 | 0 |

- **Fallback timer:** if the player doesn't eat a dot for **4 s** (levels 1–4) / **3 s** (levels 5+), release the next waiting ghost.
- After losing a life, use the classic **global dot counter** release (Pinky 7, Inky 17, Clyde 32) until Clyde leaves (P1); then return to personal counters.

### 7.8 Speed and Level Table (defaults; % of base 75.75 px/s)

| Level | Fruit | Pac | Ghost | Ghost tunnel | Elroy-1 dots left / speed | Elroy-2 dots left / speed | Pac frightened | Ghost frightened | Fright secs | Flashes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Cherry | 80 | 75 | 40 | 20 / 80 | 10 / 85 | 90 | 50 | 6 | 5 |
| 2 | Strawberry | 90 | 85 | 45 | 30 / 90 | 15 / 95 | 95 | 55 | 5 | 5 |
| 3 | Orange | 90 | 85 | 45 | 40 / 90 | 20 / 95 | 95 | 55 | 4 | 5 |
| 4 | Orange | 90 | 85 | 45 | 40 / 90 | 20 / 95 | 95 | 55 | 3 | 5 |
| 5 | Apple | 100 | 95 | 50 | 40 / 100 | 20 / 105 | 100 | 60 | 2 | 5 |
| 6 | Apple | 100 | 95 | 50 | 50 / 100 | 25 / 105 | 100 | 60 | 5 | 5 |
| 7 | Melon | 100 | 95 | 50 | 50 / 100 | 25 / 105 | 100 | 60 | 2 | 5 |
| 8 | Melon | 100 | 95 | 50 | 50 / 100 | 25 / 105 | 100 | 60 | 2 | 5 |
| 9 | Galaxian | 100 | 95 | 50 | 60 / 100 | 30 / 105 | 100 | 60 | 1 | 3 |
| 10 | Galaxian | 100 | 95 | 50 | 60 / 100 | 30 / 105 | 100 | 60 | 5 | 5 |
| 11 | Bell | 100 | 95 | 50 | 60 / 100 | 30 / 105 | 100 | 60 | 2 | 5 |
| 12 | Bell | 100 | 95 | 50 | 80 / 100 | 40 / 105 | 100 | 60 | 1 | 3 |
| 13 | Key | 100 | 95 | 50 | 80 / 100 | 40 / 105 | 100 | 60 | 1 | 3 |
| 14 | Key | 100 | 95 | 50 | 80 / 100 | 40 / 105 | 100 | 60 | 3 | 5 |
| 15–16 | Key | 100 | 95 | 50 | 100 / 100 | 50 / 105 | 100 | 60 | 1 | 3 |
| 17 | Key | 100 | 95 | 50 | 100 / 100 | 50 / 105 | — | — | 0 | 0 |
| 18 | Key | 100 | 95 | 50 | 100 / 100 | 50 / 105 | 100 | 60 | 1 | 3 |
| 19–20 | Key | 100 | 95 | 50 | 120 / 100 | 60 / 105 | — | — | 0 | 0 |
| 21+ | Key | 90 | 95 | 50 | 120 / 100 | 60 / 105 | — | — | 0 | 0 |

- **Cruise Elroy (P1):** when dots remaining ≤ threshold, Blinky speeds up (Elroy-1, then Elroy-2) and keeps chasing the player even during scatter mode. Elroy is suspended after a life is lost until Clyde leaves the house.
- When fright time is 0, energizers still score 50 and ghosts reverse but do not turn blue.

### 7.9 Scoring
| Event | Points |
|---|---|
| Dot | 10 |
| Energizer | 50 |
| Ghost (1st / 2nd / 3rd / 4th in a single energizer) | 200 / 400 / 800 / 1600 |
| Cherry / Strawberry / Orange / Apple | 100 / 300 / 500 / 700 |
| Melon / Galaxian / Bell / Key | 1000 / 2000 / 3000 / 5000 |
| Extra life | at 10,000 points, once |

Ghost-eaten score pops up at the ghost's position; game freezes ~1 s (only the eaten ghost disappears and the popup shows).

### 7.10 Bonus Fruit
- Appears at the `F` tile when **70** dots and again when **170** dots have been eaten in a level.
- Stays for a random 9–10 seconds, then disappears. Score popup on collection.
- Fruit type by level per the table above; the HUD shows the last 7 fruits (bottom right).

### 7.11 Lives, Death and Flow
1. **Level start:** show `READY!` (~2 s, no movement), play jingle on first level of a game.
2. **Playing.**
3. **Pac dies:** everything freezes ~1 s, ghosts disappear, death animation (~1.5 s), lose a life.
4. **Lives > 0:** reset positions (dots stay), `READY!`, continue. **Lives = 0:** `GAME OVER`, save high score.
5. **Level cleared:** freeze ~1 s, maze flashes ~4 times, next level, dots reset, `READY!`.

## 8. UX and Visual Design

- **Logical resolution:** 224×288, rendered with `pixelArt: true`, integer scaling where possible, black letterbox background.
- **Style:** crisp retro pixel art, deep navy/blue neon maze outlines, high-contrast sprites, bold retro font ("Press Start 2P", SIL OFL).
- **Animation:** player mouth chomp (3 frames), ghost wobble (2 frames), eyes look toward movement direction, frightened blue with white flash, energizer blink (~4 Hz), death spin, fruit bounce popup.
- **Juice (P1):** subtle screen shake on death, soft CRT scanline overlay toggle, particle sparkle on energizer.
- **Accessibility:** color-blind friendly ghost distinction (shape/eyes plus color), mute toggle, reduced-motion respect, minimum touch target 44 px.
- **Layout (portrait phone):** game area centered; D-pad below it; pause button top-right.

## 9. Recommended Open-Source Tech and Assets (summary)

Details in `Architecture.md`.

| Need | Tool | License |
|---|---|---|
| Language/build | TypeScript, Vite | MIT |
| Game framework | Phaser 3 | MIT |
| Unit tests | Vitest | MIT |
| Lint/format | ESLint, Prettier | MIT |
| Pixel art | LibreSprite or Piskel (free) | GPL / MIT |
| Sound effects | jsfxr / sfxr (retro SFX generator), Audacity | Public domain / GPL |
| Music/SFX packs | Kenney.nl, OpenGameArt.org (filter CC0/CC-BY) | CC0 / CC-BY |
| Font | Press Start 2P (Google Fonts) | OFL |
| Hosting | GitHub Pages / Netlify / itch.io | Free tier |

## 10. Non-Functional Requirements

- **Performance:** steady 60 FPS; no per-frame allocations in hot paths (reuse vectors); <100 ms input latency.
- **Load:** first load under 3 s on 4G; total assets ≤ 5 MB; gzip'd JS bundle ≤ 500 KB.
- **Reliability:** game state machine can never soft-lock; window blur → auto-pause; tab-switch delta capped to prevent teleporting.
- **Determinism:** simulation runs on a fixed 60 Hz timestep independent of display refresh rate (see Architecture) so gameplay is identical on 60/120/144 Hz screens.
- **Code quality:** strict TypeScript, no `any`, ESLint clean, core logic unit-tested (target ≥80% coverage for `src/core`).
- **Privacy:** no cookies, no third-party trackers.

## 11. Success Criteria

- A new player understands how to play within 10 seconds.
- All four ghosts visibly behave differently.
- Full level-1 playthrough works with correct scoring; levels 1–21+ run without crashes.
- Lighthouse: Performance ≥ 90, PWA installable, Accessibility ≥ 90 on the menu page.
- Works with keyboard, touch and (P2) gamepad.

## 12. Milestones (build in this order)

| # | Milestone | Done when |
|---|---|---|
| M0 | **Project setup:** Vite + TS + Phaser + ESLint + Vitest, "hello" scene scaled correctly | `npm run dev` shows a black 224×288 scaled canvas; `npm test` passes |
| M1 | **Maze + player movement:** ASCII maze parsed, drawn, validator passes, player moves with buffered turns and tunnel wrap | Player never enters walls, turns feel smooth, tunnel wraps |
| M2 | **Dots, score, HUD:** dots/energizers, score, high score, level-clear detection | Eating all pellets triggers level complete; score correct |
| M3 | **Blinky only:** ghost movement engine, targeting, no-reverse and no-up rules, collisions, death and lives | Blinky chases correctly, player can die, lives decrement |
| M4 | **All four ghosts + scatter/chase timers** | Ghosts visibly differ; mode switches reverse ghosts |
| M5 | **Frightened + eaten + ghost house release logic** | Energizer chain scoring 200/400/800/1600; eyes return; dot counters release ghosts |
| M6 | **Levels, fruit, extra life, Elroy, speed tables** | Level table drives speeds; fruit spawns at 70/170 dots |
| M7 | **Audio** | All SFX/loops play; unlock on first gesture; mute persisted |
| M8 | **Screens and controls:** boot, menu, READY, pause, game over, swipe + D-pad, responsive polish | Full flow playable on desktop and phone |
| M9 | **Polish, PWA, deploy:** animations, juice, credits, manifest/service worker, GitHub Pages workflow, Lighthouse pass | Public URL works offline after first visit |
| M10 (P2) | Gamepad, intermissions, `authenticBugs`, extra mazes | — |

## 13. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Ghost AI "feels wrong" | Implement exactly as in 7.4–7.6; unit-test target selection and tie-breaks with fixed scenarios |
| Movement jitter / corner-cutting | Tile-center decision model + fixed timestep + input buffering |
| Trademark/asset problems on release | Original names/art/audio; config-driven re-skin; `ASSETS_LICENSES.md` |
| Mobile audio blocked | Unlock on first pointer/key event |
| Scope creep for a beginner | Milestone gating; P2 items only after M9 |

## 14. Glossary
- **Tile:** one 8×8 px grid cell. **Tile center:** the point where movement decisions occur.
- **Energizer:** big pellet that frightens ghosts. **Scatter:** ghosts head to their corners. **Chase:** ghosts hunt the player.
- **Elroy:** speed-up state of the red ghost when few dots remain.
