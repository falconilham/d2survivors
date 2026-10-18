# 🎮 Arcade Vault — Multi-Game Hub

A lightweight, modern web gaming dashboard and arcade hub hosted on **Vercel**, featuring **D2 Survivors** (Vampire Survivors-style Diablo II action RPG) and expandable slots for future web games.

---

## 🌟 Features

- **Multi-Game Dashboard**: Clean, responsive arcade hub with game catalog, tags, and launcher cards.
- **D2 Survivors**: Built on PixiJS and WebGL, featuring all 7 Diablo II classes (Amazon, Barbarian, Sorceress, Paladin, Necromancer, Druid, Assassin).
- **Party Mode Ready**: Modified to support multi-character companion party gameplay.
- **Zero-Config Vercel Hosting**: Standard static architecture with `vercel.json` routing rules for instant deployment.

---

## 🚀 Deploy to Vercel

### Option 1: Automatic Git Deployment (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import this repository: `falconilham/d2survivors`.
3. Set **Framework Preset** to **Other** (or Static).
4. Click **Deploy**.

### Option 2: Deploy using Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 📁 Project Structure

```
├── index.html                   # Main Arcade Dashboard / Game Hub
├── vercel.json                  # Vercel routing and cache rules
├── package.json
└── games/
    └── d2-survivors/            # D2 Survivors Web Game
        ├── index.html           # Redirect to play
        ├── play/
        │   └── index.html       # Game Canvas & HUD
        ├── setup/
        │   └── index.html       # MPQ file setup & extractor
        ├── assets/              # PixiJS + Game logic bundle
        └── site.json
```

---

## ➕ Adding More Games

To add another game to the dashboard:
1. Create a new directory under `games/<your-game-name>/`.
2. Place the web game files inside (with an `index.html`).
3. Add a new game card in the `games-grid` section of `index.html`.

---

## 📜 Disclaimer
Fan project. Diablo II® is a registered trademark of Blizzard Entertainment, Inc.
