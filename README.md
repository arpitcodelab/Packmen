# Packmen

A high-quality, free and open-source browser-based arcade maze chase game built with TypeScript, Vite, and Phaser 3.

## Features
- **Faithful Arcade Physics**: Strict 28×31 tile grid, tile-center decision model, continuous buffered turning, and tunnel wrapping.
- **Ghost Personalities**: Unique AI for Blinky, Pinky, Inky, and Clyde with scatter/chase timers and frightened mode.
- **Dual Engine Architecture**: Engine-agnostic, pure TypeScript simulation in `src/core/` and Phaser 3 rendering in `src/view/`.
- **Responsive Presentation**: Logical resolution of 224×288 with integer scaling and retro arcade typography.

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```

## Milestone Status
- [x] **M0: Project Setup & Canvas** (Complete)
- [ ] **M1: Maze & Player Movement**
- [ ] **M2: Dots, Score & HUD**
- [ ] **M3: Blinky Ghost Engine**
- [ ] **M4: 4 Ghosts & Modes**
- [ ] **M5: Frightened & House Release**
- [ ] **M6: Levels & Fruit**
- [ ] **M7: Audio**
- [ ] **M8: Screens & Controls**
- [ ] **M9: Polish & PWA**
