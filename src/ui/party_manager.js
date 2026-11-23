// ============================================================================
// OVERDRIVE-6 // MULTI-CHARACTER SWITCHER, ARCHETYPE ENGINE & GM OVERVIEW
// ============================================================================
(function () {
  'use strict';

  const ACTIVE_VIEW_KEY = 'overdrive6_active_view';
  const GUNNAR_STORAGE_KEY = 'overdrive6_gunnar_state';

  // --- ARCHETYPE / CAPABILITY REGISTRY ---
  // Adding a new character later only requires adding an entry here!
  const PARTY_ROSTER = [
    {
      id: 'buck',
      mode: 'legacy_buck', // Uses existing full Rigger sheet DOM (#view-buck-sheet)
      modules: ['rigging', 'vehicles', 'combat'],
      theme: {
        accent: 'cyan',
        badge: 'RIGGER',
        icon: '⚡',
        border: 'border-cyan-500/60',
        text: 'text-cyan-400',
        bg: 'bg-cyan-950/60'
      },
      identity: {
        name: 'Tim "Buckshot" Struck',
        shortName: 'Buckshot',
        portrait: './assets/portraits/tim_buckshot.jpg',
        portraitStyle: 'object-position: 63% 18%; transform: scale(1.7); transform-origin: 63% 18%;',
        metatype: 'Ork',
        archetype: 'Rigger & Fahrzeug-/Schiffsmechaniker',
        sin: 'Tim Struck (St. 4)',
        lifestyle: 'Mittelschicht (5.000 ¥)',
        nuyen: 23825,
        karma: '11 / 56',
        essence: 4.06
      },
      combat: {
        initiative: '9 + 1W6',
        initiativeAlt: 'VR: 10 + 3W6',
        minorActions: '2 (VR: 4)',
        defenseRating: 9,
        defensePool: 9,
        damageResist: 5,
        physMax: 12,
        stunMax: 10,
        edgeMax: 5
      },
      attributes: {
        KON: 5, GES: 4, REA: 5, STÄ: 4, WIL: 4, LOG: 4, INT: 4, CHA: 2, EDG: 5
      },
      gmChecks: {
        wahrnehmung: 6,
        heimlichkeit: 5,
        menschenkenntnis: 6,
        selbstbeherrschung: 6,
        erinnerung: 8
      },
      topSkills: [
        'Steuern 6 (Boden +2) → 11W/13W',
        'Feuerwaffen 4 (Schrot +2) → 8W/10W',
        'Mechanik 4 (Kfz +2) → 8W/10W',
        'Biotech 2 (Erste Hilfe +2) → 6W/8W',
        'Wahrnehmung 2 → 6W'
      ],
      signatureGear: [
        'Mossberg CMDT Smart (4K · 12W)',
        'Vulcan Liegelord RCC (St. 5 · 15 Slaves)',
        'Drohnen: 2× Roto (AK-97), Dobermann, 2× Wasp'
      ],
      qualitiesPos: ['Meistermechaniker', 'Vertrautes Terrain (Hafen)', 'Robust gebaut 1'],
      qualitiesNeg: ['Auffälliger Stil', 'Ehrenkodex (Werkstatt & Crew)', 'Allergie (Hafenchemie)']
    },
    {
      id: 'gunnar',
      mode: 'modular',
      modules: ['street_sam', 'vehicle_basic'],
      theme: {
        accent: 'rose',
        badge: 'STREET SAMURAI',
        icon: '⚔️',
        border: 'border-rose-500/60',
        text: 'text-rose-400',
        bg: 'bg-rose-950/60'
      },
      identity: {
        name: 'Gunnar',
        shortName: 'Gunnar',
        portrait: './assets/portraits/gunnar.jpg',
        portraitStyle: 'object-position: 44% 16%; transform: scale(1.35); transform-origin: 44% 16%;',
        metatype: 'Ork',
        gender: 'männlich',
        height: '215 cm',
        weight: '139 kg',
        archetype: 'Street Samurai (Mundan)',
        sin: 'jfgjf (St. 3 · Liz: fdzh)',
        lifestyle: 'Unterschicht (2.000 ¥ · 1 Mon.)',
        nuyen: -42460,
        karma: '5 / 5',
        essence: 0.72,
        notoriety: 0,
        reputation: 0
      },
      creation: {
        method: 'Prioritätensystem',
        priorities: {
          Metatyp: 'C',
          Attribute: 'B',
          'Magie/Resonanz': 'E',
          Fertigkeiten: 'D',
          Ressourcen: 'A'
        },
        karmaFromNeg: 14,
        karmaToNuyen: 6,
        karmaRemaining: 5,
        debt: 42460,
        creditor: 'Viktor'
      },
      combat: {
        initiative: '12 + 5W6',
        initiativeBase: 12,
        initiativeDice: 5,
        initiativeAlt: 'Astral 6+3W6 · Matrix 4+3W6',
        minorActions: '6',
        defenseRating: 15,
        defensePool: 12,
        damageResist: 7,
        toxinResist: 10,
        drainResist: 3,
        directSpellDef: 7,
        indirectSpellDef: 11,
        physMax: 13,
        stunMax: 10,
        overflowMax: 14,
        edgeMax: 2,
        movementGround: '10 / 15 / +1',
        movementWater: '3 / 3 / +1'
      },
      attributes: {
        KON: 7, GES: '6|2', REA: '4(8)', STÄ: '4|2', WIL: 3, LOG: 2, INT: 4, CHA: 2, EDG: 2
      },
      gmChecks: {
        wahrnehmung: 7,
        heimlichkeit: 5,
        menschenkenntnis: 7,
        selbstbeherrschung: 5,
        erinnerung: 6,
        hebenTragen: 10
      },
      skills: [
        { name: 'Feuerwaffen', attr: 'GES', rating: 6, pool: 12 },
        { name: 'Nahkampf', attr: 'GES', rating: 5, pool: 11 },
        { name: 'Athletik', attr: 'GES', rating: 4, pool: 10 },
        { name: 'Wahrnehmung', attr: 'INT', rating: 3, pool: 7 },
        { name: 'Steuern', attr: 'REA', rating: 0, pool: 7, untrained: true },
        { name: 'Heimlichkeit', attr: 'GES', rating: 0, pool: 5, untrained: true },
        { name: 'Natur', attr: 'INT', rating: 0, pool: 3, untrained: true },
        { name: 'Einfluss', attr: 'CHA', rating: 0, pool: 1, untrained: true },
        { name: 'Elektronik', attr: 'LOG', rating: 0, pool: 1, untrained: true },
        { name: 'Mechanik', attr: 'LOG', rating: 0, pool: 1, untrained: true },
        { name: 'Überreden', attr: 'CHA', rating: 0, pool: 1, untrained: true }
      ],
      knowledgeSkills: ['Kredithaie', 'Straßenmedizin'],
      topSkills: [
        'Feuerwaffen 6 → 12W',
        'Nahkampf 5 → 11W',
        'Athletik 4 → 10W',
        'Wahrnehmung 3 → 7W',
        'Steuern (ung.) → 7W'
      ],
      weapons: [
        {
          id: 'ares_alpha',
          name: 'Ares Alpha',
          category: 'Sturmgewehr + Granatwerfer',
          baseDmg: 4,
          dmgType: 'K',
          pool: 12,
          maxAmmo: 42,
          modes: {
            EM:  { label: 'EM',       ar: '4/10/9/7/2', dmg: '4K', pool: 12, shots: 1 },
            HM:  { label: 'HM',       ar: '2/8/7/5/-',  dmg: '5K', pool: 12, shots: 2 },
            SMW: { label: 'SM Breit', ar: '2/8/7/5/-',  dmg: '5K', pool: 6,  shots: 4 },
            SME: { label: 'SM Eng',   ar: '-/6/5/3/-',  dmg: '6K', pool: 12, shots: 4 },
            AM:  { label: 'AM',       ar: '-/4/3/1/-',  dmg: '4K', pool: 12, shots: 10 }
          },
          accessories: 'Lasermarkierer, Gasventilsystem, 2× Ersatzmag., Smartgun, Unterlauf-Granatwerfer'
        },
        {
          id: 'ares_predator',
          name: 'Ares Predator VI',
          category: 'Schwere Pistole',
          baseDmg: 3,
          dmgType: 'K',
          pool: 12,
          maxAmmo: 15,
          modes: {
            EM:  { label: 'EM',       ar: '10/10/8/-/-', dmg: '3K', pool: 12, shots: 1 },
            HM:  { label: 'HM',       ar: '8/8/6/-/-',   dmg: '4K', pool: 12, shots: 2 },
            SMW: { label: 'SM Breit', ar: '8/8/6/-/-',   dmg: '4K', pool: 6,  shots: 4 },
            SME: { label: 'SM Eng',   ar: '6/6/4/-/-',   dmg: '5K', pool: 12, shots: 4 }
          },
          accessories: 'Schnellziehholster, Variables Munitionssystem + Ersatzmag., Smartgun'
        },
        {
          id: 'unarmed',
          name: 'Waffenlos (Nahkampf)',
          category: 'Nahkampf',
          baseDmg: 2,
          dmgType: 'B',
          pool: 11,
          maxAmmo: 0,
          modes: {
            MELEE: { label: 'Schlag', ar: '12/-/-/-/-', dmg: '2B', pool: 11, shots: 0 }
          },
          accessories: 'AW = REA (8) + STÄ (4) = 12'
        }
      ],
      grenades: [
        { id: 'stun',   name: 'Betäubungsgranate (Mini)', max: 2, effect: 'Betäubung (Fläche)' },
        { id: 'frag',   name: 'Splittergranate (Mini)',   max: 2, effect: 'Körperlich (Splitter)' },
        { id: 'he',     name: 'Sprenggranate (Mini)',     max: 2, effect: 'Körperlich (Spreng)' },
        { id: 'smoke',  name: 'Rauchgranate (Mini)',      max: 2, effect: 'Sichtdeckung (Rauch)' },
        { id: 'irsmoke',name: 'IR-Rauchgranate (Mini)',   max: 2, effect: 'Sicht + Infrarot-Deckung' }
      ],
      bodytech: [
        { name: 'Reflexbooster', grade: 'Standard', rating: '4', essence: '4,00', source: 'GRW 289', notes: '+4 REA (4→8), +4W6 Ini (12+5W6), 6 Nebenhandlungen' },
        { name: 'Cyberarm (Ganzer Arm, offensichtlich)', grade: 'Alphaware', rating: '–', essence: '0,80', source: 'GRW 290', notes: 'Basis-GES 2 / STÄ 2 (6|2 · 4|2)' },
        { name: 'Dermalpanzerung', grade: 'Alphaware', rating: '3', essence: '0,72', source: 'GRW 288', notes: '+3 Verteidigungswert (permanent)' },
        { name: 'Cyberaugen', grade: 'Alphaware', rating: '3', essence: '0,24', source: 'GRW 286', notes: 'Inkl. Bildverbindung (Smartgun-ARO)' }
      ],
      armor: [
        { name: 'Körper (KON 7)', pVal: 7, social: '+2', mods: 'Basis-Konstitution' },
        { name: 'Panzerjacke', pVal: 4, social: '-3', mods: 'Chemische Isol. 2, Kälte 2, Elektrisch 2, Feuer 2' },
        { name: 'Helm', pVal: 1, social: '-4', mods: 'Kopfschutz' },
        { name: 'Dermalpanzerung (St. 3)', pVal: 3, social: '0', mods: 'Alphaware-Cyberware' }
      ],
      vehicles: [
        { name: 'Bessere Dreckskarre', type: 'Autos & SUVs', handl: 4, accel: 12, interv: 20, speed: 150, body: 10, armor: 4, seats: 4, ram: '5K' }
      ],
      connections: [
        { name: 'Unnamed #1', type: 'Straße', loy: 2, rating: 2, favors: 0 },
        { name: 'Unnamed #2', type: 'Straße', loy: 2, rating: 2, favors: 0 },
        { name: 'Unnamed #3', type: 'Straße', loy: 2, rating: 2, favors: 0 }
      ],
      signatureGear: [
        'Ares Alpha + Granatwerfer (4K · 12W · 42s)',
        'Ares Predator VI (3K · 12W · 15s)',
        'Reflexbooster St. 4 (12+5W6 · 6 NH) + Dermalp. 3'
      ],
      qualitiesPos: ['Schnellheilung', 'Hohe Schmerztoleranz', 'Dermalablagerungen', 'Restlichtverstärkung', 'Robust gebaut 1'],
      qualitiesNeg: ['Verschuldet: Viktor (-42.460 ¥)', 'Verpflichtungen 1: Maya', 'Ehrenkodex: Kriegerkodex']
    }
  ];

  // --- GUNNAR LIVE STATE (persisted independently in localStorage) ---
  function getDefaultGunnarState() {
    return {
      physDmg: 0,
      stunDmg: 0,
      overflowDmg: 0,
      edge: 2,
      activeTab: 'combat',
      weapons: {
        ares_alpha: { ammo: 42, mode: 'HM' },
        ares_predator: { ammo: 15, mode: 'HM' }
      },
      grenades: {
        stun: 2,
        frag: 2,
        he: 2,
        smoke: 2,
        irsmoke: 2
      }
    };
  }

  let gunnarState = getDefaultGunnarState();
  function loadGunnarState() {
    try {
      const raw = localStorage.getItem(GUNNAR_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        gunnarState = Object.assign(getDefaultGunnarState(), parsed);
        gunnarState.weapons = Object.assign(getDefaultGunnarState().weapons, parsed.weapons || {});
        gunnarState.grenades = Object.assign(getDefaultGunnarState().grenades, parsed.grenades || {});
      }
    } catch (e) {
      console.warn('Gunnar state load failed:', e);
    }
  }
  function saveGunnarState() {
    try {
      localStorage.setItem(GUNNAR_STORAGE_KEY, JSON.stringify(gunnarState));
    } catch (e) {
      console.warn('Gunnar state save failed:', e);
    }
  }

  // --- HELPER: LIVE STATUS READER FOR GM OVERVIEW ---
  function getLiveCharacterStatus(charId) {
    if (charId === 'buck') {
      let phys = 0, stun = 0, edge = 5;
      if (typeof charDamage !== 'undefined') {
        phys = charDamage.phys || 0;
        stun = charDamage.stun || 0;
      }
      if (typeof timEdge !== 'undefined') {
        edge = timEdge;
      }
      const penalty = Math.floor(phys / 3) + Math.floor(stun / 3);
      return { phys, stun, physMax: 12, stunMax: 10, edge, edgeMax: 5, penalty };
    }
    if (charId === 'gunnar') {
      const phys = gunnarState.physDmg || 0;
      const stun = gunnarState.stunDmg || 0;
      // Hohe Schmerztoleranz: ignores 1 box of wound penalty threshold (first -1 at 4 instead of 3)
      const physPen = Math.max(0, Math.floor((phys - 1) / 3));
      const stunPen = Math.max(0, Math.floor((stun - 1) / 3));
      return {
        phys,
        stun,
        physMax: 13,
        stunMax: 10,
        edge: gunnarState.edge,
        edgeMax: 2,
        penalty: physPen + stunPen
      };
    }
    return { phys: 0, stun: 0, physMax: 10, stunMax: 10, edge: 1, edgeMax: 1, penalty: 0 };
  }

  // Safe Roll20 helper reusing existing copyRoll20 if present
  function triggerRoll(cmd, label, details) {
    if (typeof copyRoll20 === 'function') {
      copyRoll20(cmd, label, details);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
    }
  }

  // --- VIEW SWITCHER ---
  let currentGlobalView = 'buck';

  function switchGlobalView(viewId) {
    currentGlobalView = viewId;
    try {
      localStorage.setItem(ACTIVE_VIEW_KEY, viewId);
    } catch (e) {}

    const buckEl = document.getElementById('view-buck-sheet');
    const modEl = document.getElementById('view-modular-char');
    const gmEl = document.getElementById('view-gm-overview');

    if (buckEl) buckEl.classList.toggle('hidden', viewId !== 'buck');
    if (modEl) modEl.classList.toggle('hidden', viewId !== 'gunnar');
    if (gmEl) gmEl.classList.toggle('hidden', viewId !== 'gm');

    // Highlight active button in global bar
    document.querySelectorAll('.party-switch-btn').forEach(btn => {
      const isActive = btn.dataset.view === viewId;
      btn.classList.remove('active-gm', 'active-buck', 'active-gunnar');
      if (isActive) {
        if (viewId === 'gm') btn.classList.add('active-gm');
        else if (viewId === 'gunnar') btn.classList.add('active-gunnar');
        else btn.classList.add('active-buck');
      }
    });

    if (viewId === 'gm') {
      renderGmOverview();
    } else if (viewId === 'gunnar') {
      renderGunnarSheet();
    }
  }

  // ==========================================================================
  // --- GM PARTY OVERVIEW RENDERER ---
  // ==========================================================================
  function renderGmOverview() {
    const container = document.getElementById('view-gm-overview');
    if (!container) return;

    const cardsHtml = PARTY_ROSTER.map(char => {
      const live = getLiveCharacterStatus(char.id);
      const isCyan = char.theme.accent === 'cyan';
      const borderCol = isCyan ? 'border-cyan-500/60' : 'border-rose-500/60';
      const titleCol = isCyan ? 'text-cyan-300' : 'text-rose-300';
      const badgeCls = isCyan
        ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300'
        : 'bg-rose-950 border-rose-500/50 text-rose-300';
      const btnCls = isCyan
        ? 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/60 text-cyan-200'
        : 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/60 text-rose-200';

      const physPct = Math.min(100, Math.round((live.phys / live.physMax) * 100));
      const stunPct = Math.min(100, Math.round((live.stun / live.stunMax) * 100));
      const nuyenStr = char.identity.nuyen < 0
        ? `<span class="text-rose-400 font-bold">${char.identity.nuyen.toLocaleString('de-DE')} ¥</span>`
        : `<span class="text-emerald-400 font-bold">${char.identity.nuyen.toLocaleString('de-DE')} ¥</span>`;

      const attrPills = Object.entries(char.attributes).map(([k, v]) => `
        <div class="bg-slate-950/90 border border-slate-800 rounded px-1.5 py-1 text-center">
          <div class="text-[9px] text-slate-500 font-bold">${k}</div>
          <div class="text-xs font-bold text-white">${v}</div>
        </div>
      `).join('');

      return `
        <div class="bg-[#111726]/95 border-2 ${borderCol} rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div class="space-y-4">
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div class="flex items-center gap-3">
                ${char.identity.portrait ? `
                  <button type="button" onclick="window.openPortraitLightbox('${char.identity.portrait}', '${char.identity.name.replace(/"/g, '&quot;')}')"
                    class="w-14 h-14 rounded-lg border-2 ${borderCol} overflow-hidden flex-shrink-0 bg-slate-900 cursor-pointer hover:brightness-110 transition" title="Vollbild-Portrait anzeigen">
                    <img src="${char.identity.portrait}" alt="${char.identity.shortName}" class="w-full h-full object-cover" style="${char.identity.portraitStyle || ''}">
                  </button>
                ` : `
                  <div class="w-14 h-14 rounded-lg border-2 ${borderCol} bg-slate-900 flex items-center justify-center flex-shrink-0 font-mono-sr text-sm font-bold ${titleCol}">
                    ${char.identity.metatype.slice(0, 3).toUpperCase()}
                  </div>
                `}
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xl">${char.theme.icon}</span>
                    <h3 class="text-xl font-bold text-white uppercase tracking-wide">${char.identity.name}</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono-sr border ${badgeCls} font-bold">${char.theme.badge}</span>
                  </div>
                  <p class="text-xs font-mono-sr ${titleCol} mt-0.5">${char.identity.metatype} // ${char.identity.archetype}</p>
                </div>
              </div>
              <button type="button" onclick="window.switchGlobalView('${char.id}')" class="px-3 py-1.5 rounded-lg border text-xs font-mono-sr font-bold transition ${btnCls} flex-shrink-0">
                Bogen →
              </button>
            </div>

            <!-- Live Monitors & Edge -->
            <div class="grid grid-cols-3 gap-2.5 font-mono-sr">
              <div class="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
                <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>KÖRPERLICH</span>
                  <span class="${live.phys > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}">${live.phys}/${live.physMax}</span>
                </div>
                <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-rose-500 transition-all" style="width:${physPct}%"></div>
                </div>
              </div>
              <div class="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
                <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>GEISTIG</span>
                  <span class="${live.stun > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}">${live.stun}/${live.stunMax}</span>
                </div>
                <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-400 transition-all" style="width:${stunPct}%"></div>
                </div>
              </div>
              <div class="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-center">
                <div class="text-[10px] text-slate-400">EDGE / MALUS</div>
                <div class="text-sm font-bold text-cyan-300 mt-0.5">
                  ${live.edge}/${live.edgeMax}
                  <span class="text-xs ${live.penalty > 0 ? 'text-rose-400' : 'text-slate-500'} ml-1">(-${live.penalty}W)</span>
                </div>
              </div>
            </div>

            <!-- Combat Core Values -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-sr text-center">
              <div class="bg-slate-900/90 border border-amber-500/40 rounded-lg p-2">
                <div class="text-[10px] text-amber-400 uppercase">Initiative</div>
                <div class="text-sm font-bold text-white">${char.combat.initiative}</div>
                <div class="text-[9px] text-slate-400">NH: ${char.combat.minorActions}</div>
              </div>
              <div class="bg-slate-900/90 border border-emerald-500/40 rounded-lg p-2">
                <div class="text-[10px] text-emerald-400 uppercase">Vert.-Wert (VW)</div>
                <div class="text-lg font-bold text-white">${char.combat.defenseRating}</div>
              </div>
              <div class="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-2">
                <div class="text-[10px] text-cyan-400 uppercase">Vert.-Pool / Soak</div>
                <div class="text-sm font-bold text-white">${char.combat.defensePool}W <span class="text-slate-400">/ ${char.combat.damageResist}W</span></div>
              </div>
              <div class="bg-slate-900/90 border border-purple-500/40 rounded-lg p-2">
                <div class="text-[10px] text-purple-300 uppercase">Essenz</div>
                <div class="text-lg font-bold ${char.identity.essence < 1 ? 'text-rose-400' : 'text-emerald-400'}">${char.identity.essence.toFixed(2)}</div>
              </div>
            </div>

            <!-- Attributes Strip -->
            <div>
              <div class="text-[10px] font-mono-sr text-slate-400 uppercase tracking-wider mb-1.5">Kern-Attribute</div>
              <div class="grid grid-cols-9 gap-1 font-mono-sr">${attrPills}</div>
            </div>

            <!-- Signature Gear & Top Skills -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1">
                <div class="text-[10px] font-mono-sr text-cyan-400 font-bold uppercase mb-1">🎯 Top-Fertigkeiten</div>
                ${char.topSkills.map(s => `<div class="text-slate-200 font-mono-sr text-[11px]">• ${s}</div>`).join('')}
              </div>
              <div class="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1">
                <div class="text-[10px] font-mono-sr text-amber-400 font-bold uppercase mb-1">🔫 Signatur-Ausrüstung</div>
                ${char.signatureGear.map(g => `<div class="text-slate-200 font-mono-sr text-[11px]">• ${g}</div>`).join('')}
              </div>
            </div>

            <!-- GM Plot Hooks & Qualities -->
            <div class="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div class="text-[10px] font-mono-sr text-rose-400 font-bold uppercase">🎭 GM-Hooks (Nachteile & Vorteile)</div>
              <div class="flex flex-wrap gap-1.5">
                ${char.qualitiesNeg.map(q => `<span class="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono-sr text-[10px]">⚠ ${q}</span>`).join('')}
                ${char.qualitiesPos.map(q => `<span class="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono-sr text-[10px]">✓ ${q}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Footer Meta: SIN, Lifestyle, Nuyen, Karma -->
          <div class="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-sr text-slate-400">
            <span>SIN: <strong class="text-slate-200">${char.identity.sin}</strong></span>
            <span>Lifestyle: <strong class="text-slate-200">${char.identity.lifestyle}</strong></span>
            <span>Nuyen: ${nuyenStr}</span>
            <span>Karma: <strong class="text-amber-300">${char.identity.karma}</strong></span>
          </div>
        </div>
      `;
    }).join('');

    // Compact GM Cheat Sheet Table for hidden rolls
    const cheatRows = PARTY_ROSTER.map(char => {
      const live = getLiveCharacterStatus(char.id);
      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-800/40">
          <td class="p-2.5 font-bold text-white">${char.theme.icon} ${char.identity.shortName} <span class="text-[10px] text-slate-400 font-normal">(${char.theme.badge})</span></td>
          <td class="p-2.5 text-center text-amber-300 font-bold">${char.combat.initiative}</td>
          <td class="p-2.5 text-center text-emerald-400 font-bold">${char.combat.defenseRating}</td>
          <td class="p-2.5 text-center text-cyan-300 font-bold">${char.combat.defensePool}W</td>
          <td class="p-2.5 text-center text-slate-200">${char.gmChecks.wahrnehmung}W</td>
          <td class="p-2.5 text-center text-slate-200">${char.gmChecks.heimlichkeit}W</td>
          <td class="p-2.5 text-center text-slate-200">${char.gmChecks.menschenkenntnis}W</td>
          <td class="p-2.5 text-center text-slate-200">${char.gmChecks.selbstbeherrschung}W</td>
          <td class="p-2.5 text-center">
            <span class="${live.phys > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}">${live.phys}/${live.physMax}K</span> ·
            <span class="${live.stun > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}">${live.stun}/${live.stunMax}G</span>
          </td>
          <td class="p-2.5 text-center text-cyan-300 font-bold">${live.edge}/${live.edgeMax}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bg-[#111726]/95 border border-amber-500/50 rounded-xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 class="text-2xl font-bold text-white uppercase tracking-wider font-mono-sr">
                GM-ÜBERSICHT // RUNNER-TEAM KOMPAKT
              </h2>
            </div>
            <p class="text-xs font-mono-sr text-amber-300/90 mt-0.5">
              Live-Synchronisation mit allen Charakterbögen (Schaden, Edge & Kernwerte für verdeckte Proben)
            </p>
          </div>
          <div class="text-xs font-mono-sr text-slate-400 bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg">
            Aktive Runner im Team: <strong class="text-amber-300">${PARTY_ROSTER.length}</strong>
          </div>
        </div>
      </div>

      <!-- Side-by-Side Character Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${cardsHtml}
      </div>

      <!-- Compact GM Hidden-Roll Cheat Sheet -->
      <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold font-mono-sr text-amber-300 uppercase tracking-wider">
            🎲 GM-SCHNELLTABELLE (VERDECKTE PROBEN & KAMPF)
          </h3>
          <span class="text-[11px] font-mono-sr text-slate-500">Alle Pools ohne aktuelle Verletzungsabzüge</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs font-mono-sr text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-700 text-slate-400 uppercase text-[10px] bg-slate-950/60">
                <th class="p-2.5">Runner</th>
                <th class="p-2.5 text-center">Initiative</th>
                <th class="p-2.5 text-center">VW</th>
                <th class="p-2.5 text-center">Vtd-Pool</th>
                <th class="p-2.5 text-center">Wahrn.</th>
                <th class="p-2.5 text-center">Heiml.</th>
                <th class="p-2.5 text-center">Menschenk.</th>
                <th class="p-2.5 text-center">Selbstb.</th>
                <th class="p-2.5 text-center">Live-Schaden</th>
                <th class="p-2.5 text-center">Edge</th>
              </tr>
            </thead>
            <tbody>
              ${cheatRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // --- MODULAR STREET SAMURAI SHEET (GUNNAR) ---
  // ==========================================================================
  function getGunnarChar() {
    return PARTY_ROSTER.find(c => c.id === 'gunnar');
  }

  function renderMonitorBoxes(type, max, current, colorClass) {
    let html = '';
    for (let i = 1; i <= max; i++) {
      const checked = i <= current;
      const mod = (type !== 'overflow' && i > 1 && (i - 1) % 3 === 0) ? `-${Math.floor((i - 1) / 3)}` : '';
      html += `
        <button type="button" onclick="window.gunnarSetDamage('${type}', ${i === current ? i - 1 : i})"
          class="w-7 h-7 rounded border font-mono-sr text-[10px] font-bold transition ${
            checked
              ? `${colorClass} text-white shadow`
              : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-rose-400'
          }" title="${type} Kästchen ${i}">
          ${checked ? '✕' : (mod || i)}
        </button>
      `;
    }
    return html;
  }

  function renderGunnarSheet() {
    const container = document.getElementById('view-modular-char');
    const c = getGunnarChar();
    if (!container || !c) return;

    const live = getLiveCharacterStatus('gunnar');
    const activeTab = gunnarState.activeTab || 'combat';

    const tabs = [
      { id: 'combat',     label: '[⚡] COMBAT HUD // STREET SAM' },
      { id: 'persona',    label: '[1] PERSONA & MONITORE' },
      { id: 'attributes', label: '[2] ATTRIBUTE & FERTIGKEITEN' },
      { id: 'gear',       label: '[3] ARSENAL, BODYTECH & AUTO' },
      { id: 'budget',     label: '[4] PRIORITÄTEN & SCHULDEN' }
    ];

    const navHtml = tabs.map(tb => `
      <button type="button" onclick="window.gunnarSwitchTab('${tb.id}')"
        class="px-4 py-2 rounded-lg border font-mono-sr text-sm transition-all ${
          activeTab === tb.id
            ? 'border-rose-400 bg-rose-950/60 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.25)]'
            : 'border-slate-700 text-slate-300 hover:border-rose-500'
        }">
        ${tb.label}
      </button>
    `).join('');

    // --- TAB CONTENT BUILDERS ---
    let bodyHtml = '';

    if (activeTab === 'combat') {
      const weaponCards = c.weapons.map(w => {
        const wState = gunnarState.weapons[w.id] || { ammo: w.maxAmmo, mode: Object.keys(w.modes)[0] };
        const mInfo = w.modes[wState.mode] || Object.values(w.modes)[0];
        const effPool = Math.max(1, mInfo.pool - live.penalty);

        const modeButtons = Object.entries(w.modes).map(([mk, mv]) => `
          <button type="button" onclick="window.gunnarSetWeaponMode('${w.id}', '${mk}')"
            class="px-2 py-0.5 rounded text-[10px] font-mono-sr border transition ${
              wState.mode === mk
                ? 'border-rose-400 bg-rose-950 text-rose-300 font-bold'
                : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
            }">
            ${mv.label}
          </button>
        `).join('');

        const ammoBar = w.maxAmmo > 0 ? `
          <div class="pt-2 border-t border-slate-800 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono-sr">
              <span class="text-slate-400">MAGAZIN:</span>
              <span class="font-bold ${wState.ammo <= 5 ? 'text-rose-400' : 'text-emerald-400'}">${wState.ammo} / ${w.maxAmmo} Schuss</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" onclick="window.gunnarAdjustAmmo('${w.id}', -1)" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 border border-slate-700 text-xs font-mono-sr text-white font-bold">-1</button>
              <button type="button" onclick="window.gunnarAdjustAmmo('${w.id}', -2)" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 border border-slate-700 text-xs font-mono-sr text-white font-bold">-2 (HM)</button>
              <button type="button" onclick="window.gunnarAdjustAmmo('${w.id}', -4)" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 border border-slate-700 text-xs font-mono-sr text-white font-bold">-4 (SM)</button>
              ${w.maxAmmo >= 30 ? `<button type="button" onclick="window.gunnarAdjustAmmo('${w.id}', -10)" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 border border-slate-700 text-xs font-mono-sr text-white font-bold">-10 (AM)</button>` : ''}
              <button type="button" onclick="window.gunnarReload('${w.id}')" class="ml-auto px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-xs font-mono-sr text-emerald-300 font-bold">🔄 Laden</button>
            </div>
          </div>
        ` : '';

        return `
          <div class="bg-slate-950/90 border border-slate-800 hover:border-rose-500/50 rounded-xl p-4 space-y-3 transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="text-base font-bold text-white">${w.name}</h4>
                <div class="text-[11px] font-mono-sr text-slate-400">${w.category}</div>
              </div>
              <button type="button" onclick="window.gunnarRoll('/roll ${effPool}d6>5', '${w.name} (${mInfo.label})', 'AW ${mInfo.ar} · Schaden ${mInfo.dmg} · Pool ${effPool}W')"
                class="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-400 text-rose-200 font-mono-sr text-xs font-bold transition">
                🎲 ${effPool}W · ${mInfo.dmg}
              </button>
            </div>
            <div class="flex flex-wrap gap-1">${modeButtons}</div>
            <div class="grid grid-cols-2 gap-2 text-xs font-mono-sr bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div><span class="text-slate-500">AW:</span> <strong class="text-amber-300">${mInfo.ar}</strong></div>
              <div><span class="text-slate-500">Schaden:</span> <strong class="text-rose-300">${mInfo.dmg}</strong></div>
            </div>
            <div class="text-[11px] text-slate-400">${w.accessories}</div>
            ${ammoBar}
          </div>
        `;
      }).join('');

      const grenadeRows = c.grenades.map(g => {
        const count = gunnarState.grenades[g.id] ?? g.max;
        return `
          <div class="flex items-center justify-between gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono-sr">
            <div>
              <div class="text-white font-bold">${g.name}</div>
              <div class="text-[10px] text-slate-400">${g.effect}</div>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="window.gunnarAdjustGrenade('${g.id}', -1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-rose-900 border border-slate-700 text-white font-bold">-</button>
              <span class="w-8 text-center font-bold ${count === 0 ? 'text-rose-400' : 'text-amber-300'}">${count}/${g.max}</span>
              <button type="button" onclick="window.gunnarAdjustGrenade('${g.id}', 1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-emerald-900 border border-slate-700 text-white font-bold">+</button>
            </div>
          </div>
        `;
      }).join('');

      bodyHtml = `
        <!-- Top Tactical Bar -->
        <div class="bg-[#111726]/95 border-2 border-rose-500/70 rounded-xl p-5 space-y-4 shadow-[0_0_20px_rgba(244,63,94,0.18)]">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></span>
                <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono-sr">
                  STREET SAMURAI COMBAT HUD // REFLEXBOOSTER ST. 4
                </h2>
              </div>
              <p class="text-xs font-mono-sr text-rose-300 mt-0.5">
                INITIATIVE: 12 + 5W6 · 6 NEBENHANDLUNGEN · VERTEIDIGUNGSWERT 15 · HOHE SCHMERZTOLERANZ AKTIV
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 font-mono-sr text-xs">
              <button type="button" onclick="window.gunnarRoll('/roll 12 + 5d6', 'Gunnar Initiative', 'Reflexbooster St. 4 (6 Nebenhandlungen)')"
                class="px-3 py-1.5 rounded-lg bg-amber-950 border border-amber-400 text-amber-200 font-bold hover:bg-amber-900">
                ⚡ Ini: 12 + 5W6
              </button>
              <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                <span class="text-slate-400 font-bold">EDGE:</span>
                <span class="text-lg font-bold text-cyan-400">${gunnarState.edge} <span class="text-xs text-slate-500">/ ${c.combat.edgeMax}</span></span>
                <button type="button" onclick="window.gunnarAdjustEdge(-1)" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold">-1</button>
                <button type="button" onclick="window.gunnarAdjustEdge(1)" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold">+1</button>
              </div>
            </div>
          </div>

          <!-- Quick Defense & Resistance Rolls -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono-sr">
            <button type="button" onclick="window.gunnarRoll('/roll ${Math.max(1, 12 - live.penalty)}d6>5', 'Verteidigung (Physisch)', 'REA 8 + INT 4 = 12W (VW 15)')"
              class="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-left">
              <div class="text-[10px] text-emerald-400">VERTEIDIGUNG</div>
              <div class="text-base font-bold text-white">${Math.max(1, 12 - live.penalty)}W <span class="text-xs text-slate-400">VW 15</span></div>
            </button>
            <button type="button" onclick="window.gunnarRoll('/roll 7d6>5', 'Schadenswiderstand', 'KON 7 (Soak)')"
              class="p-2.5 rounded-lg bg-slate-900 border border-rose-500/40 hover:border-rose-400 text-left">
              <div class="text-[10px] text-rose-400">SOAK (SCHADEN)</div>
              <div class="text-base font-bold text-white">7W <span class="text-xs text-slate-400">KON 7</span></div>
            </button>
            <button type="button" onclick="window.gunnarRoll('/roll 10d6>5', 'Toxinwiderstand', 'KON 7 + WIL 3 = 10W')"
              class="p-2.5 rounded-lg bg-slate-900 border border-purple-500/40 hover:border-purple-400 text-left">
              <div class="text-[10px] text-purple-300">TOXIN-WIDERST.</div>
              <div class="text-base font-bold text-white">10W</div>
            </button>
            <button type="button" onclick="window.gunnarRoll('/roll ${Math.max(1, 17 - live.penalty)}d6>5', 'Blocken (Nebenhandlung)', 'Vtd 12 + Nahkampf 5 = 17W')"
              class="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-left">
              <div class="text-[10px] text-cyan-400">BLOCKEN (+5)</div>
              <div class="text-base font-bold text-white">${Math.max(1, 17 - live.penalty)}W</div>
            </button>
            <button type="button" onclick="window.gunnarRoll('/roll ${Math.max(1, 16 - live.penalty)}d6>5', 'Ausweichen (Nebenhandlung)', 'Vtd 12 + Athletik 4 = 16W')"
              class="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-left">
              <div class="text-[10px] text-cyan-400">AUSWEICHEN (+4)</div>
              <div class="text-base font-bold text-white">${Math.max(1, 16 - live.penalty)}W</div>
            </button>
            <button type="button" onclick="window.gunnarRoll('/roll ${Math.max(1, 15 - live.penalty)}d6>5', 'Volle Abwehr (Haupthandlung)', 'Vtd 12 + WIL 3 = 15W')"
              class="p-2.5 rounded-lg bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-left">
              <div class="text-[10px] text-amber-400">VOLLE ABWEHR (+3)</div>
              <div class="text-base font-bold text-white">${Math.max(1, 15 - live.penalty)}W</div>
            </button>
          </div>
        </div>

        <!-- Weapons Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          ${weaponCards}
        </div>

        <!-- Condition Monitors + Grenades -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div class="lg:col-span-7 bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold font-mono-sr text-white uppercase">❤️ ZUSTANDSMONITORE (HOHE SCHMERZTOLERANZ)</h3>
              <span class="text-xs font-mono-sr ${live.penalty > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}">
                Aktueller Verletzungsmodifikator: -${live.penalty}W
              </span>
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-mono-sr text-slate-400">
                <span>KÖRPERLICH (${gunnarState.physDmg} / ${c.combat.physMax}) · Heilen: KON+KON = 14W</span>
              </div>
              <div class="flex flex-wrap gap-1.5">${renderMonitorBoxes('phys', c.combat.physMax, gunnarState.physDmg, 'bg-rose-600 border-rose-400')}</div>
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-mono-sr text-slate-400">
                <span>GEISTIG (${gunnarState.stunDmg} / ${c.combat.stunMax}) · Heilen: KON+WIL = 10W</span>
              </div>
              <div class="flex flex-wrap gap-1.5">${renderMonitorBoxes('stun', c.combat.stunMax, gunnarState.stunDmg, 'bg-amber-600 border-amber-400')}</div>
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-mono-sr text-slate-400">
                <span>ÜBERZÄHLIGER SCHADEN (${gunnarState.overflowDmg} / ${c.combat.overflowMax})</span>
              </div>
              <div class="flex flex-wrap gap-1.5">${renderMonitorBoxes('overflow', c.combat.overflowMax, gunnarState.overflowDmg, 'bg-purple-700 border-purple-400')}</div>
            </div>
          </div>

          <div class="lg:col-span-5 bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 class="text-sm font-bold font-mono-sr text-amber-300 uppercase">💣 MINI-GRANATEN (ARES ALPHA WERFER)</h3>
            <div class="space-y-2">${grenadeRows}</div>
          </div>
        </div>
      `;
    } else if (activeTab === 'persona') {
      bodyHtml = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 class="text-sm font-bold font-mono-sr text-rose-300 uppercase border-b border-slate-800 pb-2">👤 IDENTITÄT & PERSÖNLICHE DATEN</h3>
            <div class="grid grid-cols-2 gap-3 text-xs font-mono-sr">
              <div class="bg-slate-950 p-3 rounded-lg border border-slate-800"><span class="text-slate-500 block">Straßenname</span><strong class="text-white text-sm">${c.identity.name}</strong></div>
              <div class="bg-slate-950 p-3 rounded-lg border border-slate-800"><span class="text-slate-500 block">Metatyp</span><strong class="text-white text-sm">${c.identity.metatype} (${c.identity.gender})</strong></div>
              <div class="bg-slate-950 p-3 rounded-lg border border-slate-800"><span class="text-slate-500 block">Größe / Gewicht</span><strong class="text-white">${c.identity.height} / ${c.identity.weight}</strong></div>
              <div class="bg-slate-950 p-3 rounded-lg border border-slate-800"><span class="text-slate-500 block">SIN & Lizenz</span><strong class="text-white">${c.identity.sin}</strong></div>
              <div class="bg-slate-950 p-3 rounded-lg border border-slate-800"><span class="text-slate-500 block">Lebensstil</span><strong class="text-white">${c.identity.lifestyle}</strong></div>
              <div class="bg-slate-950 p-3 rounded-lg border border-slate-800"><span class="text-slate-500 block">Bewegung (Boden/Wasser)</span><strong class="text-white">${c.combat.movementGround} · ${c.combat.movementWater}</strong></div>
            </div>
            <div class="space-y-2 pt-2">
              <div class="text-xs font-mono-sr text-emerald-400 font-bold uppercase">✓ VORTEILE</div>
              <div class="flex flex-wrap gap-1.5">
                ${c.qualitiesPos.map(q => `<span class="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono-sr">${q}</span>`).join('')}
              </div>
              <div class="text-xs font-mono-sr text-rose-400 font-bold uppercase pt-2">⚠ NACHTEILE</div>
              <div class="flex flex-wrap gap-1.5">
                ${c.qualitiesNeg.map(q => `<span class="px-2.5 py-1 rounded bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono-sr">${q}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 class="text-sm font-bold font-mono-sr text-cyan-300 uppercase border-b border-slate-800 pb-2">🤝 CONNECTIONS</h3>
            <div class="space-y-2">
              ${c.connections.map(cn => `
                <div class="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono-sr text-xs">
                  <div>
                    <div class="text-white font-bold">${cn.name}</div>
                    <div class="text-slate-400 text-[11px]">${cn.type}</div>
                  </div>
                  <div class="flex gap-3 text-right">
                    <span>Loy: <strong class="text-emerald-400">${cn.loy}</strong></span>
                    <span>Stufe: <strong class="text-cyan-400">${cn.rating}</strong></span>
                    <span>Gef.: <strong class="text-slate-300">${cn.favors}</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono-sr space-y-1">
              <div class="text-amber-300 font-bold uppercase">📚 WISSENSFERTIGKEITEN</div>
              <div class="text-slate-200">${c.knowledgeSkills.join(' · ')}</div>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'attributes') {
      const attrCards = Object.entries(c.attributes).map(([k, v]) => `
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center font-mono-sr">
          <div class="text-xs text-slate-400 font-bold">${k}</div>
          <div class="text-2xl font-bold text-white mt-1">${v}</div>
        </div>
      `).join('');

      const skillRows = c.skills.map(sk => {
        const eff = Math.max(1, sk.pool - live.penalty);
        return `
          <tr class="border-b border-slate-800/70 hover:bg-slate-800/40">
            <td class="p-2.5 font-bold ${sk.untrained ? 'text-slate-400' : 'text-white'}">${sk.name} ${sk.untrained ? '<span class="text-[10px] text-slate-500">(ung.)</span>' : ''}</td>
            <td class="p-2.5 text-center text-slate-400">${sk.attr}</td>
            <td class="p-2.5 text-center text-slate-300">${sk.rating}</td>
            <td class="p-2.5 text-right">
              <button type="button" onclick="window.gunnarRoll('/roll ${eff}d6>5', 'Gunnar: ${sk.name}', '${sk.attr} + Stufe ${sk.rating} (Malus -${live.penalty})')"
                class="px-3 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold">
                🎲 ${eff}W
              </button>
            </td>
          </tr>
        `;
      }).join('');

      bodyHtml = `
        <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-bold font-mono-sr text-rose-300 uppercase">📊 ATTRIBUTE (INKL. REFLEXBOOSTER 4 & CYBERARM)</h3>
          <div class="grid grid-cols-3 sm:grid-cols-9 gap-2.5">${attrCards}</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 font-mono-sr text-xs">
            <div class="bg-slate-900 p-2.5 rounded-lg border border-slate-800">Selbstbeherrschung: <strong class="text-white">5W</strong></div>
            <div class="bg-slate-900 p-2.5 rounded-lg border border-slate-800">Menschenkenntnis: <strong class="text-white">7W</strong></div>
            <div class="bg-slate-900 p-2.5 rounded-lg border border-slate-800">Heben / Tragen: <strong class="text-white">10W</strong></div>
            <div class="bg-slate-900 p-2.5 rounded-lg border border-slate-800">Erinnerungsvermögen: <strong class="text-white">6W</strong></div>
          </div>
        </div>
        <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5">
          <h3 class="text-sm font-bold font-mono-sr text-cyan-300 uppercase mb-3">🎯 FERTIGKEITEN (KLICK = ROLL20-PROBE)</h3>
          <table class="w-full text-xs font-mono-sr">
            <thead>
              <tr class="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                <th class="p-2.5 text-left">Fertigkeit</th>
                <th class="p-2.5 text-center">Attr.</th>
                <th class="p-2.5 text-center">Stufe</th>
                <th class="p-2.5 text-right">Würfelpool</th>
              </tr>
            </thead>
            <tbody>${skillRows}</tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'gear') {
      bodyHtml = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 class="text-sm font-bold font-mono-sr text-rose-300 uppercase">🦾 BODYTECH (ESSENZ 0,72 / 6,0)</h3>
            ${c.bodytech.map(b => `
              <div class="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono-sr text-xs space-y-1">
                <div class="flex justify-between">
                  <strong class="text-white">${b.name} ${b.rating !== '–' ? `St. ${b.rating}` : ''}</strong>
                  <span class="text-rose-400">-${b.essence} Essenz</span>
                </div>
                <div class="text-[11px] text-cyan-300">${b.grade} · ${b.source}</div>
                <div class="text-[11px] text-slate-400">${b.notes}</div>
              </div>
            `).join('')}
          </div>

          <div class="space-y-5">
            <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 class="text-sm font-bold font-mono-sr text-emerald-300 uppercase">🛡️ PANZERUNG (GESAMT-VW: 15)</h3>
              ${c.armor.map(a => `
                <div class="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono-sr text-xs">
                  <div class="flex justify-between">
                    <strong class="text-white">${a.name}</strong>
                    <span class="text-emerald-400 font-bold">P-Wert: ${a.pVal} · Sozial: ${a.social}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-1">${a.mods}</div>
                </div>
              `).join('')}
            </div>

            <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 class="text-sm font-bold font-mono-sr text-amber-300 uppercase">🚗 FAHRZEUG</h3>
              ${c.vehicles.map(v => `
                <div class="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono-sr text-xs space-y-1.5">
                  <div class="flex justify-between"><strong class="text-white">${v.name}</strong><span class="text-slate-400">${v.type}</span></div>
                  <div class="grid grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
                    <div>Handl: <strong>${v.handl}</strong></div>
                    <div>Geschw: <strong>${v.speed}</strong></div>
                    <div>Rumpf: <strong>${v.body}</strong></div>
                    <div>Panz: <strong>${v.armor}</strong></div>
                  </div>
                  <div class="text-[11px] text-slate-400">Sitze: ${v.seats} · Rammen: ${v.ram}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'budget') {
      const prioItems = Object.entries(c.creation.priorities).map(([k, v]) => `
        <div class="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center font-mono-sr">
          <div class="text-[10px] text-slate-400 uppercase">${k}</div>
          <div class="text-2xl font-bold text-rose-400 mt-1">${v}</div>
        </div>
      `).join('');

      bodyHtml = `
        <div class="bg-[#111726]/95 border border-slate-800 rounded-xl p-5 space-y-5 font-mono-sr">
          <div>
            <h3 class="text-sm font-bold text-rose-300 uppercase mb-3">📋 ERSCHAFFUNG: ${c.creation.method.toUpperCase()}</h3>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">${prioItems}</div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <div class="text-slate-400 uppercase text-[10px]">Karma durch Nachteile</div>
              <div class="text-xl font-bold text-emerald-400 mt-1">+${c.creation.karmaFromNeg} Karma</div>
            </div>
            <div class="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <div class="text-slate-400 uppercase text-[10px]">Karma → Nuyen konvertiert</div>
              <div class="text-xl font-bold text-amber-300 mt-1">${c.creation.karmaToNuyen} Karma</div>
            </div>
            <div class="bg-slate-950 border border-rose-500/50 rounded-lg p-4">
              <div class="text-rose-400 uppercase text-[10px]">Schulden bei ${c.creation.creditor}</div>
              <div class="text-xl font-bold text-rose-400 mt-1">-${c.creation.debt.toLocaleString('de-DE')} ¥</div>
            </div>
          </div>
        </div>
      `;
    }

    const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');

    container.innerHTML = `
      <!-- Gunnar Header -->
      <header class="bg-[#111726]/90 border border-rose-500/60 rounded-xl p-5 backdrop-blur-md relative overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.15)]">
        <div class="absolute top-0 right-0 flex items-center bg-rose-950/90 border-b border-l border-rose-500/50 text-xs font-mono-sr">
          <div class="px-3 py-1 text-rose-300 hidden sm:flex items-center gap-1.5 tracking-widest uppercase border-r border-rose-500/30 text-[11px]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#00ff66]"></span>
            <span>AUTOSAVE ON</span>
          </div>
          <div class="flex items-center p-1 gap-1">
            <button type="button" onclick="window.gunnarExportStateJson()" class="lang-btn border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-bold flex items-center gap-1" title="Gunnars Zustand als JSON exportieren">
              💾 <span>Export</span>
            </button>
            <button type="button" onclick="window.gunnarTriggerImportJson()" class="lang-btn border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-bold flex items-center gap-1" title="Gunnars Zustand aus JSON laden">
              📂 <span>Import</span>
            </button>
            <input type="file" id="gunnar-import-json-input" accept=".json" class="hidden" onchange="window.gunnarHandleImportJson(event)">
            <button type="button" onclick="window.gunnarResetState()" class="lang-btn border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white flex items-center gap-1" title="Gunnars Schaden, Muni & Edge zurücksetzen">
              ↺ <span>Reset</span>
            </button>
            <button type="button" onclick="if(typeof openExtendedTestModal==='function') openExtendedTestModal()" class="lang-btn border border-purple-500/70 bg-purple-950/80 hover:border-purple-400 text-purple-300 font-bold flex items-center gap-1.5" title="Ausgedehnte Probe öffnen">
              🎲 <span>${isEn ? 'Extended Test' : 'Ausgedehnte Probe'}</span>
            </button>
            <a href="vtt_tokens.html" target="_blank" class="lang-btn border-2 border-cyan-400 bg-cyan-950/80 hover:border-cyan-300 text-cyan-300 font-bold flex items-center gap-1.5 px-2 py-0.5" title="VTT Token Studio öffnen">
              <span class="animate-pulse">🎯</span> VTT Tokens
            </a>
            <button type="button" onclick="if(typeof setLanguage==='function'){ setLanguage('de'); window.gunnarRefresh(); }" class="lang-btn ${!isEn ? 'active' : 'text-slate-400'}">🇩🇪 DE</button>
            <button type="button" onclick="if(typeof setLanguage==='function'){ setLanguage('en'); window.gunnarRefresh(); }" class="lang-btn ${isEn ? 'active' : 'text-slate-400'}">🇬🇧 EN</button>
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
          <div class="flex items-center gap-5">
            <button type="button" onclick="window.openPortraitLightbox('${c.identity.portrait}', '${c.identity.name}')" class="group relative w-20 h-20 rounded-xl bg-slate-900 border-2 border-rose-400/70 hover:border-rose-300 flex items-center justify-center shadow-[0_0_14px_rgba(244,63,94,0.3)] overflow-hidden flex-shrink-0 cursor-pointer transition" title="Vollbild-Portrait anzeigen">
              <img src="${c.identity.portrait}" alt="${c.identity.name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" style="${c.identity.portraitStyle || ''}">
              <div class="absolute inset-0 bg-rose-400/0 group-hover:bg-rose-400/10 transition pointer-events-none"></div>
            </button>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-3xl md:text-4xl font-bold tracking-wider text-white uppercase">${c.identity.name}</h1>
                <span class="px-2.5 py-0.5 rounded text-xs font-mono-sr bg-rose-950 border border-rose-500/50 text-rose-300 font-bold">STREET SAMURAI</span>
              </div>
              <p class="text-rose-400 font-mono-sr text-sm mt-0.5">${c.identity.archetype} // ${c.identity.height} · ${c.identity.weight}</p>
              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono-sr mt-2">
                <span>SIN: <strong class="text-slate-200">${c.identity.sin}</strong></span>
                <span>•</span>
                <span>Lifestyle: <strong class="text-slate-200">${c.identity.lifestyle}</strong></span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono-sr text-center">
            <div class="bg-slate-900/80 border border-rose-500/40 p-2.5 rounded-lg">
              <div class="text-[11px] text-slate-400 uppercase">Essenz</div>
              <div class="text-xl font-bold text-rose-400">${c.identity.essence.toFixed(2)}</div>
            </div>
            <div class="bg-slate-900/80 border border-slate-700/60 p-2.5 rounded-lg">
              <div class="text-[11px] text-slate-400 uppercase">Edge</div>
              <div class="text-xl font-bold text-cyan-400">${gunnarState.edge} <span class="text-xs text-slate-500">/ ${c.combat.edgeMax}</span></div>
            </div>
            <div class="bg-slate-900/80 border border-amber-500/40 p-2.5 rounded-lg">
              <div class="text-[11px] text-slate-400 uppercase">Initiative</div>
              <div class="text-xl font-bold text-amber-400">${c.combat.initiative}</div>
            </div>
            <div class="bg-slate-900/80 border border-rose-500/50 p-2.5 rounded-lg">
              <div class="text-[11px] text-rose-400 uppercase font-bold">Schulden</div>
              <div class="text-lg font-bold text-rose-300">-42.460 ¥</div>
            </div>
            <div class="bg-slate-900/80 border border-amber-500/50 p-2.5 rounded-lg col-span-2 sm:col-span-1">
              <div class="text-[11px] text-amber-400 uppercase font-bold">Karma</div>
              <div class="text-xl font-bold text-amber-300">${c.identity.karma}</div>
            </div>
          </div>
        </div>

        <nav class="flex flex-wrap gap-2 mt-6 border-t border-slate-800/80 pt-4">
          ${navHtml}
        </nav>
      </header>

      <div class="space-y-6">${bodyHtml}</div>
    `;
  }

  // --- INTERACTIVE HANDLERS FOR GUNNAR ---
  window.switchGlobalView = switchGlobalView;
  window.gunnarSwitchTab = function (tabId) {
    gunnarState.activeTab = tabId;
    saveGunnarState();
    renderGunnarSheet();
  };
  window.gunnarSetDamage = function (type, val) {
    const clamped = Math.max(0, val);
    if (type === 'phys') gunnarState.physDmg = clamped;
    else if (type === 'stun') gunnarState.stunDmg = clamped;
    else if (type === 'overflow') gunnarState.overflowDmg = clamped;
    saveGunnarState();
    renderGunnarSheet();
  };
  window.gunnarAdjustEdge = function (delta) {
    gunnarState.edge = Math.max(0, Math.min(7, gunnarState.edge + delta));
    saveGunnarState();
    renderGunnarSheet();
  };
  window.gunnarSetWeaponMode = function (weaponId, mode) {
    if (!gunnarState.weapons[weaponId]) return;
    gunnarState.weapons[weaponId].mode = mode;
    saveGunnarState();
    renderGunnarSheet();
  };
  window.gunnarAdjustAmmo = function (weaponId, delta) {
    const w = getGunnarChar().weapons.find(x => x.id === weaponId);
    if (!w || !gunnarState.weapons[weaponId]) return;
    gunnarState.weapons[weaponId].ammo = Math.max(0, Math.min(w.maxAmmo, gunnarState.weapons[weaponId].ammo + delta));
    saveGunnarState();
    renderGunnarSheet();
  };
  window.gunnarReload = function (weaponId) {
    const w = getGunnarChar().weapons.find(x => x.id === weaponId);
    if (!w || !gunnarState.weapons[weaponId]) return;
    gunnarState.weapons[weaponId].ammo = w.maxAmmo;
    saveGunnarState();
    renderGunnarSheet();
  };
  window.gunnarAdjustGrenade = function (grenId, delta) {
    const g = getGunnarChar().grenades.find(x => x.id === grenId);
    if (!g) return;
    const cur = gunnarState.grenades[grenId] ?? g.max;
    gunnarState.grenades[grenId] = Math.max(0, Math.min(10, cur + delta));
    saveGunnarState();
    renderGunnarSheet();
  };
  window.gunnarRoll = triggerRoll;
  window.gunnarRefresh = renderGunnarSheet;

  window.openPortraitLightbox = function (src, title) {
    const lb = document.getElementById('portrait-lightbox');
    const img = document.getElementById('portrait-lightbox-img');
    const ttl = document.getElementById('portrait-lightbox-title');
    if (img) img.src = src;
    if (ttl) ttl.textContent = title || 'Portrait';
    if (lb) lb.classList.remove('hidden');
  };
  window.closePortraitLightbox = function () {
    const lb = document.getElementById('portrait-lightbox');
    if (lb) lb.classList.add('hidden');
  };

  window.gunnarExportStateJson = function () {
    const payload = {
      schema: 'sr6_character_state',
      character: 'Gunnar',
      timestamp: new Date().toISOString(),
      state: gunnarState
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gunnar_sr6_state_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  window.gunnarTriggerImportJson = function () {
    const inp = document.getElementById('gunnar-import-json-input');
    if (inp) inp.click();
  };

  window.gunnarHandleImportJson = function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        const st = parsed.state || parsed;
        gunnarState = Object.assign(getDefaultGunnarState(), st);
        gunnarState.weapons = Object.assign(getDefaultGunnarState().weapons, st.weapons || {});
        gunnarState.grenades = Object.assign(getDefaultGunnarState().grenades, st.grenades || {});
        saveGunnarState();
        renderGunnarSheet();
      } catch (err) {
        alert('Ungültige JSON-Datei für Gunnar.');
      }
    };
    reader.readAsText(file);
  };

  window.gunnarResetState = function () {
    if (!confirm('Gunnars Live-Zustand (Schaden, Edge, Munition, Granaten) wirklich auf Standard zurücksetzen?')) return;
    gunnarState = getDefaultGunnarState();
    saveGunnarState();
    renderGunnarSheet();
  };

  // --- INITIALIZE ON DOM READY ---
  function initPartyManager() {
    loadGunnarState();
    const hash = (window.location.hash || '').replace('#', '').toLowerCase();
    let savedView = 'buck';
    if (hash === 'gm' || hash === 'buck' || hash === 'gunnar') {
      savedView = hash;
    } else {
      try {
        const v = localStorage.getItem(ACTIVE_VIEW_KEY);
        if (v === 'gm' || v === 'buck' || v === 'gunnar') savedView = v;
      } catch (e) {}
    }
    switchGlobalView(savedView);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPartyManager);
  } else {
    initPartyManager();
  }
})();
