const fs = require('fs');

// Read the file
const filePath = 'src/components/game/BattleArena.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the hardcoded Judgment of Fate implementation
const oldPattern = /( *)\/\/ Judgment of Fate - Deal 60-90 damage, double if enemy below 40% health\n( *)if \(ability\.name\.toLowerCase\(\) === 'judgment of fate'\) \{\n( *)const baseDamage = Math\.floor\(Math\.random\(\) \* \(90 - 60 \+ 1\)\) \+ 60; \/\/ 60-90 damage\n( *)const enemyHealthPercent = \(opponent\.health \/ opponent\.maxHealth\) \* 100;\n( *)\n( *)let finalDamage = baseDamage;\n( *)if \(enemyHealthPercent < 40\) \{\n( *)finalDamage = baseDamage \* 2;\n( *)addLogMessage\(`\$\{opponent\.name\} is below 40% health - Judgment of Fate deals double damage!`\);\n( *)\}\n( *)\n( *)abilityDealDamage\(finalDamage, `\$\{player\.name\} casts Judgment of Fate and deals \$\{finalDamage\} damage!`\);\n( *)return opponent\.health > 0;\n( *)\}/;

const newImplementation = `    // Judgment of Fate - Parse damage and health threshold from description
    if (ability.name.toLowerCase() === 'judgment of fate') {
      // Parse damage range from description (e.g., "Deal 60-90 damage")
      const damageMatch = description.match(/deal (\\d+)-(\\d+) damage/);
      // Parse health threshold (e.g., "below 40% health")
      const thresholdMatch = description.match(/below (\\d+)% health/);
      
      if (damageMatch && thresholdMatch) {
        const minDamage = parseInt(damageMatch[1]);
        const maxDamage = parseInt(damageMatch[2]);
        const threshold = parseInt(thresholdMatch[1]);
        
        const baseDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
        const enemyHealthPercent = (opponent.health / opponent.maxHealth) * 100;
        
        let finalDamage = baseDamage;
        if (enemyHealthPercent < threshold) {
          finalDamage = baseDamage * 2;
          addLogMessage(\`\${opponent.name} is below \${threshold}% health - Judgment of Fate deals double damage!\`);
        }
        
        abilityDealDamage(finalDamage, \`\${player.name} casts Judgment of Fate and deals \${finalDamage} damage!\`);
        return opponent.health > 0;
      }
    }`;

// Replace the implementation
content = content.replace(oldPattern, newImplementation);

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Updated Judgment of Fate implementation to parse from description');
