import re

# Read the file
with open('src/components/game/BattleArena.tsx', 'r') as f:
    content = f.read()

# Define the new implementation
new_implementation = '''    if (ability.name.toLowerCase() === 'judgment of fate') {
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
          addLogMessage(`${opponent.name} is below ${threshold}% health - Judgment of Fate deals double damage!`);
        }
        
        abilityDealDamage(finalDamage, `${player.name} casts Judgment of Fate and deals ${finalDamage} damage!`);
        return opponent.health > 0;
      }
    }'''

# Replace the hardcoded implementation
pattern = r'    if \(ability\.name\.toLowerCase\(\) === \'judgment of fate\'\) \{\s*const baseDamage = Math\.floor\(Math\.random\(\) \* \(90 - 60 \+ 1\)\) \+ 60; \/\/ 60-90 damage\s*const enemyHealthPercent = \(opponent\.health \/ opponent\.maxHealth\) \* 100;\s*let finalDamage = baseDamage;\s*if \(enemyHealthPercent < 40\) \{\s*finalDamage = baseDamage \* 2;\s*addLogMessage\(`[^`]*`\);\s*\}\s*abilityDealDamage\(finalDamage, `[^`]*`\);\s*return opponent\.health > 0;\s*\}'

content = re.sub(pattern, new_implementation, content, flags=re.MULTILINE | re.DOTALL)

# Write back to file
with open('src/components/game/BattleArena.tsx', 'w') as f:
    f.write(content)

print('Updated Judgment of Fate implementation to parse from description')
