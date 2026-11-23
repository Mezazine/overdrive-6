// @ts-nocheck
/**
 * test_engine.js - Full test suite for SR6RulesEngine auditing data/tim_struck_v10.json
 */

const fs = require('fs');
const path = require('path');
const SR6RulesEngine = require('../src/engine/SR6RulesEngine');

const engine = new SR6RulesEngine();

console.log('=== AUDITING tim_struck_v10.json (10 distinct drone entities) ===');
const charData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tim_struck_v10.json'), 'utf8'));
const report = engine.auditCharacter(charData);

console.log('Character:', report.characterName, `(${report.metatype} - ${report.archetype})`);
console.log('Valid:', report.validation.isValid);
console.log('Errors:', report.validation.errors);
console.log('Warnings:', report.validation.warnings);
console.log('Essence:', report.derivedStats.essence);
console.log('Physical Monitor:', report.derivedStats.physicalConditionMonitor);
console.log('Stun Monitor:', report.derivedStats.stunConditionMonitor);
console.log('Meat Combat:', report.combatStats);
console.log('RCC Streaming:', {
  model: report.rccAudit?.model,
  streamedCount: report.rccAudit?.streamedAutosoftsCount,
  limit: report.rccAudit?.streamingLimit,
  isLegal: report.rccAudit?.isWithinStreamingLimit
});

console.log(`\nDrones Audited (${report.droneAudits.length} entities):`);
report.droneAudits.forEach((d, idx) => {
  const wInfo = d.mountedWeapons.map(w => `${w.weaponName} [${w.damage}, Autosoft: ${w.autosoftMatched || 'Keine'}]`).join(', ') || 'Keine';
  console.log(`- #${idx + 1} [${d.callsign || d.name}] ${d.name} (${d.droneSize}) -> Waffen: ${wInfo} | Autonomer Angriff: ${d.derivedCombatStats.autonomousDicePools.attack.value} W | Monitor: ${d.derivedCombatStats.conditionMonitor.value} Kästchen`);
});

if (!report.validation.isValid) {
  console.error('\nValidation FAILED with errors:', report.validation.errors);
  process.exit(1);
} else {
  console.log('\n>>> ALL ENGINE AUDIT TESTS PASSED SUCCESSFULLY (0 ERRORS)! <<<');
}
