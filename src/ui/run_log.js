// ============================================================================
// OVERDRIVE-6 // RUN LOG & CAMPAIGN DOSSIER MODULE
// ============================================================================
(function () {
  'use strict';

  const LOG_STORAGE_KEY = 'overdrive6_run_log_v1';

  const CATEGORIES = {
    run:   { label: 'Runs',        icon: '⚡', color: 'amber',   badge: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
    npc:   { label: 'NPCs',        icon: '👤', color: 'rose',    badge: 'bg-rose-950/80 border-rose-500/50 text-rose-300' },
    char:  { label: 'Charaktere',  icon: '🎭', color: 'cyan',    badge: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' },
    place: { label: 'Orte',        icon: '📍', color: 'emerald', badge: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' },
    lore:  { label: 'Wissen',      icon: '🧠', color: 'purple',  badge: 'bg-purple-950/80 border-purple-500/50 text-purple-300' }
  };

  function getStarterEntries() {
    return [
      {
        id: 'seed_run_1',
        category: 'run',
        title: 'Run #1: Hafen Hamburg / Skrapland',
        date: '2082-11-13',
        status: 'Abgeschlossen',
        pinned: true,
        tags: ['hamburg', 'hafen', 'buckshot'],
        reward: '+6 Karma · +20.000 ¥',
        body: 'Erfolgreicher Run im Hamburger Hafen / Skrapland.\n- Team-Auszahlung verbucht\n- Drohnenflotte (Odin, Fenris, Wasp) im Einsatz bewährt'
      },
      {
        id: 'seed_npc_viktor',
        category: 'npc',
        title: 'Viktor (Kredithai)',
        date: '2082-11-20',
        status: 'Feindlich / Gläubiger',
        pinned: true,
        tags: ['gunnar', 'schulden', 'plot-hook'],
        reward: '',
        body: 'Kredithai mit erheblichem Druckmittel gegenüber Gunnar.\n- Offene Schulden: 42.460 ¥\n- Erwartet pünktliche Rückzahlung oder "Gefallen"'
      },
      {
        id: 'seed_npc_maya',
        category: 'npc',
        title: 'Maya',
        date: '2082-11-20',
        status: 'Verpflichtung',
        pinned: false,
        tags: ['gunnar', 'plot-hook'],
        reward: '',
        body: 'Gunnars persönliche Verpflichtung (Stufe 1).\n- Steht unter seinem direkten Schutz.'
      },
      {
        id: 'seed_npc_snow',
        category: 'npc',
        title: 'Snow WT (Connection E8 / L6)',
        date: '2082-11-13',
        status: 'Verbündet',
        pinned: false,
        tags: ['buckshot', 'connection', 'hamburg'],
        reward: '',
        body: 'Hochrangiger Kontakt (Einfluss 8 / Loyalität 6) von Tim "Buckshot" Struck.\n- Erstklassige Quelle für Aufträge, Ausrüstung und Schatten-Infos.'
      },
      {
        id: 'seed_place_werft',
        category: 'place',
        title: "Tim's Rig Services (Bootswerft Hamburg-Skrapland)",
        date: '2082-11-13',
        status: 'Basis / Sicher',
        pinned: false,
        tags: ['hamburg', 'basis', 'buckshot'],
        reward: '',
        body: 'Kfz- & Bootswerft in Hamburg-Skrapland.\n- Sicherer Liegeplatz & Werkstatt für Drohnen, GMC Bulldog und Boote\n- Mittelschicht-Basis (5.000 ¥/Monat)'
      }
    ];
  }

  let logEntries = [];
  let uiState = {
    filterCat: 'all',
    search: '',
    onlyPinned: false,
    editingId: null,
    formOpen: false
  };

  function loadLog() {
    try {
      const raw = localStorage.getItem(LOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          logEntries = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('RunLog load failed:', e);
    }
    logEntries = getStarterEntries();
    saveLog();
  }

  function saveLog() {
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logEntries));
    } catch (e) {
      console.warn('RunLog save failed:', e);
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBodyHtml(text) {
    const safe = escapeHtml(text || '');
    return safe
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('- ')) {
          return `<div class="pl-2">• ${line.trim().slice(2)}</div>`;
        }
        return `<div>${line || '&nbsp;'}</div>`;
      })
      .join('');
  }

  function getFilteredEntries() {
    const q = (uiState.search || '').trim().toLowerCase();
    return logEntries
      .filter(e => {
        if (uiState.filterCat !== 'all' && e.category !== uiState.filterCat) return false;
        if (uiState.onlyPinned && !e.pinned) return false;
        if (q) {
          const hay = [
            e.title,
            e.body,
            e.status,
            e.reward,
            e.date,
            (e.tags || []).join(' ')
          ].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (b.date || '').localeCompare(a.date || '');
      });
  }

  function renderRunLog() {
    const container = document.getElementById('view-run-log');
    if (!container) return;

    const filtered = getFilteredEntries();
    const counts = { all: logEntries.length };
    Object.keys(CATEGORIES).forEach(k => {
      counts[k] = logEntries.filter(e => e.category === k).length;
    });

    const editItem = uiState.editingId
      ? logEntries.find(e => e.id === uiState.editingId)
      : null;

    const filterBtns = [
      { id: 'all', label: `Alle (${counts.all})`, icon: '📚' },
      ...Object.entries(CATEGORIES).map(([k, v]) => ({
        id: k,
        label: `${v.label} (${counts[k] || 0})`,
        icon: v.icon
      }))
    ].map(b => `
      <button type="button" onclick="window.runLogSetFilter('${b.id}')"
        class="px-3 py-1.5 rounded-lg border font-mono-sr text-xs font-bold transition ${
          uiState.filterCat === b.id
            ? 'border-purple-400 bg-purple-950/80 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
            : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:text-white'
        }">
        ${b.icon} ${b.label}
      </button>
    `).join('');

    const formHtml = uiState.formOpen ? `
      <form onsubmit="window.runLogSubmitForm(event)" class="bg-[#111726]/95 border-2 border-purple-500/60 rounded-xl p-5 space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] font-mono-sr text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-sm font-bold text-purple-300 uppercase">
            ${editItem ? '✏️ Eintrag bearbeiten' : '➕ Neuer Run-Log Eintrag'}
          </h3>
          <button type="button" onclick="window.runLogCloseForm()" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">✕ Abbrechen</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase block mb-1">Kategorie</label>
            <select id="rl-category" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-purple-400">
              ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}" ${(editItem ? editItem.category : (uiState.filterCat !== 'all' ? uiState.filterCat : 'run')) === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`).join('')}
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="text-[10px] text-slate-400 uppercase block mb-1">Titel *</label>
            <input id="rl-title" type="text" required placeholder="z. B. Run #2: Extraktion in Altona / Mr. Johnson..."
              value="${escapeHtml(editItem ? editItem.title : '')}"
              class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-purple-400">
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase block mb-1">Datum (Ingame / Real)</label>
            <input id="rl-date" type="text" placeholder="2082-11-23"
              value="${escapeHtml(editItem ? editItem.date : '2082-11-23')}"
              class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-purple-400">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase block mb-1">Status / Haltung</label>
            <input id="rl-status" type="text" placeholder="Aktiv / Erledigt / Verbündet / Feindlich"
              value="${escapeHtml(editItem ? editItem.status : 'Aktiv')}"
              class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-purple-400">
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase block mb-1">Belohnung / Eckdaten (optional)</label>
            <input id="rl-reward" type="text" placeholder="z. B. +4 Karma · +12.000 ¥"
              value="${escapeHtml(editItem ? editItem.reward : '')}"
              class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-purple-400">
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase block mb-1">Tags (kommagetrennt)</label>
            <input id="rl-tags" type="text" placeholder="hamburg, johnson, gunnar, paydata"
              value="${escapeHtml(editItem ? (editItem.tags || []).join(', ') : '')}"
              class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-purple-400">
          </div>
        </div>

        <div>
          <label class="text-[10px] text-slate-400 uppercase block mb-1">Notizen (Zeilen mit "- " werden als Aufzählung formatiert)</label>
          <textarea id="rl-body" rows="5" placeholder="Was ist passiert? Wichtige Infos, Namen, Hinweise, offene Fäden..."
            class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-purple-400">${escapeHtml(editItem ? editItem.body : '')}</textarea>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800">
          <label class="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input id="rl-pinned" type="checkbox" ${editItem && editItem.pinned ? 'checked' : ''} class="accent-purple-500">
            <span>📌 Oben anpinnen</span>
          </label>
          <button type="submit" class="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.35)] transition">
            💾 ${editItem ? 'Änderungen speichern' : 'Eintrag anlegen'}
          </button>
        </div>
      </form>
    ` : '';

    const cardsHtml = filtered.length === 0
      ? `
        <div class="bg-[#111726]/80 border border-slate-800 rounded-xl p-10 text-center font-mono-sr text-slate-400 space-y-2">
          <div class="text-2xl">📭</div>
          <div>Keine Einträge für diesen Filter gefunden.</div>
        </div>
      `
      : `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${filtered.map(item => {
            const cat = CATEGORIES[item.category] || CATEGORIES.lore;
            const tagsHtml = (item.tags || []).map(tg => `
              <button type="button" onclick="window.runLogSetSearch('${escapeHtml(tg)}')"
                class="px-2 py-0.5 rounded bg-slate-900 hover:bg-purple-950 border border-slate-700 hover:border-purple-400 text-[10px] text-slate-300 hover:text-purple-200 transition">
                #${escapeHtml(tg)}
              </button>
            `).join('');

            return `
              <article class="bg-[#111726]/95 border ${item.pinned ? 'border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.12)]' : 'border-slate-800'} rounded-xl p-4 space-y-3 font-mono-sr flex flex-col justify-between">
                <div class="space-y-2.5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="space-y-1">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="px-2 py-0.5 rounded border text-[10px] font-bold ${cat.badge}">${cat.icon} ${cat.label.toUpperCase()}</span>
                        ${item.status ? `<span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300">${escapeHtml(item.status)}</span>` : ''}
                        ${item.date ? `<span class="text-[10px] text-slate-500">${escapeHtml(item.date)}</span>` : ''}
                      </div>
                      <h3 class="text-base font-bold text-white leading-snug">
                        ${item.pinned ? '<span class="text-purple-400 mr-1" title="Angepinnt">📌</span>' : ''}${escapeHtml(item.title)}
                      </h3>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onclick="window.runLogTogglePin('${item.id}')" class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs ${item.pinned ? 'text-purple-300 border-purple-500/50' : 'text-slate-400'}" title="Anpinnen / Lösen">📌</button>
                      <button type="button" onclick="window.runLogEdit('${item.id}')" class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300" title="Bearbeiten">✏️</button>
                      <button type="button" onclick="window.runLogDelete('${item.id}')" class="px-2 py-1 rounded bg-slate-900 hover:bg-rose-950 border border-slate-700 text-xs text-rose-400" title="Löschen">🗑️</button>
                    </div>
                  </div>

                  ${item.reward ? `<div class="inline-block px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">💰 ${escapeHtml(item.reward)}</div>` : ''}

                  <div class="text-xs text-slate-300 leading-relaxed bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1">
                    ${formatBodyHtml(item.body)}
                  </div>
                </div>

                ${tagsHtml ? `<div class="flex flex-wrap gap-1.5 pt-1">${tagsHtml}</div>` : ''}
              </article>
            `;
          }).join('')}
        </div>
      `;

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="bg-[#111726]/95 border border-purple-500/50 rounded-xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></span>
              <h2 class="text-2xl font-bold text-white uppercase tracking-wider font-mono-sr">
                RUN LOG // KAMPAGNEN-DATENBANK
              </h2>
            </div>
            <p class="text-xs font-mono-sr text-purple-300/90 mt-0.5">
              Runs, NPCs, Charaktere, Orte &amp; Wissen zentral notieren · Autosave im Browser + JSON/Markdown-Export
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 font-mono-sr text-xs">
            <button type="button" onclick="window.runLogOpenNew()" class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.35)] transition">
              ➕ Neuer Eintrag
            </button>
            <button type="button" onclick="window.runLogExportJson()" class="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 font-bold" title="Run Log als JSON sichern">
              💾 JSON
            </button>
            <button type="button" onclick="window.runLogTriggerImport()" class="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 font-bold" title="Run Log aus JSON laden">
              📂 Import
            </button>
            <input type="file" id="run-log-import-input" accept=".json" class="hidden" onchange="window.runLogHandleImport(event)">
            <button type="button" onclick="window.runLogExportMarkdown()" class="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 font-bold" title="Als Markdown-Dossier herunterladen">
              📄 .MD
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div class="flex flex-wrap items-center gap-1.5">
            ${filterBtns}
            <button type="button" onclick="window.runLogTogglePinnedOnly()"
              class="px-3 py-1.5 rounded-lg border font-mono-sr text-xs font-bold transition ${
                uiState.onlyPinned
                  ? 'border-amber-400 bg-amber-950/80 text-amber-300'
                  : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:text-white'
              }">
              📌 Nur Angepinnte
            </button>
          </div>
          <div class="flex items-center gap-1.5 font-mono-sr">
            <input type="text" id="run-log-search-input" value="${escapeHtml(uiState.search)}"
              oninput="window.runLogSetSearch(this.value, true)"
              placeholder="🔍 Suchen (Titel, Tag, NPC, Ort...)"
              class="w-full md:w-64 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
            ${uiState.search ? `<button type="button" onclick="window.runLogSetSearch('')" class="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:text-white">✕</button>` : ''}
          </div>
        </div>
      </div>

      ${formHtml}
      ${cardsHtml}
    `;
  }

  // --- GLOBAL HANDLERS ---
  window.renderRunLog = renderRunLog;

  window.runLogSetFilter = function (cat) {
    uiState.filterCat = cat;
    renderRunLog();
  };

  window.runLogTogglePinnedOnly = function () {
    uiState.onlyPinned = !uiState.onlyPinned;
    renderRunLog();
  };

  window.runLogSetSearch = function (val, keepFocus) {
    uiState.search = val || '';
    renderRunLog();
    if (keepFocus) {
      const inp = document.getElementById('run-log-search-input');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    }
  };

  window.runLogOpenNew = function () {
    uiState.editingId = null;
    uiState.formOpen = true;
    renderRunLog();
  };

  window.runLogEdit = function (id) {
    uiState.editingId = id;
    uiState.formOpen = true;
    renderRunLog();
  };

  window.runLogCloseForm = function () {
    uiState.editingId = null;
    uiState.formOpen = false;
    renderRunLog();
  };

  window.runLogSubmitForm = function (ev) {
    ev.preventDefault();
    const category = document.getElementById('rl-category').value;
    const title = document.getElementById('rl-title').value.trim();
    const date = document.getElementById('rl-date').value.trim();
    const status = document.getElementById('rl-status').value.trim();
    const reward = document.getElementById('rl-reward').value.trim();
    const tagsRaw = document.getElementById('rl-tags').value;
    const body = document.getElementById('rl-body').value.trim();
    const pinned = document.getElementById('rl-pinned').checked;
    if (!title) return;

    const tags = tagsRaw.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);

    if (uiState.editingId) {
      const idx = logEntries.findIndex(e => e.id === uiState.editingId);
      if (idx !== -1) {
        logEntries[idx] = { ...logEntries[idx], category, title, date, status, reward, tags, body, pinned };
      }
    } else {
      logEntries.unshift({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        category,
        title,
        date,
        status,
        reward,
        tags,
        body,
        pinned
      });
    }
    uiState.editingId = null;
    uiState.formOpen = false;
    saveLog();
    renderRunLog();
  };

  window.runLogTogglePin = function (id) {
    const item = logEntries.find(e => e.id === id);
    if (!item) return;
    item.pinned = !item.pinned;
    saveLog();
    renderRunLog();
  };

  window.runLogDelete = function (id) {
    const item = logEntries.find(e => e.id === id);
    if (!item) return;
    if (!confirm(`Eintrag "${item.title}" wirklich löschen?`)) return;
    logEntries = logEntries.filter(e => e.id !== id);
    saveLog();
    renderRunLog();
  };

  window.runLogExportJson = function () {
    const payload = {
      schema: 'overdrive6_run_log',
      exportedAt: new Date().toISOString(),
      entries: logEntries
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overdrive6_run_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  window.runLogTriggerImport = function () {
    const inp = document.getElementById('run-log-import-input');
    if (inp) inp.click();
  };

  window.runLogHandleImport = function (ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        const arr = Array.isArray(parsed) ? parsed : parsed.entries;
        if (!Array.isArray(arr)) throw new Error('Invalid format');
        logEntries = arr;
        saveLog();
        renderRunLog();
      } catch (err) {
        alert('Ungültige Run-Log JSON-Datei.');
      }
    };
    reader.readAsText(file);
  };

  window.runLogExportMarkdown = function () {
    const lines = ['# OVERDRIVE-6 // RUN LOG & KAMPAGNEN-DOSSIER', ''];
    Object.entries(CATEGORIES).forEach(([catKey, catInfo]) => {
      const items = logEntries.filter(e => e.category === catKey);
      if (!items.length) return;
      lines.push(`## ${catInfo.icon} ${catInfo.label}`, '');
      items.forEach(it => {
        lines.push(`### ${it.pinned ? '📌 ' : ''}${it.title}`);
        const meta = [it.date, it.status, it.reward].filter(Boolean).join(' | ');
        if (meta) lines.push(`*${meta}*`);
        if (it.tags && it.tags.length) lines.push(`Tags: ${it.tags.map(t => '#' + t).join(' ')}`);
        lines.push('', it.body || '', '');
      });
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overdrive6_run_log_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  loadLog();
})();
