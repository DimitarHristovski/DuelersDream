import re

# Read the file
with open('src/components/game/class-data.ts', 'r') as f:
    content = f.read()

# Define abilities for each class
abilities = {
    'Elemental Warden': [
        '{ name: "Fireball", iconName: "Flame", description: "Deal 20-30 fire damage", cooldown: 3, manaCost: 25 },',
        '{ name: "Ice Shard", iconName: "Snowflake", description: "Deal 15-25 ice damage and slow enemy for 2 turns", cooldown: 4, manaCost: 30 },',
        '{ name: "Lightning Bolt", iconName: "Zap", description: "Deal 25-35 lightning damage", cooldown: 3, manaCost: 28 },',
        '{ name: "Elemental Shield", iconName: "Shield", description: "Gain a shield that blocks 50 damage", cooldown: 5, manaCost: 35 },',
        '{ name: "Nature\'s Wrath", iconName: "Sparkles", description: "Deal 30-45 damage and heal 20 health", cooldown: 6, manaCost: 40 }'
    ],
    'Spirit Tracker': [
        '{ name: "Spirit Arrow", iconName: "Target", description: "Deal 18-28 spirit damage", cooldown: 3, manaCost: 25 },',
        '{ name: "Ghost Shot", iconName: "Moon", description: "Deal 25-35 damage and become untargetable for 1 turn", cooldown: 5, manaCost: 35 },',
        '{ name: "Soul Drain", iconName: "Heart", description: "Deal 20 damage and heal 15 health", cooldown: 4, manaCost: 30 },',
        '{ name: "Spirit Ward", iconName: "Shield", description: "Gain a shield that blocks 60 damage", cooldown: 6, manaCost: 40 },',
        '{ name: "Ethereal Strike", iconName: "Sword", description: "Deal 30-45 damage and ignore shields", cooldown: 7, manaCost: 45 }'
    ]
}

# Replace empty abilities arrays
for class_name, class_abilities in abilities.items():
    pattern = f'"{class_name}": {{\\s*health: 1000,\\s*attackMin: [0-9]+,\\s*attackMax: [0-9]+,\\s*description: "[^"]*",\\s*abilities: \\[\\s*\\]'
    replacement = f'"{class_name}": {{\\n    health: 1000,\\n    attackMin: 10,\\n    attackMax: 18,\\n    description: "Tier 2 ranged specialist",\n    abilities: [\n      {chr(10).join("      " + ability for ability in class_abilities)}\n    ]'
    
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

# Write the file back
with open('src/components/game/class-data.ts', 'w') as f:
    f.write(content)

print("Abilities added successfully!")
