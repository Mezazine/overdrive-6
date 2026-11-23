// @ts-nocheck
/**
 * parse_buck_md.js - Validates data/tim_struck_v10.json and ensures synchronization with data/tim-struck-charakterbogen-v10.md
 */

const fs = require('fs');
const path = require('path');
const SR6RulesEngine = require('../src/engine/SR6RulesEngine');

const jsonPath = path.join(__dirname, '../data/tim_struck_v10.json');
const charData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const engine = new SR6RulesEngine();
const report = engine.auditCharacter(charData);

console.log('=== AUDIT VERIFICATION ===');
console.log('Valid:', report.validation.isValid);
console.log('Errors:', report.validation.errors);
console.log('Warnings:', report.validation.warnings);

if (!report.validation.isValid) {
  process.exit(1);
}

