import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Sword, Shield, Heart, Zap, Sparkles, 
  User, ShieldX, Skull, Star, Target, Hourglass, 
  ChevronRight, ArrowRight, X
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PLAYER_CLASSES, getIconByName } from './class-data';
import { motion } from 'framer-motion';

interface ClassSelectionProps {
  player1Class: keyof typeof PLAYER_CLASSES;
  setPlayer1Class: React.Dispatch<React.SetStateAction<keyof typeof PLAYER_CLASSES>>;
  player2Class: keyof typeof PLAYER_CLASSES;
  setPlayer2Class: React.Dispatch<React.SetStateAction<keyof typeof PLAYER_CLASSES>>;
  player1Name: string;
  setPlayer1Name: React.Dispatch<React.SetStateAction<string>>;
  player2Name: string;
  setPlayer2Name: React.Dispatch<React.SetStateAction<string>>;
  isPlayer2Computer: boolean;
  setIsPlayer2Computer: React.Dispatch<React.SetStateAction<boolean>>;
  startGame: () => void;
}

// Define class categories
export const CLASS_CATEGORIES = {
  "⚔️ Melee & Warrior": [
    "Knight", "Barbarian", "Paladin", "Sellsword", "Warlord", "Gladiator", "Blademaster", "Spearman", "Duelist",
    "Axemaster", "Hammerlord", "Swordsman", "Guardian", "Sentinel", "Ironclad", "Noble", "Champion", "KnightCommander"
  ],
  "🏹 Ranged & Hunter": [
    "Archer", "Crossbowman", "Falconer", "Marksman", "Ranger", "Sniper", "Beastmaster", "Sharpshooter", "Trapper", "Scout"
  ],
  "🧙 Magic & Elemental": [
    "Mage", "Necromancer", "Druid", "Sorcerer", "Cleric", "Warlock", "Pyromancer", "Cryomancer", "Stormcaller", "Earthshaker",
    "Firebender", "Icebender", "Earthbender"
  ],
  "🛡 Hybrid & Battle": [
    "Battlemage", "Templar", "Alchemist", "Assassin", "Berserker", "SoulfireWarlock"
  ],
  "🗡️ Assassin & Rogue": [
    "Shadowblade", "Thief", "Ninja", "Rogue"
  ],


};

// For animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const ClassSelection = ({
  player1Class,
  setPlayer1Class,
  player2Class,
  setPlayer2Class,
  player1Name,
  setPlayer1Name,
  player2Name,
  setPlayer2Name,
  isPlayer2Computer,
  setIsPlayer2Computer,
  startGame
}: ClassSelectionProps) => {
  const [selectedTab, setSelectedTab] = useState("player1");
  const [selectedCategory, setSelectedCategory] = useState<string>("⚔️ Melee & Warrior");
  const [showVersus, setShowVersus] = useState<boolean>(false);
  
  // Handle versus screen display
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVersus) {
      console.log('Versus screen shown, will call startGame in 3 seconds');
      timer = setTimeout(() => {
        console.log('Calling startGame from versus screen');
        startGame();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showVersus, startGame]);
  
  // Class selection handler
  const handleClassSelect = (playerNumber: 1 | 2, className: keyof typeof PLAYER_CLASSES) => {
    if (playerNumber === 1) {
      setPlayer1Class(className);
    } else {
      setPlayer2Class(className);
    }
  };

  // Helper function to render an icon component by name with specific class
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = getIconByName(iconName);
    return <IconComponent className={className} />;
  };

  // Render ability badge with tooltip
  const renderAbilityBadge = (ability: {
    name: string;
    description: string;
    cooldown: number;
    manaCost?: number;
    iconName: string;
  }, index: number) => {
    return (
      <div key={index} className="group relative">
        <div className={`flex items-center p-1.5 rounded-md text-xs ${
          ability.manaCost ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                            'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          <span className="mr-1.5">
            {renderIcon(ability.iconName, "h-3.5 w-3.5")}
          </span>
          <span className="font-medium">{ability.name}</span>
          {ability.manaCost !== undefined && (
            <span className="ml-1.5 text-blue-500 text-[10px] font-bold">{ability.manaCost}</span>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-2 w-48 
                      bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 pointer-events-none">
          <p className="font-semibold mb-1">{ability.name}</p>
          <p className="text-[10px]">{ability.description}</p>
          <div className="flex justify-between mt-1">
            <p className="text-[10px] text-amber-300">CD: {ability.cooldown} turns</p>
            {ability.manaCost && <p className="text-[10px] text-blue-300">{ability.manaCost} mana</p>}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-black/90"></div>
        </div>
      </div>
    );
  };

  // Render class card
  const renderClassCard = (
    className: keyof typeof PLAYER_CLASSES, 
    playerNumber: 1 | 2,
    isSelected: boolean
  ) => {
    const classData = PLAYER_CLASSES[className];
    if (!classData) return null;
    
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        key={className}
      >
        <Card 
          className={`relative cursor-pointer transition-all overflow-hidden ${
            isSelected 
              ? "ring-4 ring-amber-500 bg-amber-50/90" 
              : "hover:ring-2 hover:ring-amber-300 hover:bg-amber-50/50"
          }`}
          onClick={() => handleClassSelect(playerNumber, className)}
        >
          {isSelected && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white p-1 z-10">
              <Star className="h-3 w-3" />
            </div>
          )}
          <CardHeader className="p-3 pb-1 bg-gradient-to-r from-amber-50 to-amber-100/80">
            <CardTitle className="text-base flex items-center">
              {renderIcon(classData.abilities[0]?.iconName || "sword", "h-4 w-4 mr-1.5 text-amber-700")}
              {className}
            </CardTitle>
            <CardDescription className="text-xs line-clamp-2 h-8">{classData.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-2">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm font-medium">{classData.health}</span>
              </div>
              <div className="flex items-center">
                <Sword className="h-4 w-4 text-gray-700 mr-1" />
                <span className="text-sm font-medium">{classData.attackMin}-{classData.attackMax}</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium">100</span>
              </div>
            </div>
            
            <div className="mt-2 space-y-1.5">
              <h4 className="text-xs font-semibold text-amber-800 flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-600" />
                Abilities:
              </h4>
              <div className="flex flex-wrap gap-1">
                {classData.abilities.map((ability, index) => (
                  renderAbilityBadge(ability, index)
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Handle battle start with versus screen
  const handleBattleStart = () => {
    setShowVersus(true);
  };

  // Render versus screen
  if (showVersus) {
    const player1Data = PLAYER_CLASSES[player1Class];
    const player2Data = PLAYER_CLASSES[player2Class];
    
    return (
      <div className="max-w-4xl w-full bg-black/80 rounded-lg p-6 animate-in fade-in zoom-in duration-500">
        <div className="relative h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 flex">
            {/* Player 1 */}
            <motion.div 
              initial={{ x: -300, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-1/2 h-full flex flex-col items-center justify-center p-4"
            >
              <div className="text-5xl font-bold text-amber-100 mb-4">{player1Name}</div>
              <div className="text-3xl text-amber-300 mb-6">{player1Class}</div>
              <div className="flex flex-col items-center">
                <div className="mb-3 text-amber-200 flex items-center">
                  <Heart className="h-6 w-6 text-red-500 mr-2" />
                  <span className="text-2xl">{player1Data.health} HP</span>
                </div>
                <div className="mb-3 text-amber-200 flex items-center">
                  <Sword className="h-6 w-6 text-gray-300 mr-2" />
                  <span className="text-xl">{player1Data.attackMin}-{player1Data.attackMax} DMG</span>
                </div>
              </div>
            </motion.div>
            
            {/* VS */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="bg-red-600 text-white text-5xl font-black rounded-full h-24 w-24 flex items-center justify-center shadow-lg shadow-red-900/50">
                VS
              </div>
            </motion.div>
            
            {/* Player 2 */}
            <motion.div 
              initial={{ x: 300, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-1/2 h-full flex flex-col items-center justify-center p-4"
            >
              <div className="text-5xl font-bold text-amber-100 mb-4">{isPlayer2Computer ? `${player2Class} AI` : player2Name}</div>
              <div className="text-3xl text-amber-300 mb-6">{player2Class}</div>
              <div className="flex flex-col items-center">
                <div className="mb-3 text-amber-200 flex items-center">
                  <Heart className="h-6 w-6 text-red-500 mr-2" />
                  <span className="text-2xl">{player2Data.health} HP</span>
                </div>
                <div className="mb-3 text-amber-200 flex items-center">
                  <Sword className="h-6 w-6 text-gray-300 mr-2" />
                  <span className="text-xl">{player2Data.attackMin}-{player2Data.attackMax} DMG</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8"
          >
            <div className="text-amber-300 text-xl font-bold animate-pulse">
              Prepare for battle...
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full space-y-4 bg-black/80 rounded-lg p-6 overflow-hidden max-h-[85vh] backdrop-blur-sm border border-amber-800/30">
      <h2 className="text-3xl font-bold text-center text-amber-100 mb-4">Choose Your Champion</h2>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-amber-900/50">
          <TabsTrigger value="player1" className="data-[state=active]:bg-amber-600">
            <User className="h-4 w-4 mr-2" />
            {player1Name || "Player 1"}
          </TabsTrigger>
          <TabsTrigger value="player2" className="data-[state=active]:bg-amber-600">
            <User className="h-4 w-4 mr-2" />
            {isPlayer2Computer ? "Computer" : player2Name || "Player 2"}
          </TabsTrigger>
        </TabsList>
        
        {/* Player 1 Tab Content */}
        <TabsContent value="player1" className="space-y-6 mt-4">
          <div>
            <Label htmlFor="player1-name" className="text-amber-200">Your Name</Label>
            <Input 
              id="player1-name" 
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Enter your name" 
              className="max-w-md bg-amber-50/10 border-amber-500/30 text-amber-100 placeholder:text-amber-400/50"
            />
          </div>
          
          <div className="flex h-[500px] overflow-hidden bg-black/40 rounded-lg border border-amber-800/30">
            {/* Sidebar Categories */}
            <div className="w-56 border-r border-amber-800/30 pr-2">
              <h3 className="text-amber-300 px-4 py-2 font-bold text-sm uppercase">Class Categories</h3>
              <ScrollArea className="h-[460px] px-2">
                {Object.keys(CLASS_CATEGORIES).map((category) => (
                  <div key={category} className="mb-2">
                    <button
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors flex items-center ${
                        selectedCategory === category 
                          ? "bg-amber-700/80 text-amber-100 font-medium" 
                          : "hover:bg-amber-800/40 text-amber-200/70"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className="mr-2">{category.split(" ")[0]}</span>
                      <span>{category.split(" ").slice(1).join(" ")}</span>
                      <span className="ml-auto bg-amber-900/70 text-amber-100 text-xs px-2 py-0.5 rounded-full">
                        {CLASS_CATEGORIES[category as keyof typeof CLASS_CATEGORIES].length}
                      </span>
                    </button>
                  </div>
                ))}
              </ScrollArea>
            </div>
            
            {/* Class Cards */}
            <div className="flex-1 overflow-hidden pl-4 pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-amber-200 font-bold">
                  {selectedCategory.split(" ").slice(1).join(" ")} Classes
                </h3>
                <span className="text-amber-300 text-sm">
                  Selected: <span className="font-bold text-amber-100">{player1Class}</span>
                </span>
              </div>
              <ScrollArea className="h-[460px] pr-4">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4"
                >
                  {CLASS_CATEGORIES[selectedCategory as keyof typeof CLASS_CATEGORIES]
                    .filter(className => PLAYER_CLASSES[className as keyof typeof PLAYER_CLASSES])
                    .map(className => renderClassCard(
                      className as keyof typeof PLAYER_CLASSES,
                      1,
                      className === player1Class
                    )
                  )}
                </motion.div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
        
        {/* Player 2 Tab Content */}
        <TabsContent value="player2" className="space-y-6 mt-4">
          <div className="flex flex-wrap gap-6 items-start">
            <div className="space-y-2">
              <Label htmlFor="computer-opponent" className="text-amber-200 block">Computer Opponent</Label>
              <div className="flex items-center space-x-3 bg-amber-900/20 p-3 rounded-md">
                <Switch
                  id="computer-opponent"
                  checked={isPlayer2Computer}
                  onCheckedChange={(checked) => {
                    setIsPlayer2Computer(checked);
                    if (checked && player2Name === "Player 2") {
                      setPlayer2Name("Computer");
                    } else if (!checked && player2Name === "Computer") {
                      setPlayer2Name("Player 2");
                    }
                  }}
                />
                <Label htmlFor="computer-opponent" className="text-amber-100">
                  {isPlayer2Computer ? "AI Opponent" : "Human Opponent"}
                </Label>
              </div>
            </div>
            
            {!isPlayer2Computer && (
              <div className="space-y-2 flex-grow max-w-md">
                <Label htmlFor="player2-name" className="text-amber-200">Player 2 Name</Label>
                <Input 
                  id="player2-name" 
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter player 2 name" 
                  className="bg-amber-50/10 border-amber-500/30 text-amber-100 placeholder:text-amber-400/50"
                />
              </div>
            )}
          </div>
          
          <div className="flex h-[500px] overflow-hidden bg-black/40 rounded-lg border border-amber-800/30">
            {/* Sidebar Categories */}
            <div className="w-56 border-r border-amber-800/30 pr-2">
              <h3 className="text-amber-300 px-4 py-2 font-bold text-sm uppercase">Class Categories</h3>
              <ScrollArea className="h-[460px] px-2">
                {Object.keys(CLASS_CATEGORIES).map((category) => (
                  <div key={category} className="mb-2">
                    <button
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors flex items-center ${
                        selectedCategory === category 
                          ? "bg-amber-700/80 text-amber-100 font-medium" 
                          : "hover:bg-amber-800/40 text-amber-200/70"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className="mr-2">{category.split(" ")[0]}</span>
                      <span>{category.split(" ").slice(1).join(" ")}</span>
                      <span className="ml-auto bg-amber-900/70 text-amber-100 text-xs px-2 py-0.5 rounded-full">
                        {CLASS_CATEGORIES[category as keyof typeof CLASS_CATEGORIES].length}
                      </span>
                    </button>
                  </div>
                ))}
              </ScrollArea>
            </div>
            
            {/* Class Cards */}
            <div className="flex-1 overflow-hidden pl-4 pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-amber-200 font-bold">
                  {selectedCategory.split(" ").slice(1).join(" ")} Classes
                </h3>
                <span className="text-amber-300 text-sm">
                  Selected: <span className="font-bold text-amber-100">{player2Class}</span>
                </span>
              </div>
              <ScrollArea className="h-[460px] pr-4">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4"
                >
                  {CLASS_CATEGORIES[selectedCategory as keyof typeof CLASS_CATEGORIES]
                    .filter(className => PLAYER_CLASSES[className as keyof typeof PLAYER_CLASSES])
                    .map(className => renderClassCard(
                      className as keyof typeof PLAYER_CLASSES,
                      2,
                      className === player2Class
                    )
                  )}
                </motion.div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Battle preview */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 bg-gradient-to-r from-amber-900/30 to-amber-700/20 p-4 rounded-lg">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="flex flex-col items-center mr-6">
            <div className="text-amber-100 font-bold">{player1Name}</div>
            <div className="text-amber-300">{player1Class}</div>
          </div>
          <div className="text-amber-600 font-bold text-xl mx-4">VS</div>
          <div className="flex flex-col items-center ml-6">
            <div className="text-amber-100 font-bold">{isPlayer2Computer ? `${player2Class} AI` : player2Name}</div>
            <div className="text-amber-300">{player2Class}</div>
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={handleBattleStart}
          className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 
                   text-white font-bold shadow-lg shadow-amber-900/50 flex items-center px-6"
        >
          Start Battle <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};