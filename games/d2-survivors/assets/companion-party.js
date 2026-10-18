// D2 Survivors: Custom Party Selection & Companion Engine
// Allows players to assemble an AI companion party (up to 2 heroes) that follows and casts skills.

(function () {
  'use strict';

  const STORAGE_KEY = 'd2s_custom_party_v1';

  const HERO_PROFILES = {
    none: {
      id: 'none',
      name: 'None',
      title: 'Solo Slot',
      color: '#6b7280',
      glow: 'transparent',
      icon: '✖',
      description: 'Leave this slot empty for a smaller party or solo gameplay.',
      skills: []
    },
    sorceress: {
      id: 'sorceress',
      name: 'Sorceress',
      title: 'Archmage of Elements',
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.45)',
      icon: '🧙‍♀️',
      description: 'Casts Frozen Orb, Blizzard, and Fireball to annihilate swarms.',
      skills: [
        { id: 'frozenOrb', cooldown: 2.8, name: 'Frozen Orb' },
        { id: 'fireBall', cooldown: 1.2, name: 'Fireball' },
        { id: 'blizzard', cooldown: 5.0, name: 'Blizzard' }
      ]
    },
    paladin: {
      id: 'paladin',
      name: 'Paladin',
      title: 'Holy Crusader',
      color: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.45)',
      icon: '🛡️',
      description: 'Spawns whirling Blessed Hammers and strikes with Holy Bolt.',
      skills: [
        { id: 'blessedHammer', cooldown: 1.6, name: 'Blessed Hammer' },
        { id: 'holyBolt', cooldown: 1.0, name: 'Holy Bolt' },
        { id: 'fistOfTheHeavens', cooldown: 4.5, name: 'Fist of the Heavens' }
      ]
    },
    barbarian: {
      id: 'barbarian',
      name: 'Barbarian',
      title: 'Berserker Warlord',
      color: '#f87171',
      glow: 'rgba(248, 113, 113, 0.45)',
      icon: '⚔️',
      description: 'Whirlwinds through demon packs, stuns targets, and shouts War Cry.',
      skills: [
        { id: 'whirlwind', cooldown: 2.5, name: 'Whirlwind' },
        { id: 'warCry', cooldown: 3.2, name: 'War Cry' },
        { id: 'stun', cooldown: 1.4, name: 'Stun' }
      ]
    },
    necromancer: {
      id: 'necromancer',
      name: 'Necromancer',
      title: 'Lord of the Dead',
      color: '#34d399',
      glow: 'rgba(52, 211, 153, 0.45)',
      icon: '💀',
      description: 'Fires piercing Bone Spears, Teeth shards, and releases Poison Nova.',
      skills: [
        { id: 'boneSpear', cooldown: 1.6, name: 'Bone Spear' },
        { id: 'teeth', cooldown: 0.9, name: 'Teeth' },
        { id: 'poisonNova', cooldown: 4.2, name: 'Poison Nova' }
      ]
    },
    amazon: {
      id: 'amazon',
      name: 'Amazon',
      title: 'Master Sharpshooter',
      color: '#a78bfa',
      glow: 'rgba(167, 139, 250, 0.45)',
      icon: '🏹',
      description: 'Rains Multiple Shot, homing Guided Arrows, and Lightning Fury.',
      skills: [
        { id: 'multipleShot', cooldown: 1.5, name: 'Multiple Shot' },
        { id: 'guidedArrow', cooldown: 1.0, name: 'Guided Arrow' },
        { id: 'lightningFury', cooldown: 3.5, name: 'Lightning Fury' }
      ]
    },
    assassin: {
      id: 'assassin',
      name: 'Assassin',
      title: 'Shadow Trapmaster',
      color: '#fb7185',
      glow: 'rgba(251, 113, 133, 0.45)',
      icon: '🥷',
      description: 'Deploys Lightning Sentry traps and fires Psychic Hammer pulses.',
      skills: [
        { id: 'lightningSentry', cooldown: 2.6, name: 'Lightning Sentry' },
        { id: 'psychicHammer', cooldown: 1.3, name: 'Psychic Hammer' },
        { id: 'fireTrauma', cooldown: 2.0, name: 'Fire Blast' }
      ]
    },
    druid: {
      id: 'druid',
      name: 'Druid',
      title: 'Keeper of Storms',
      color: '#4ade80',
      glow: 'rgba(74, 222, 128, 0.45)',
      icon: '🐻',
      description: 'Summons violent Tornadoes, Twisters, and scorching Firestorms.',
      skills: [
        { id: 'tornado', cooldown: 2.2, name: 'Tornado' },
        { id: 'twister', cooldown: 1.1, name: 'Twister' },
        { id: 'firestorm', cooldown: 2.8, name: 'Firestorm' }
      ]
    }
  };

  // 1. Storage Helpers
  function getPartyConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          companion1: parsed.companion1 ?? 'sorceress',
          companion2: parsed.companion2 ?? 'paladin'
        };
      }
    } catch (e) {
      console.warn('Could not read party config:', e);
    }
    return { companion1: 'sorceress', companion2: 'paladin' };
  }

  function savePartyConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Could not save party config:', e);
    }
  }

  // 2. Active Companions Engine State
  let activeCompanions = [];
  let currentRunId = -1;

  function initCompanionsForRun(game) {
    // Clear previous
    if (activeCompanions.length) {
      for (const comp of activeCompanions) {
        if (comp.container && comp.container.parent) {
          comp.container.parent.removeChild(comp.container);
        }
      }
    }
    activeCompanions = [];

    const config = getPartyConfig();
    const player = game.world?.player;
    if (!player) return;

    const slots = [
      { key: config.companion1, offsetX: -45, offsetY: -20 },
      { key: config.companion2, offsetX: 45, offsetY: -20 }
    ];

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.key || slot.key === 'none') continue;
      const hero = HERO_PROFILES[slot.key];
      if (!hero) continue;

      // Create companion instance
      const comp = {
        id: hero.id,
        name: hero.name,
        profile: hero,
        x: player.x + slot.offsetX,
        y: player.y + slot.offsetY,
        offsetX: slot.offsetX,
        offsetY: slot.offsetY,
        skills: hero.skills.map(s => ({ ...s, timer: Math.random() * s.cooldown })),
        container: null
      };

      // Create Visual Sprite Container in Pixi
      try {
        if (typeof PIXI !== 'undefined' || game.layer) {
          // In this bundle, Pixi Container is available on game.layer.constructor
          const ContainerClass = game.layer.constructor;
          const container = new ContainerClass();

          // Base halo circle
          const canvas = document.createElement('canvas');
          canvas.width = 44;
          canvas.height = 44;
          const ctx = canvas.getContext('2d');
          
          // Outer glow ring
          ctx.beginPath();
          ctx.arc(22, 22, 18, 0, Math.PI * 2);
          ctx.strokeStyle = hero.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = hero.color;
          ctx.shadowBlur = 10;
          ctx.stroke();

          // Inner filled circle
          ctx.beginPath();
          ctx.arc(22, 22, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10, 12, 16, 0.85)';
          ctx.fill();

          // Icon / Class letter
          ctx.fillStyle = hero.color;
          ctx.font = 'bold 14px Cinzel, Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 4;
          ctx.fillText(hero.name[0], 22, 22);

          // Create Texture from Canvas
          const texture = (game.art?.player?.constructor || Object.getPrototypeOf(game.ground.view).constructor)
            ? (window.PIXI?.Texture?.from ? window.PIXI.Texture.from(canvas) : null)
            : null;

          if (texture) {
            const SpriteClass = game.ground.view.constructor;
            const sprite = new SpriteClass(texture);
            sprite.anchor.set(0.5, 0.5);
            container.addChild(sprite);
          }

          container.position.set(comp.x, comp.y);
          container.zIndex = comp.y;
          game.layer.addChild(container);
          comp.container = container;
        }
      } catch (err) {
        console.warn('Could not attach companion sprite:', err);
      }

      activeCompanions.push(comp);
    }
  }

  // 3. Companion Frame Update Hook
  window.__d2s_tick_companions = function (game, dt) {
    const world = game.world;
    if (!world || !world.player || game.state !== 'playing') return;

    if (game.runId !== currentRunId) {
      currentRunId = game.runId;
      initCompanionsForRun(game);
    }

    if (!activeCompanions.length) return;

    const player = world.player;

    for (const comp of activeCompanions) {
      // 1. Follow Movement Physics
      const targetX = player.x + comp.offsetX;
      const targetY = player.y + comp.offsetY;
      const dx = targetX - comp.x;
      const dy = targetY - comp.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 380) {
        comp.x = targetX;
        comp.y = targetY;
      } else if (dist > 4) {
        comp.x += dx * Math.min(1, dt * 5.5);
        comp.y += dy * Math.min(1, dt * 5.5);
      }

      if (comp.container) {
        comp.container.position.set(comp.x, comp.y);
        comp.container.zIndex = comp.y;
      }

      // 2. Attack / Cast Skills if enemies in proximity
      let hasEnemyNear = false;
      if (world.enemies && world.enemies.length) {
        for (let i = 0; i < world.enemies.length; i++) {
          const e = world.enemies[i];
          if (!e.dead && Math.hypot(e.x - comp.x, e.y - comp.y) < 360) {
            hasEnemyNear = true;
            break;
          }
        }
      }

      if (hasEnemyNear && window.__d2s_skills) {
        for (const skill of comp.skills) {
          skill.timer -= dt;
          if (skill.timer <= 0) {
            skill.timer = skill.cooldown;

            // Execute cast directly from companion position
            const origX = player.x;
            const origY = player.y;
            player.x = comp.x;
            player.y = comp.y;

            const skillObj = window.__d2s_skills[skill.id];
            if (skillObj && typeof skillObj.cast === 'function') {
              const spellLevel = Math.max(1, Math.floor((player.level || 1) / 2) + 1);
              try {
                skillObj.cast(world, spellLevel);
              } catch (castErr) {
                // Ignore cast errors silently
              }
            }

            // Restore player position
            player.x = origX;
            player.y = origY;
            break; // One spell cast per frame per companion
          }
        }
      }
    }
  };

  // 4. UI: Party Selection Modal & HUD Controls
  function injectPartyUI() {
    if (document.getElementById('d2s-party-modal')) return;

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      #d2s-party-btn {
        position: fixed;
        top: 14px;
        right: 16px;
        z-index: 999;
        background: linear-gradient(135deg, rgba(24, 27, 36, 0.95), rgba(18, 20, 26, 0.95));
        border: 1px solid #c5a059;
        color: #e5b964;
        font-family: 'Cinzel', serif, Georgia;
        font-size: 13px;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(197, 160, 89, 0.3);
        transition: all 0.2s ease;
      }
      #d2s-party-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #c5a059, #8c6827);
        color: #0d0f14;
        box-shadow: 0 6px 20px rgba(197, 160, 89, 0.5);
      }
      #d2s-party-modal {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      #d2s-party-modal.active {
        opacity: 1;
        pointer-events: auto;
      }
      .party-box {
        background: #12141a;
        border: 2px solid #c5a059;
        border-radius: 16px;
        max-width: 680px;
        width: 100%;
        padding: 28px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.8), 0 0 28px rgba(197, 160, 89, 0.35);
        color: #f0f2f5;
        font-family: 'Inter', sans-serif;
      }
      .party-title {
        font-family: 'Cinzel', serif;
        font-size: 24px;
        font-weight: 900;
        text-align: center;
        color: #e5b964;
        letter-spacing: 2px;
        margin-bottom: 6px;
      }
      .party-sub {
        text-align: center;
        font-size: 13px;
        color: #9ba3b5;
        margin-bottom: 24px;
      }
      .party-slots {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        margin-bottom: 24px;
      }
      .party-slot-card {
        background: #181b24;
        border: 1px solid #272c3d;
        border-radius: 12px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .slot-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #c5a059;
      }
      .party-select {
        background: #0d0f14;
        border: 1px solid #374151;
        color: #fff;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        outline: none;
        cursor: pointer;
      }
      .slot-preview {
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        padding: 12px;
        font-size: 12px;
        color: #9ba3b5;
        line-height: 1.5;
        min-height: 80px;
      }
      .slot-preview-title {
        font-weight: 700;
        color: #e5b964;
        margin-bottom: 4px;
      }
      .party-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .party-btn-primary {
        background: linear-gradient(135deg, #e5b964, #b88628);
        color: #0d0f14;
        font-weight: 700;
        padding: 10px 22px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 4px 14px rgba(197, 160, 89, 0.4);
      }
      .party-btn-secondary {
        background: transparent;
        color: #9ba3b5;
        padding: 10px 18px;
        border-radius: 8px;
        border: 1px solid #374151;
        cursor: pointer;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);

    // Floating Button
    const btn = document.createElement('button');
    btn.id = 'd2s-party-btn';
    btn.innerHTML = '⚔️ Manage Party';
    btn.onclick = openModal;
    document.body.appendChild(btn);

    // Modal
    const modal = document.createElement('div');
    modal.id = 'd2s-party-modal';
    modal.innerHTML = `
      <div class="party-box">
        <h2 class="party-title">ASSEMBLE YOUR PARTY</h2>
        <p class="party-sub">Choose up to 2 companions to fight and cast spells alongside you.</p>

        <div class="party-slots">
          <!-- Companion 1 -->
          <div class="party-slot-card">
            <span class="slot-label">Companion 1</span>
            <select id="comp-1-select" class="party-select"></select>
            <div id="comp-1-preview" class="slot-preview"></div>
          </div>

          <!-- Companion 2 -->
          <div class="party-slot-card">
            <span class="slot-label">Companion 2</span>
            <select id="comp-2-select" class="party-select"></select>
            <div id="comp-2-preview" class="slot-preview"></div>
          </div>
        </div>

        <div class="party-actions">
          <button id="party-solo-btn" class="party-btn-secondary">Reset to Solo</button>
          <button id="party-close-btn" class="party-btn-primary">Save & Battle</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Populate Selects
    const sel1 = document.getElementById('comp-1-select');
    const sel2 = document.getElementById('comp-2-select');
    const prev1 = document.getElementById('comp-1-preview');
    const prev2 = document.getElementById('comp-2-preview');

    const heroKeys = Object.keys(HERO_PROFILES);

    function populateSelect(sel) {
      sel.innerHTML = '';
      for (const k of heroKeys) {
        const h = HERO_PROFILES[k];
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = `${h.icon} ${h.name} — ${h.title}`;
        sel.appendChild(opt);
      }
    }

    populateSelect(sel1);
    populateSelect(sel2);

    function updatePreview(val, prev) {
      const h = HERO_PROFILES[val] || HERO_PROFILES.none;
      if (h.id === 'none') {
        prev.innerHTML = `<div class="slot-preview-title">Solo Slot</div>No companion in this slot.`;
      } else {
        const skillsList = h.skills.map(s => `<b>${s.name}</b>`).join(', ');
        prev.innerHTML = `
          <div class="slot-preview-title" style="color:${h.color}">${h.icon} ${h.name} (${h.title})</div>
          <div>${h.description}</div>
          <div style="margin-top:6px;font-size:11px;opacity:0.8;">Skills: ${skillsList}</div>
        `;
      }
    }

    sel1.onchange = () => updatePreview(sel1.value, prev1);
    sel2.onchange = () => updatePreview(sel2.value, prev2);

    function openModal() {
      const cfg = getPartyConfig();
      sel1.value = cfg.companion1 || 'sorceress';
      sel2.value = cfg.companion2 || 'paladin';
      updatePreview(sel1.value, prev1);
      updatePreview(sel2.value, prev2);
      modal.classList.add('active');
    }

    function closeModal() {
      savePartyConfig({
        companion1: sel1.value,
        companion2: sel2.value
      });
      modal.classList.remove('active');
      // If run active, re-init
      if (window.__d2s_game) {
        initCompanionsForRun(window.__d2s_game);
      }
    }

    document.getElementById('party-close-btn').onclick = closeModal;
    document.getElementById('party-solo-btn').onclick = () => {
      sel1.value = 'none';
      sel2.value = 'none';
      updatePreview('none', prev1);
      updatePreview('none', prev2);
      closeModal();
    };

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  // Auto-init on page load
  function checkAutoOpen() {
    injectPartyUI();
    if (new URLSearchParams(location.search).has('openParty')) {
      setTimeout(() => {
        const btn = document.getElementById('d2s-party-btn');
        if (btn) btn.click();
      }, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAutoOpen);
  } else {
    checkAutoOpen();
  }

})();
