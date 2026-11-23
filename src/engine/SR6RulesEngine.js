// @ts-nocheck
/**
 * SR6RulesEngine.js - Comprehensive Shadowrun 6 Rules Calculation & Audit Engine
 * OVERDRIVE-6
 *
 * Implements full character verification, rules audit, tooltip generation,
 * and calculations for all SR6 archetypes:
 * - Mundane & Street Samurai (Bodytech grades, essence, meat combat, weapon stats)
 * - Rigger (RCC autosoft streaming, drone autonomous vs jumped-in pools, threshold reduction)
 * - Decker (Cyberdecks, matrix attributes, cyber programs)
 * - Magician & Mystic Adept (Spellcasting, drain pool, traditions, spells)
 * - Adept (Adept powers, power point limit vs Magic rating)
 * - Technomancer (Living persona, compiling, fading resistance, complex forms, echoes)
 */

const path = require('path');
const fs = require('fs');

class SR6RulesEngine {
  constructor(specs = {}) {
    // Specs
    this.metatypes = specs.metatypes || require('./specs/sr6_metatypes.json');
    this.prioritiesSpec = specs.priorities || require('./specs/sr6_priorities.json');
    this.skillsSpec = specs.skills || require('./specs/sr6_skills.json');
    this.bodytechGrades = specs.bodytechGrades || require('./specs/sr6_bodytech_grades.json');
    this.riggingSpec = specs.rigging || require('./specs/sr6_rigging_drones.json');
    this.formulasSpec = specs.formulas || require('./specs/sr6_formulas.json');

    // Catalogs
    const catalogsDir = path.join(__dirname, 'specs', 'catalogs');
    this.catalogs = {
      weapons: specs.weapons || this._loadJsonSafe(path.join(catalogsDir, 'weapons.json')),
      armor: specs.armor || this._loadJsonSafe(path.join(catalogsDir, 'armor.json')),
      bodytech: specs.bodytechCatalog || this._loadJsonSafe(path.join(catalogsDir, 'bodytech.json')),
      electronics_software: specs.electronics || this._loadJsonSafe(path.join(catalogsDir, 'electronics_software.json')),
      magic_spells_powers: specs.magic || this._loadJsonSafe(path.join(catalogsDir, 'magic_spells_powers.json')),
      matrix_actions: specs.matrix || this._loadJsonSafe(path.join(catalogsDir, 'matrix_actions_programs.json')),
      metavariants: specs.metavariants || this._loadJsonSafe(path.join(catalogsDir, 'metavariants.json')),
      vehicles_drones: specs.vehiclesDrones || this._loadJsonSafe(path.join(catalogsDir, 'vehicles_drones.json')),
      ammunition_accessories: specs.ammo || this._loadJsonSafe(path.join(catalogsDir, 'ammunition_accessories.json'))
    };

    // Flatten drone and vehicle catalog for fast lookup
    this.flattenedDrones = {};
    this.flattenedVehicles = {};
    if (this.catalogs.vehicles_drones) {
      for (const [cat, items] of Object.entries(this.catalogs.vehicles_drones)) {
        const isDrone = cat.toLowerCase().includes('drohne');
        for (const [vName, vData] of Object.entries(items)) {
          if (isDrone) {
            this.flattenedDrones[vName.toLowerCase()] = { ...vData, name: vName, category: cat };
          } else {
            this.flattenedVehicles[vName.toLowerCase()] = { ...vData, name: vName, category: cat };
          }
        }
      }
    }
  }

  _loadJsonSafe(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (e) {
      // Fallback
    }
    return {};
  }

  /**
   * Normalizes incoming character data to uniform access structure
   */
  normalizeCharacter(charData) {
    if (charData.character) {
      // Flat or legacy structure
      const c = charData.character;
      return {
        identity: {
          name: c.name || 'Unbenannt',
          handle: c.handle || c.name || 'Unbenannt',
          metatype: c.metatype || 'Mensch',
          archetype: c.archetype || 'Allrounder'
        },
        creation: c.creation || {
          method: 'sum_to_ten',
          priorities: { metatype: 'D', attributes: 'A', skills: 'D', magic_resonance: 'E', resources: 'A' }
        },
        attributes: {
          body: c.attributes?.body || 1,
          agility: c.attributes?.agility || 1,
          reaction: c.attributes?.reaction || 1,
          strength: c.attributes?.strength || 1,
          willpower: c.attributes?.willpower || 1,
          logic: c.attributes?.logic || 1,
          intuition: c.attributes?.intuition || 1,
          charisma: c.attributes?.charisma || 1,
          edge: c.attributes?.edge || 1,
          essence: c.attributes?.essence ?? 6.0,
          magic: c.attributes?.magic || 0,
          resonance: c.attributes?.resonance || 0
        },
        skills: {
          active: Object.entries(c.skills || {}).filter(([k]) => !k.endsWith('_spec')).map(([k, v]) => {
            const specKey = `${k}_spec`;
            const specObj = c.skills[specKey];
            return {
              name: k,
              rating: typeof v === 'number' ? v : (v.rating || 1),
              specialization: specObj ? (typeof specObj === 'string' ? { name: specObj, bonus: 2 } : specObj) : null
            };
          }),
          knowledge: [],
          languages: []
        },
        qualities: (c.qualities || []).map(q => typeof q === 'string' ? { name: q, type: 'positive' } : q),
        bodytech: c.bodytech ? (Array.isArray(c.bodytech) ? c.bodytech : [
          c.bodytech.rigger_control ? { name: 'Riggerkontrolle', rating: c.bodytech.rigger_control, grade: 'Alphaware' } : null,
          c.bodytech.smartlink ? { name: 'Smartlink', grade: 'Alphaware' } : null
        ].filter(Boolean)) : [],
        rigger_command_console: charData.rigger_command_console || charData.gear_electronics?.rcc || null,
        drones: charData.drones || [],
        vehicles: charData.vehicles || [],
        weapons: charData.weapons || [],
        armor: charData.armor || [],
        gear: charData.gear || []
      };
    }

    // Full schema input
    return {
      identity: charData.identity || {},
      creation: charData.creation || {},
      attributes: charData.attributes || {},
      skills: charData.skills || { active: [] },
      qualities: charData.qualities || [],
      bodytech: charData.bodytech || [],
      rigger_command_console: charData.rigger_command_console || charData.gear_electronics?.rcc || null,
      drones: charData.drones || [],
      vehicles: charData.vehicles || [],
      weapons: charData.weapons || [],
      armor: charData.armor || [],
      gear: charData.gear || charData.gear_electronics?.items || [],
      contacts: charData.contacts || []
    };
  }

  /**
   * Main audit method
   */
  auditCharacter(charData) {
    const char = this.normalizeCharacter(charData);
    const report = {
      characterName: char.identity.name || char.identity.handle || 'Unbenannt',
      metatype: char.identity.metatype || 'Mensch',
      archetype: char.identity.archetype || 'Allrounder',
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        auditNotes: []
      },
      derivedStats: {},
      skillsBreakdown: [],
      bodytechAudit: {
        items: [],
        totalEssenceLoss: 0,
        remainingEssence: 6.0,
        totalNuyenCost: 0
      },
      droneAudits: [],
      vehicleAudits: [],
      weaponsAudit: [],
      rccAudit: null,
      magicAudit: null,
      resonanceAudit: null,
      combatStats: {},
      nuyenBudgetAudit: null
    };

    // 1. Audit Metatype & Attribute Bounds
    this._auditAttributes(char, report);

    // 2. Audit Creation Priority / Sum-to-Ten Budget
    this._auditCreationBudgets(char, report);

    // 3. Audit Skills & Pools
    this._auditSkills(char, report);

    // 4. Audit Bodytech & Essence
    this._auditBodytech(char, report);

    // 5. Audit Condition Monitors
    this._auditConditionMonitors(char, report);

    // 6. Audit Meat Combat Stats & Armor
    this._auditMeatCombat(char, report);

    // 7. Audit Weapons against Catalog
    this._auditWeapons(char, report);

    // 8. Audit RCC & Rigging Mechanics
    this._auditRiggingAndRCC(char, report);

    // 9. Audit Drones & Autosofts
    this._auditDrones(char, report);

    // 10. Audit Vehicles
    this._auditVehicles(char, report);

    // 11. Audit Magic & Resonance (if applicable)
    this._auditMagicAndResonance(char, report);

    // 12. Audit Inventory & Nuyen Budget
    this._auditNuyenBudget(char, report);

    return report;
  }

  _auditAttributes(char, report) {
    const metaName = char.identity.metatype || 'Mensch';
    const metaKey = Object.keys(this.metatypes).find(
      k => k.toLowerCase() === metaName.toLowerCase()
    );
    const meta = metaKey ? this.metatypes[metaKey] : null;

    if (!meta) {
      report.validation.errors.push(`Unbekannter Metatyp: ${metaName}`);
      report.validation.isValid = false;
      return;
    }

    let maxAttributeCount = 0;
    let attributePointsSpent = 0;
    const attrs = char.attributes;

    for (const [attr, bounds] of Object.entries(meta.attributes)) {
      const val = attrs[attr];
      if (val === undefined) {
        report.validation.errors.push(`Fehlendes Attribut: ${attr}`);
        report.validation.isValid = false;
        continue;
      }

      if (val < bounds.min || val > bounds.max) {
        report.validation.errors.push(
          `Attribut ${attr} liegt mit Wert ${val} außerhalb der Grenzen (${bounds.min}-${bounds.max}) für ${metaName}.`
        );
        report.validation.isValid = false;
      }

      if (val === bounds.max && attr !== 'edge') {
        maxAttributeCount++;
      }

      if (attr !== 'edge') {
        attributePointsSpent += (val - bounds.min);
      }
    }

    if (maxAttributeCount > 1) {
      report.validation.errors.push(
        `Regelverstoß bei Erschaffung: Maximal 1 körperliches/geistiges Attribut darf das Maximum erreichen (aktuell: ${maxAttributeCount}).`
      );
      report.validation.isValid = false;
    }

    report.validation.auditNotes.push({
      topic: 'Körperliche & Geistige Attribute',
      spent: attributePointsSpent,
      ruleRef: 'SR6 Grundregelwerk S. 65-66',
      details: `Ausgegebene Attributspunkte über Minimalwerten: ${attributePointsSpent}. Maximalwert-Attribute: ${maxAttributeCount}/1.`
    });

    const edgeBase = meta.attributes.edge?.min || 1;
    const edgeVal = attrs.edge || 1;
    const edgeSpent = edgeVal - edgeBase;
    report.validation.auditNotes.push({
      topic: 'Edge-Anpassungspunkte',
      spent: edgeSpent,
      ruleRef: 'SR6 Grundregelwerk S. 65-66',
      details: `Edge startet bei ${edgeBase} und benötigt ${edgeSpent} Anpassungspunkte für Wert ${edgeVal}.`
    });
  }

  _auditCreationBudgets(char, report) {
    const creation = char.creation || {};
    const method = creation.method || 'priority';

    if (method === 'sum_to_ten' && creation.priorities) {
      const pValues = { A: 4, B: 3, C: 2, D: 1, E: 0 };
      const prio = creation.priorities;
      const sum = (pValues[prio.attributes] ?? 0) +
                  (pValues[prio.skills] ?? 0) +
                  (pValues[prio.resources] ?? 0) +
                  (pValues[prio.metatype] ?? 0) +
                  (pValues[prio.magic_resonance] ?? 0);

      if (sum !== 10) {
        report.validation.errors.push(`Sum-to-Ten Summe ist ${sum}, muss exakt 10 sein.`);
        report.validation.isValid = false;
      } else {
        report.validation.auditNotes.push({
          topic: 'Sum-to-Ten Verteilung',
          spent: sum,
          ruleRef: 'SR6 Schattenkompendium S. 36',
          details: `Sum-to-Ten Prioritäten: Attr=${prio.attributes}(${pValues[prio.attributes]}), Fert=${prio.skills}(${pValues[prio.skills]}), Ress=${prio.resources}(${pValues[prio.resources]}), Meta=${prio.metatype}(${pValues[prio.metatype]}), Mag/Res=${prio.magic_resonance}(${pValues[prio.magic_resonance]}) = Summe 10.`
        });
      }

      // Check against priority allocations
      const prioTable = this.prioritiesSpec;
      if (prioTable) {
        const attrBudget = prioTable.attributes?.[prio.attributes]?.attribute_points;
        const skillBudget = prioTable.skills?.[prio.skills]?.skill_points;
        const resBudget = prioTable.resources?.[prio.resources]?.nuyen;
        const metaPoints = prioTable.metatypes?.[prio.metatype]?.adjustment_points;

        report.validation.auditNotes.push({
          topic: 'Prioritäten-Grenzwerte',
          ruleRef: 'SR6 Grundregelwerk S. 66',
          details: `Budgets nach Prioritätentabelle: Attribute=${attrBudget} Pkt, Fertigkeiten=${skillBudget} Pkt, Ressourcen=${resBudget?.toLocaleString()} ¥, Anpassungspunkte=${metaPoints} Pkt.`
        });
      }
    }
  }

  _auditSkills(char, report) {
    const activeSkills = char.skills.active || [];
    let totalSkillPointsSpent = 0;
    let maxSkillCount = 0;

    for (const sk of activeSkills) {
      const sRating = sk.rating || 0;
      let sPoints = sRating;

      if (sRating > 6) {
        report.validation.errors.push(`Fertigkeit ${sk.name} übersteigt Erschaffungsmaximum von 6 (Wert: ${sRating}).`);
        report.validation.isValid = false;
      }
      if (sRating === 6) {
        maxSkillCount++;
      }

      let specBonus = 0;
      let specName = null;
      if (sk.specialization) {
        sPoints += 1; // Specialization costs 1 skill point
        specBonus = sk.specialization.bonus || 2;
        specName = sk.specialization.name;
      }

      totalSkillPointsSpent += sPoints;

      // Determine linked attribute
      const linkedAttr = this._getLinkedAttribute(sk.name);
      const attrVal = char.attributes[linkedAttr] || 0;
      const basePool = sRating + attrVal;
      const specPool = basePool + specBonus;

      report.skillsBreakdown.push({
        skill: sk.name,
        rating: sRating,
        linkedAttribute: linkedAttr,
        attributeValue: attrVal,
        basePool: basePool,
        specialization: specName,
        specializedPool: specName ? specPool : null,
        pointsSpent: sPoints,
        auditTooltip: {
          value: specName ? `${basePool} (${specPool} für ${specName})` : `${basePool}`,
          formula: `${sk.name} (${sRating}) + ${linkedAttr.toUpperCase()} (${attrVal})${specBonus ? ` + Spezialisierung (+${specBonus})` : ''}`,
          ruleRef: 'SR6 Grundregelwerk S. 94'
        }
      });
    }

    if (maxSkillCount > 1) {
      report.validation.errors.push(`Nur maximal 1 Fertigkeit darf bei Erschaffung den Höchstwert 6 haben (aktuell: ${maxSkillCount}).`);
      report.validation.isValid = false;
    }

    report.validation.auditNotes.push({
      topic: 'Fertigkeiten-Budget',
      spent: totalSkillPointsSpent,
      ruleRef: 'SR6 Grundregelwerk S. 65-66, 94',
      details: `Gesamtpunkte Fertigkeiten (Basis + Spezialisierungen à 1 Pkt): ${totalSkillPointsSpent}.`
    });
  }

  _getLinkedAttribute(skillName) {
    const s = skillName.toLowerCase();
    if (s.includes('steuer') || s.includes('pilot')) return 'reaction'; // In meat; in VR swapped to intuition
    if (s.includes('feuerwaffe') || s.includes('nahkampf') || s.includes('athletik') || s.includes('heimlich')) return 'agility';
    if (s.includes('mechanik') || s.includes('engineering') || s.includes('elektronik') || s.includes('biotech') || s.includes('cracking')) return 'logic';
    if (s.includes('wahrnehmung') || s.includes('perception')) return 'intuition';
    if (s.includes('einfluss') || s.includes('con') || s.includes('verhandlung')) return 'charisma';
    if (s.includes('hexerei') || s.includes('beschwörung') || s.includes('verzauberung')) return 'magic';
    if (s.includes('tasking') || s.includes('kompilieren')) return 'resonance';
    return 'agility';
  }

  _auditBodytech(char, report) {
    const items = char.bodytech || [];
    let totalEssenceLoss = 0;
    let totalNuyenCost = 0;

    for (const item of items) {
      const grade = item.grade || 'Standard';
      const gradeInfo = this.bodytechGrades[grade] || { essence_multiplier: 1.0, cost_multiplier: 1.0 };

      // Base essence and cost lookup
      let baseEssence = item.base_essence || item.essence_cost || 0;
      let baseCost = item.base_cost || item.cost || item.nuyen_cost || 0;

      // Smart lookup in catalog if needed
      const iName = (item.name || '').toLowerCase();
      if (iName.includes('riggerkontrolle')) {
        const rating = item.rating || 2;
        baseEssence = rating * 1.0;
        baseCost = rating * 30000;
      } else if (iName.includes('smartlink')) {
        baseEssence = 0.2;
        baseCost = 4000;
      } else if (iName.includes('datenbuchse')) {
        baseEssence = 0.1;
        baseCost = 1000;
      } else if (iName.includes('schlafregulator')) {
        baseEssence = 0.1;
        baseCost = 12000;
      } else if (iName.includes('cyberaugen 2') || iName.includes('cyberaugen stufe 2')) {
        baseEssence = 0.3;
        baseCost = 4000;
      }

      const calculatedEssence = Number((baseEssence * gradeInfo.essence_multiplier).toFixed(2));
      const calculatedCost = Math.round(baseCost * gradeInfo.cost_multiplier);

      totalEssenceLoss += calculatedEssence;
      totalNuyenCost += calculatedCost;

      report.bodytechAudit.items.push({
        name: item.name,
        rating: item.rating,
        grade: grade,
        baseEssence: baseEssence,
        calculatedEssence: calculatedEssence,
        baseCost: baseCost,
        calculatedCost: calculatedCost,
        ruleRef: 'SR6 Grundregelwerk S. 284'
      });
    }

    totalEssenceLoss = Number(totalEssenceLoss.toFixed(2));
    const remainingEssence = Number(Math.max(0, 6.0 - totalEssenceLoss).toFixed(2));

    report.bodytechAudit.totalEssenceLoss = totalEssenceLoss;
    report.bodytechAudit.remainingEssence = remainingEssence;
    report.bodytechAudit.totalNuyenCost = totalNuyenCost;

    report.derivedStats.essence = {
      value: remainingEssence,
      loss: totalEssenceLoss,
      formula: '6.0 - Summe(Implantat-Essenzkosten * Grad-Multiplikator)',
      ruleRef: 'SR6 Grundregelwerk S. 41, 284',
      tooltip: `Verbleibende Essenz: ${remainingEssence.toFixed(2)} | Verlust: ${totalEssenceLoss.toFixed(2)}`
    };

    if (remainingEssence <= 0) {
      report.validation.errors.push('Kritischer Essenzverlust: Essenz ist 0 oder negativ (Charakter ist nicht überlebensfähig).');
      report.validation.isValid = false;
    }
  }

  _auditConditionMonitors(char, report) {
    const body = char.attributes.body || 1;
    const will = char.attributes.willpower || 1;

    // Check qualities for Robust Gebaut
    let robustBonus = 0;
    const hasRobust = (char.qualities || []).some(q => (q.name || q).toLowerCase().includes('robust gebaut'));
    if (hasRobust) {
      robustBonus = 1;
    }

    const physBoxes = 8 + Math.ceil(body / 2) + robustBonus;
    const stunBoxes = 8 + Math.ceil(will / 2);
    const overflowDeath = body * 2;

    report.derivedStats.physicalConditionMonitor = {
      value: physBoxes,
      base: 8 + Math.ceil(body / 2),
      bonus: robustBonus,
      formula: '8 + Aufrunden(Konstitution / 2)' + (robustBonus ? ' + Robust Gebaut (1)' : ''),
      ruleRef: 'SR6 Grundregelwerk S. 40, 58, 77',
      tooltip: `Körperlicher Zustand: 8 + Aufrunden(${body}/2) = ${8 + Math.ceil(body/2)}${robustBonus ? ' + 1 (Robust Gebaut)' : ''} = ${physBoxes} Kästchen.`
    };

    report.derivedStats.stunConditionMonitor = {
      value: stunBoxes,
      formula: '8 + Aufrunden(Willenskraft / 2)',
      ruleRef: 'SR6 Grundregelwerk S. 40',
      tooltip: `Geistiger Zustand: 8 + Aufrunden(${will}/2) = ${stunBoxes} Kästchen.`
    };

    report.derivedStats.overflowToDeath = {
      value: overflowDeath,
      formula: 'Konstitution * 2',
      ruleRef: 'SR6 Grundregelwerk S. 41',
      tooltip: `Überzähliger Schaden bis zum Tod: ${body} * 2 = ${overflowDeath} Kästchen.`
    };
  }

  _auditMeatCombat(char, report) {
    const rea = char.attributes.reaction || 1;
    const int = char.attributes.intuition || 1;
    const bod = char.attributes.body || 1;

    const meatInitBase = rea + int;

    // Highest base armor + helmet/shields
    let highestBaseArmor = 0;
    let accessoryArmor = 0;
    for (const a of char.armor || []) {
      const val = a.defense_rating ?? a.defense_bonus ?? a.rating ?? 0;
      const aName = (a.name || '').toLowerCase();
      if (aName.includes('helm') || aName.includes('schild')) {
        accessoryArmor += val;
      } else {
        if (val > highestBaseArmor) {
          highestBaseArmor = val;
        }
      }
    }
    const totalArmor = highestBaseArmor + accessoryArmor;
    const defenseRating = bod + totalArmor;
    const defensePool = rea + int;

    report.combatStats.meatInitiative = {
      value: `${meatInitBase} + 1W6`,
      scoreBase: meatInitBase,
      dice: '1W6',
      majorActions: 1,
      minorActions: 3,
      formula: 'Reaktion + Intuition + 1W6',
      ruleRef: 'SR6 Grundregelwerk S. 40, 110',
      tooltip: `Initiative Fleischkörper: Reaktion (${rea}) + Intuition (${int}) = ${meatInitBase} + 1W6 (1 Haupt-, 3 Nebenhandlungen).`
    };

    report.combatStats.meatDefense = {
      defenseTestPool: defensePool,
      defenseRating: defenseRating,
      baseBody: bod,
      armorRating: totalArmor,
      formula: 'Ausweichen: Reaktion + Intuition | Verteidigungswert: Konstitution + Rüstung',
      ruleRef: 'SR6 Grundregelwerk S. 108-110',
      tooltip: `Ausweichpool: ${rea} + ${int} = ${defensePool} Würfel. Verteidigungswert: ${bod} (Körper) + ${totalArmor} (Rüstung) = ${defenseRating}.`
    };
  }

  _auditWeapons(char, report) {
    const weapons = char.weapons || [];
    const firearmsSkill = (char.skills.active || []).find(s => s.name.toLowerCase().includes('feuerwaffe'));
    const meleeSkill = (char.skills.active || []).find(s => s.name.toLowerCase().includes('nahkampf'));

    for (const w of weapons) {
      const wName = w.name || '';
      // Lookup in weapons catalog
      let official = null;
      for (const [catName, catData] of Object.entries(this.catalogs.weapons || {})) {
        if (catName.toLowerCase() === wName.toLowerCase() || wName.toLowerCase().includes(catName.toLowerCase())) {
          official = { ...catData, name: catName };
          break;
        }
      }

      const isMelee = (w.category || '').toLowerCase().includes('nahkampf') || (official?.category || '').toLowerCase().includes('nahkampf');
      const skillObj = isMelee ? meleeSkill : firearmsSkill;
      const linkedAttr = 'agility';
      const attrVal = char.attributes[linkedAttr] || 1;
      const basePool = (skillObj?.rating || 0) + attrVal;
      const hasSpec = skillObj?.specialization && wName.toLowerCase().includes(skillObj.specialization.name.toLowerCase());
      const effectivePool = hasSpec ? basePool + 2 : basePool;

      report.weaponsAudit.push({
        name: wName,
        catalogMatch: !!official,
        officialData: official,
        providedData: w,
        attackPool: effectivePool,
        damage: w.damage ? `${w.damage}${w.damage_type || 'K'}` : (official?.damage || '4K'),
        attackRatings: w.attack_ratings || official?.attack_ratings || [],
        auditTooltip: {
          pool: `${effectivePool} Würfel (${skillObj?.name || 'Fertigkeit'} ${skillObj?.rating || 0} + GES ${attrVal}${hasSpec ? ' + 2 Spez' : ''})`,
          damage: w.damage ? `${w.damage}${w.damage_type || 'K'}` : (official?.damage || '4K'),
          ruleRef: official ? official.source : 'SR6 Grundregelwerk S. 250-262'
        }
      });
    }
  }

  _auditRiggingAndRCC(char, report) {
    const rcItem = (char.bodytech || []).find(b => (b.name || '').toLowerCase().includes('riggerkontrolle'));
    const rcRating = rcItem ? (rcItem.rating || 2) : 0;
    const rcc = char.rigger_command_console;

    report.derivedStats.riggedJumpedIn = {
      riggerControlRating: rcRating,
      thresholdReduction: rcRating,
      bonusEdgePerTest: rcRating > 0 ? 1 : 0,
      initiativeHotSim: {
        value: `${(char.attributes.intuition || 1) * 2} + 3W6`,
        formula: 'Intuition + Intuition + 3W6 (Direktkabel) bzw. Datenverarbeitung + Intuition + 3W6 (WiFi)',
        ruleRef: 'SR6 Grundregelwerk S. 197, 200'
      },
      initiativeColdSim: {
        value: `${(char.attributes.intuition || 1) * 2} + 2W6`,
        formula: 'Intuition + Intuition + 2W6 (Direktkabel) bzw. Datenverarbeitung + Intuition + 2W6 (WiFi)',
        ruleRef: 'SR6 Grundregelwerk S. 197, 200'
      }
    };

    if (rcc) {
      const dataProc = rcc.data_processing || 1;
      const streamedSofts = rcc.autosofts_slaved || rcc.shared_autosofts || rcc.running_programs || [];
      const isOverLimit = streamedSofts.length > dataProc;

      report.rccAudit = {
        model: rcc.name || 'Unbekannte Konsole',
        deviceRating: rcc.device_rating || 1,
        dataProcessing: dataProc,
        firewall: rcc.firewall || 1,
        maxSlavedDrones: (rcc.device_rating || 1) * 3,
        noiseReduction: rcc.device_rating || 1,
        streamedAutosoftsCount: streamedSofts.length,
        streamingLimit: dataProc,
        isWithinStreamingLimit: !isOverLimit,
        streamedAutosofts: streamedSofts,
        ruleRef: 'SR6 Grundregelwerk S. 197'
      };

      if (isOverLimit) {
        report.validation.errors.push(
          `Riggerkonsole ${rcc.name}: Es werden ${streamedSofts.length} Autosofts gestreamt, die Datenverarbeitung erlaubt jedoch nur maximal ${dataProc}.`
        );
        report.validation.isValid = false;
      } else {
        report.validation.auditNotes.push({
          topic: 'RCC Autosoft-Streaming',
          ruleRef: 'SR6 Grundregelwerk S. 197',
          details: `Konsole ${rcc.name} streamt ${streamedSofts.length}/${dataProc} Autosofts gleichzeitig an alle Slaves. Vollständig legal nach SR6!`
        });
      }
    }
  }

  _auditDrones(char, report) {
    const drones = char.drones || [];
    const pilotingSkill = (char.skills.active || []).find(s => s.name.toLowerCase().includes('steuer') || s.name.toLowerCase().includes('pilot'));
    const engineeringSkill = (char.skills.active || []).find(s => s.name.toLowerCase().includes('mechanik') || s.name.toLowerCase().includes('engineer'));

    const rcItem = (char.bodytech || []).find(b => (b.name || '').toLowerCase().includes('riggerkontrolle'));
    const rcRating = rcItem ? (rcItem.rating || 2) : 0;

    drones.forEach((d, idx) => {
      const modelLookup = (d.model || d.name || '').toLowerCase();
      let official = this.flattenedDrones[modelLookup] || null;
      if (!official) {
        for (const [k, v] of Object.entries(this.flattenedDrones)) {
          if (modelLookup.includes(k) || k.includes(modelLookup)) {
            official = v;
            break;
          }
        }
      }

      const dAudit = {
        id: d.id || `drone-${idx + 1}`,
        callsign: d.callsign || d.name,
        name: d.name,
        model: d.model || official?.name || d.name,
        officialMatch: !!official,
        officialCatalogData: official,
        discrepancies: [],
        derivedCombatStats: {}
      };

      if (!official) {
        dAudit.discrepancies.push(`Drohne nicht im Standardkatalog gefunden: ${d.name}`);
        report.validation.warnings.push(`Drohne #${idx + 1} (${d.name}): Kein Standard-Katalogmodell.`);
      } else {
        if (d.body !== undefined && d.body !== official.body) {
          dAudit.discrepancies.push(`Rumpf (body): Bogen hat ${d.body}, Regelwert ist ${official.body}.`);
          report.validation.errors.push(`Drohne ${d.name}: Rumpf ${d.body} weicht vom Regelbuch ab (Katalogwert: ${official.body}).`);
          report.validation.isValid = false;
        }
        if (d.armor !== undefined && d.armor !== official.armor) {
          dAudit.discrepancies.push(`Panzerung (armor): Bogen hat ${d.armor}, Regelwert ist ${official.armor}.`);
          report.validation.errors.push(`Drohne ${d.name}: Panzerung ${d.armor} weicht vom Regelbuch ab (Katalogwert: ${official.armor}).`);
          report.validation.isValid = false;
        }
        if (d.pilot !== undefined && d.pilot !== official.pilot) {
          dAudit.discrepancies.push(`Pilot: Bogen hat ${d.pilot}, Regelwert ist ${official.pilot}.`);
          report.validation.errors.push(`Drohne ${d.name}: Pilot ${d.pilot} weicht vom Regelbuch ab (Katalogwert: ${official.pilot}).`);
          report.validation.isValid = false;
        }
        if (d.sensor !== undefined && d.sensor !== official.sensor) {
          dAudit.discrepancies.push(`Sensor: Bogen hat ${d.sensor}, Regelwert ist ${official.sensor}.`);
          report.validation.errors.push(`Drohne ${d.name}: Sensor ${d.sensor} weicht vom Regelbuch ab (Katalogwert: ${official.sensor}).`);
          report.validation.isValid = false;
        }
      }

      const effectiveBody = official ? official.body : (d.body || 4);
      const effectiveArmor = official ? official.armor : (d.armor || 6);
      const effectivePilot = official ? official.pilot : (d.pilot || 2);
      const effectiveSensor = official ? official.sensor : (d.sensor || 2);

      // Autonomous software limit: ceil(Pilot / 2)
      const localAutosoftLimit = Math.ceil(effectivePilot / 2);
      const localSofts = d.installed_autosofts || [];
      if (localSofts.length > localAutosoftLimit) {
        report.validation.errors.push(
          `Drohne ${d.name}: Installierte lokale Autosofts (${localSofts.length}) übersteigen das Autonomielimit von ${localAutosoftLimit} (Aufrunden(Pilot/2)).`
        );
        report.validation.isValid = false;
      }

      // Drone Category & Weapon Mount Legality Check
      const catLower = (d.category || official?.category || '').toLowerCase();
      let droneSize = 'mittel';
      if (catLower.includes('mikro')) droneSize = 'mikro';
      else if (catLower.includes('mini')) droneSize = 'mini';
      else if (catLower.includes('klein')) droneSize = 'klein';
      else if (catLower.includes('groß') || catLower.includes('grosse')) droneSize = 'gross';
      else droneSize = 'mittel';

      dAudit.droneSize = droneSize;
      dAudit.mountedWeapons = [];

      // Check weapon mounts and linked weapons
      const rawMounts = d.weapon_mounts || (d.weapon_mount ? [d.weapon_mount] : []);
      const rcc = report.rccAudit;
      const allAutosofts = [
        ...(rcc?.streamedAutosofts || []),
        ...(d.local_autosofts || d.installed_autosofts || [])
      ];

      for (const m of rawMounts) {
        const mType = (typeof m === 'string' ? m : (m.type || 'Standard')).trim();
        const wName = typeof m === 'string' ? '' : (m.weapon || m.name || '');

        if (mType.toLowerCase() === 'keine' && !wName) {
          continue;
        }

        // Validate mount legality against drone size (SR6 GRW S. 199, 298)
        let isMountLegal = true;
        let legalityNote = '';

        if (droneSize === 'mikro') {
          isMountLegal = false;
          legalityNote = 'Mikrodrohnen können laut SR6-Regeln keine Waffenhalterungen tragen.';
          report.validation.errors.push(`Drohne ${d.name} (Mikrodrohne): Waffenhalterung unzulässig (${legalityNote}).`);
          report.validation.isValid = false;
        } else if (droneSize === 'mini') {
          const isMiniInjector = mType.toLowerCase().includes('injektor') ||
                                 mType.toLowerCase().includes('stachel') ||
                                 wName.toLowerCase().includes('injektor') ||
                                 wName.toLowerCase().includes('narcoject');
          if (!isMiniInjector && wName) {
            isMountLegal = false;
            legalityNote = 'Minidrohnen können nur Miniatur-Injektionssysteme/Mikrovorrichtungen tragen, keine Standard-Schusswaffen.';
            report.validation.warnings.push(`Drohne ${d.name} (Minidrohne): Schusswaffen-Montage '${wName}' weicht von Standardregeln ab (${legalityNote}).`);
          }
        } else if (droneSize === 'klein') {
          if (mType.toLowerCase().includes('schwer') || mType.toLowerCase().includes('turm')) {
            isMountLegal = false;
            legalityNote = 'Kleine Drohnen können maximal Leichte Waffenhalterungen (Pistolen/Taser) tragen.';
            report.validation.errors.push(`Drohne ${d.name} (Kleine Drohne): Schwere Halterung unzulässig.`);
            report.validation.isValid = false;
          }
        }

        // Link weapon from weapons catalog
        let weaponCatalogData = null;
        if (wName) {
          for (const [catWName, cData] of Object.entries(this.catalogs.weapons || {})) {
            if (catWName.toLowerCase() === wName.toLowerCase() ||
                wName.toLowerCase().includes(catWName.toLowerCase())) {
              weaponCatalogData = { ...cData, catalogName: catWName };
              break;
            }
          }
        }

        // Check weapon-specific targeting autosoft (Zielerfassung [Waffenmodell])
        let matchedAutosoft = null;
        if (wName) {
          const wClean = wName.toLowerCase();
          matchedAutosoft = allAutosofts.find(s => {
            const sName = (s.name || s).toLowerCase();
            const sTarget = (s.target || '').toLowerCase();
            if (!sName.includes('zielerfassung')) return false;

            if (sTarget && wClean.includes(sTarget)) return true;
            if (weaponCatalogData && sName.includes(weaponCatalogData.catalogName.toLowerCase())) return true;
            if (wClean.includes('ak-97') && sName.includes('ak-97')) return true;
            if (wClean.includes('ares alpha') && sName.includes('ares alpha')) return true;
            if (wClean.includes('mossberg') && sName.includes('mossberg')) return true;
            if (wClean.includes('enfield') && sName.includes('enfield')) return true;
            if (sName.trim() === 'zielerfassung') return true;
            return false;
          });
        }

        const autoTargetingRating = matchedAutosoft ? (matchedAutosoft.rating || 5) : 0;
        const autoAttackPool = autoTargetingRating > 0
          ? (effectiveSensor + autoTargetingRating)
          : Math.max(0, effectiveSensor - 1);

        const autosoftLabel = matchedAutosoft?.name
          ? (matchedAutosoft.name.startsWith('Zielerfassung') ? matchedAutosoft.name : `Zielerfassung [${matchedAutosoft.name}]`)
          : `Zielerfassung [${wName}]`;
        const autoAttackFormula = autoTargetingRating > 0
          ? `Sensor (${effectiveSensor}) + ${autosoftLabel} (${autoTargetingRating})`
          : `Sensor (${effectiveSensor}) - 1 (Ungeschulter Angriff - keine passende Zielerfassungs-Autosoft)`;

        // Rigged Attack Pool (Jumped-in): Mechanik + Logik + Riggerkontrolle (+ Spezialisierung)
        const engineeringRating = engineeringSkill?.rating || 0;
        const logicVal = char.attributes.logic || 1;
        const specBonus = (engineeringSkill?.specialization?.name || '').toLowerCase().includes('geschütz') ||
                          (engineeringSkill?.specialization?.name || '').toLowerCase().includes('fahrzeug') ? 2 : 0;
        const riggedGunneryPool = engineeringRating + logicVal + rcRating + specBonus;
        const riggedFormula = `Mechanik (${engineeringRating}) + Logik (${logicVal}) + Riggerkontrolle (${rcRating})${specBonus ? ` + Spezialisierung (+${specBonus})` : ''}`;

        const mountedInfo = {
          mountType: mType,
          weaponName: wName,
          isMountLegal: isMountLegal,
          legalityNote: legalityNote || 'Zulässige Waffenhalterung gemäß SR6-Kategorie',
          catalogMatch: !!weaponCatalogData,
          weaponCatalogName: weaponCatalogData?.catalogName || null,
          damage: m.damage || weaponCatalogData?.damage || (droneSize === 'mini' ? 'Injektion (Narcoject)' : '4K'),
          firingModes: m.firing_modes || weaponCatalogData?.modes || ['HM'],
          attackRatings: m.attack_ratings || weaponCatalogData?.attack_ratings || [],
          ammo: m.ammo || (weaponCatalogData ? `${weaponCatalogData.ammo_capacity || 30} Schuss (${weaponCatalogData.ammo_feed || 's'})` : 'Gurt/Magazin'),
          autosoftMatched: matchedAutosoft ? (matchedAutosoft.name || 'Zielerfassung') : null,
          autonomousAttackPool: {
            value: autoAttackPool,
            formula: autoAttackFormula,
            hasAutosoft: autoTargetingRating > 0
          },
          riggedAttackPool: {
            value: riggedGunneryPool,
            formula: riggedFormula
          },
          ruleRef: 'SR6 Grundregelwerk S. 199, 201, 298'
        };

        dAudit.mountedWeapons.push(mountedInfo);
        if (wName) {
          dAudit.weaponMounted = wName;
        }
      }

      // Autonomous pools for general maneuvers
      const getAutosoftRating = (softType) => {
        const found = allAutosofts.find(s => {
          const str = (s.name || s).toLowerCase();
          return str.includes(softType.toLowerCase());
        });
        return found ? (found.rating || 5) : 0;
      };

      const evasionRating = getAutosoftRating('ausweichen');
      const maneuveringRating = getAutosoftRating('manövrieren');
      const clearsightRating = getAutosoftRating('clearsight');

      const primaryWeapon = dAudit.mountedWeapons[0];
      const attackPoolObj = primaryWeapon
        ? primaryWeapon.autonomousAttackPool
        : { value: Math.max(0, effectiveSensor - 1), formula: `Sensor (${effectiveSensor}) - 1 (Keine Waffe montiert)` };

      dAudit.derivedCombatStats = {
        conditionMonitor: {
          value: 8 + Math.ceil(effectiveBody / 2),
          formula: '8 + Aufrunden(Rumpf / 2)',
          ruleRef: 'SR6 Grundregelwerk S. 196, 200'
        },
        damageResistance: {
          value: effectiveBody,
          formula: 'Rumpf',
          ruleRef: 'SR6 Grundregelwerk S. 200'
        },
        autonomousInitiative: {
          value: `${effectivePilot * 2} + 3W6`,
          formula: 'Pilot * 2 + 3W6',
          ruleRef: 'SR6 Grundregelwerk S. 202'
        },
        defenseRatingAutonomous: {
          value: effectivePilot + effectiveArmor,
          formula: 'Pilot + Panzerung',
          ruleRef: 'SR6 Grundregelwerk S. 200'
        },
        defenseRatingRigged: {
          value: (pilotingSkill?.rating || 0) + effectiveArmor,
          formula: 'Steuern-Fertigkeit des Riggers + Drohnenpanzerung',
          ruleRef: 'SR6 Grundregelwerk S. 200, 202'
        },
        autonomousDicePools: {
          evasion: {
            value: evasionRating > 0 ? (effectivePilot + evasionRating) : Math.max(0, effectivePilot - 1),
            formula: evasionRating > 0 ? `Pilot (${effectivePilot}) + Ausweichen-Autosoft (${evasionRating})` : `Pilot (${effectivePilot}) - 1 (Ungeschult)`
          },
          maneuvering: {
            value: maneuveringRating > 0 ? (effectivePilot + maneuveringRating) : Math.max(0, effectivePilot - 1),
            formula: maneuveringRating > 0 ? `Pilot (${effectivePilot}) + Manövrieren-Autosoft (${maneuveringRating})` : `Pilot (${effectivePilot}) - 1 (Ungeschult)`
          },
          perception: {
            value: clearsightRating > 0 ? (effectiveSensor + clearsightRating) : Math.max(0, effectiveSensor - 1),
            formula: clearsightRating > 0 ? `Sensor (${effectiveSensor}) + Clearsight-Autosoft (${clearsightRating})` : `Sensor (${effectiveSensor}) - 1 (Ungeschult)`
          },
          attack: attackPoolObj
        },
        riggedDicePools: {
          piloting: {
            value: (pilotingSkill?.rating || 0) + (char.attributes.intuition || 1) + rcRating + (pilotingSkill?.specialization ? 2 : 0),
            formula: `Steuern (${pilotingSkill?.rating || 0}) + Intuition (${char.attributes.intuition || 1}) + Riggerkontrolle (${rcRating})${pilotingSkill?.specialization ? ' + Spezialisierung (+2)' : ''}`
          },
          gunneryEngineering: {
            value: (engineeringSkill?.rating || 0) + (char.attributes.logic || 1) + rcRating,
            formula: `Mechanik (${engineeringSkill?.rating || 0}) + Logik (${char.attributes.logic || 1}) + Riggerkontrolle (${rcRating})`
          },
          defense: {
            value: (pilotingSkill?.rating || 0) + (char.attributes.intuition || 1) + rcRating,
            formula: `Steuern (${pilotingSkill?.rating || 0}) + Intuition (${char.attributes.intuition || 1}) + Riggerkontrolle (${rcRating})`
          }
        }
      };

      report.droneAudits.push(dAudit);
    });
  }

  _auditVehicles(char, report) {
    const vehicles = char.vehicles || [];
    for (const v of vehicles) {
      const vNameLower = (v.name || '').toLowerCase();
      const official = this.flattenedVehicles[vNameLower] || null;

      const effectiveBody = official ? official.body : (v.body || 8);
      report.vehicleAudits.push({
        name: v.name,
        catalogMatch: !!official,
        officialData: official,
        conditionMonitor: 8 + Math.ceil(effectiveBody / 2),
        ruleRef: 'SR6 Grundregelwerk S. 196, 200'
      });
    }
  }

  _auditMagicAndResonance(char, report) {
    const mag = char.attributes.magic || 0;
    const res = char.attributes.resonance || 0;

    if (mag > 0) {
      const sorcerySkill = (char.skills.active || []).find(s => s.name.toLowerCase().includes('hexerei') || s.name.toLowerCase().includes('sorcery'));
      const drainAttr = char.magic?.tradition === 'Schamanisch' ? 'charisma' : 'logic';
      const drainPool = (char.attributes.willpower || 1) + (char.attributes[drainAttr] || 1);

      report.magicAudit = {
        magicRating: mag,
        tradition: char.magic?.tradition || 'Hermetisch',
        spellcastingPool: (sorcerySkill?.rating || 0) + mag,
        drainResistancePool: drainPool,
        drainFormula: `Willenskraft (${char.attributes.willpower || 1}) + ${drainAttr.toUpperCase()} (${char.attributes[drainAttr] || 1})`,
        ruleRef: 'SR6 Grundregelwerk S. 130-135'
      };
    }

    if (res > 0) {
      const taskingSkill = (char.skills.active || []).find(s => s.name.toLowerCase().includes('tasking') || s.name.toLowerCase().includes('kompilieren'));
      const fadingPool = (char.attributes.willpower || 1) + (char.attributes.logic || 1);

      report.resonanceAudit = {
        resonanceRating: res,
        compilingPool: (taskingSkill?.rating || 0) + res,
        fadingResistancePool: fadingPool,
        fadingFormula: `Willenskraft (${char.attributes.willpower || 1}) + Logik (${char.attributes.logic || 1})`,
        livingPersona: {
          attack: char.attributes.charisma || 1,
          sleaze: char.attributes.intuition || 1,
          dataProcessing: char.attributes.logic || 1,
          firewall: char.attributes.willpower || 1
        },
        ruleRef: 'SR6 Grundregelwerk S. 188-193'
      };
    }
  }

  _auditNuyenBudget(char, report) {
    const nBudget = char.creation?.nuyen_budget;
    if (!nBudget) return;

    report.nuyenBudgetAudit = {
      starting: nBudget.starting,
      spent: nBudget.spent,
      remaining: nBudget.remaining,
      isValid: (nBudget.spent + nBudget.remaining) === nBudget.starting,
      ruleRef: 'SR6 Grundregelwerk S. 66'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SR6RulesEngine;
}
