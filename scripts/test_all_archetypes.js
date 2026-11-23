// @ts-nocheck
/**
 * test_all_archetypes.js - Tests SR6RulesEngine against multiple character archetypes
 */

const SR6RulesEngine = require('../src/engine/SR6RulesEngine');
const engine = new SR6RulesEngine();

// 1. Street Samurai (Cyberware heavy)
const streetSam = {
  character: {
    name: "Razor",
    metatype: "Mensch",
    archetype: "Street Samurai",
    attributes: {
      body: 5, agility: 6, reaction: 5, strength: 5,
      willpower: 3, logic: 2, intuition: 4, charisma: 2,
      edge: 2
    },
    skills: {
      firearms: 6,
      athletics: 4,
      close_combat: 5
    },
    bodytech: [
      { name: "Reflexbooster 2", grade: "Standard", base_essence: 2.0, base_cost: 40000 },
      { name: "Dermalpanzerung (Stufe 1-6)", rating: 2, grade: "Alphaware", base_essence: 1.0, base_cost: 6000 }
    ],
    armor: [{ name: "Panzerjacke", rating: 4 }]
  }
};

// 2. Hermetic Magician
const hermeticMage = {
  identity: { name: "Astra", metatype: "Elf", archetype: "Hermetischer Magier" },
  creation: { method: "priority" },
  attributes: {
    body: 2, agility: 3, reaction: 3, strength: 2,
    willpower: 5, logic: 6, intuition: 4, charisma: 4,
    edge: 2, magic: 6
  },
  skills: {
    active: [
      { name: "Hexerei", rating: 6, specialization: { name: "Kampfzauber", bonus: 2 } },
      { name: "Beschwörung", rating: 5 }
    ]
  },
  magic: { tradition: "Hermetisch" },
  spells: [
    { name: "Feuerball", category: "Kampf" },
    { name: "Manablitz", category: "Kampf" },
    { name: "Heilung", category: "Heilung" }
  ]
};

// 3. Technomancer
const techno = {
  identity: { name: "Byte", metatype: "Mensch", archetype: "Technomancer" },
  creation: { method: "priority" },
  attributes: {
    body: 3, agility: 2, reaction: 3, strength: 2,
    willpower: 5, logic: 5, intuition: 5, charisma: 3,
    edge: 3, resonance: 6
  },
  skills: {
    active: [
      { name: "Tasking", rating: 6 },
      { name: "Cracking", rating: 5 },
      { name: "Elektronik", rating: 4 }
    ]
  }
};

console.log('--- Testing Street Samurai ---');
const samAudit = engine.auditCharacter(streetSam);
console.log('Samurai Essence Loss:', samAudit.bodytechAudit.totalEssenceLoss, 'Remaining:', samAudit.bodytechAudit.remainingEssence);
console.log('Samurai Meat Defense:', samAudit.combatStats.meatDefense);

console.log('\n--- Testing Hermetic Mage ---');
const mageAudit = engine.auditCharacter(hermeticMage);
console.log('Mage Drain Pool:', mageAudit.magicAudit.drainResistancePool, 'Formula:', mageAudit.magicAudit.drainFormula);
console.log('Mage Spellcasting:', mageAudit.magicAudit.spellcastingPool);

console.log('\n--- Testing Technomancer ---');
const technoAudit = engine.auditCharacter(techno);
console.log('Techno Fading Pool:', technoAudit.resonanceAudit.fadingResistancePool, 'Formula:', technoAudit.resonanceAudit.fadingFormula);
console.log('Techno Living Persona:', technoAudit.resonanceAudit.livingPersona);

console.log('\n>>> ALL ARCHETYPES SUCCESSFULLY AUDITED! <<<');

