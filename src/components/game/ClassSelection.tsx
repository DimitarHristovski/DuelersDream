import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  "Tier 1": {
    "Melee": ["Warrior", "Slayer", "Rogue"],
    "Ranged": ["Archer", "Ranger"],
    "Caster": ["Mage", "Oracle", "Healer"]
  },
  "Tier 2": {
    "Melee": [
      "Warlord", "Berserker", "Paladin",
      "Death Knight", "Dragon Slayer","Knight",
    ],
    "Ranged": [
       "Shaman",  "Druid", "Elemental Warden","Priest","Crossbowman", "Beastguard"
      
    ],
    "Caster": [
      "Battlemage", "Enchanter",  "Warlock",
       "Lich","Wizard","Necromancer"
    ]
  },
  "Tier 3":{
    "Melee": [
     "Witcher","TaurenChieftain"
    ],
   
    "Caster": [
    "Invoker","Archmage"
    ]},
    "Tier 4":{
      "Melee": [
       "Godslayer",
      ],
     
      "Caster": [
      "Archon",
      ]
  }
} as const;

type CategoryKey = keyof typeof CLASS_CATEGORIES;
type SubcategoryKey = keyof typeof CLASS_CATEGORIES[CategoryKey];

// Animation variants
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Tier 1");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("Melee");
  const [showVersus, setShowVersus] = useState<boolean>(false);
  const [hoveredAbility, setHoveredAbility] = useState<string | null>(null);
  
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

  // Render ability badge with fixed tooltip
  const renderAbilityBadge = (ability: {
    name: string;
    description: string;
    cooldown: number;
    manaCost?: number;
    iconName: string;
  }, index: number) => {
    const uniqueId = `ability-${index}-${ability.name.replace(/\s+/g, "-").toLowerCase()}`;
    const isHovered = hoveredAbility === uniqueId;
    
    return (
      <div 
        key={uniqueId} 
        className="relative"
        onMouseEnter={() => setHoveredAbility(uniqueId)}
        onMouseLeave={() => setHoveredAbility(null)}
      >
        <div className={`flex items-center p-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 ${
          ability.manaCost ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                            'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          <span className="mr-1.5">
            {renderIcon(ability.iconName, "h-3.5 w-3.5")}
          </span>
          <span className="truncate flex-1">{ability.name}</span>
          <div className="flex items-center gap-1 ml-1.5">
            <Badge variant="outline" className="text-[10px] px-1 py-0.5">
              {ability.cooldown}t
            </Badge>
            {ability.manaCost !== undefined && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0.5">
                {ability.manaCost} MP
              </Badge>
            )}
          </div>
        </div>
        
        {/* Fixed Tooltip - Only shows when this specific ability is hovered */}
        {isHovered && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 w-64 
                        bg-black/90 text-white text-xs rounded-lg shadow-xl transform -translate-y-1">
            <div className="flex items-center mb-2">
              {renderIcon(ability.iconName, "h-4 w-4 mr-2")}
              <p className="font-semibold">{ability.name}</p>
            </div>
            <p className="text-gray-300 mb-2">{ability.description}</p>
            <div className="flex items-center justify-between text-gray-400">
              <span>Cooldown: {ability.cooldown} turns</span>
              {ability.manaCost !== undefined && (
                <span>Cost: {ability.manaCost} MP</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render class card with improved responsive design
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
        className="w-full"
      >
        <Card 
          className={`relative cursor-pointer transition-all duration-300 overflow-hidden group ${
            isSelected 
              ? "ring-4 ring-amber-500 bg-amber-50/90 shadow-lg scale-105" 
              : "hover:ring-2 hover:ring-amber-300 hover:bg-amber-50/50 hover:shadow-md hover:scale-102"
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
              <span className="truncate">{className}</span>
            </CardTitle>
            <CardDescription className="text-xs line-clamp-2 h-8">{classData.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="p-3 pt-2">
            {/* Stats Row - Responsive Grid */}
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm font-medium">{classData.health}</span>
              </div>
              <div className="flex items-center">
                <Sword className="h-4 w-4 text-amber-200 mr-1" />
                <span className="text-sm font-medium">{classData.attackMin}-{classData.attackMax}</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium">{classData.mana}</span>
              </div>
            </div>
            
            {/* Abilities Section */}
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          >
            <div className="text-2xl text-amber-300 font-semibold mb-2">Battle Starting...</div>
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full space-y-6 bg-gradient-to-br from-amber-900/20 to-black/40 rounded-xl p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-amber-100">Choose Your Classes</h1>
        <p className="text-lg text-amber-200">Select the perfect class for each player and prepare for battle!</p>
      </motion.div>

      {/* Player Selection Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-amber-800/30 rounded-lg p-1">
          <TabsTrigger value="player1" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Player 1
          </TabsTrigger>
          <TabsTrigger value="player2" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Player 2
          </TabsTrigger>
        </TabsList>

        {/* Player 1 Tab */}
        <TabsContent value="player1" className="space-y-6">
          <div className="bg-black/40 rounded-lg p-6 shadow-sm border border-amber-800/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="player1-name" className="text-sm font-medium text-amber-200">Player 1 Name</Label>
                <Input
                  id="player1-name"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter player 1 name"
                  className="mt-1"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{player1Class}</div>
                <div className="text-sm text-amber-300">Selected Class</div>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {Object.keys(CLASS_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcategory(Object.keys(CLASS_CATEGORIES[category as CategoryKey])[0]);
                  }}
                  className="flex-1 min-w-0"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {Object.keys(CLASS_CATEGORIES[selectedCategory as CategoryKey]).map((subcategory) => (
                <Button
                  key={subcategory}
                  variant={selectedSubcategory === subcategory ? "default" : "outline"}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className="flex-1 min-w-0"
                >
                  {subcategory}
                </Button>
              ))}
            </div>
          </div>

          {/* Class Grid - Enhanced Responsive Design */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
          >
            {CLASS_CATEGORIES[selectedCategory as CategoryKey][selectedSubcategory as SubcategoryKey]?.map((className) => 
              renderClassCard(className as keyof typeof PLAYER_CLASSES, 1, className === player1Class)
            )}
          </motion.div>
        </TabsContent>

        {/* Player 2 Tab */}
        <TabsContent value="player2" className="space-y-6">
          <div className="bg-black/40 rounded-lg p-6 shadow-sm border border-amber-800/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="player2-name" className="text-sm font-medium text-amber-200">Player 2 Name</Label>
                <Input
                  id="player2-name"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter player 2 name"
                  className="mt-1"
                  disabled={isPlayer2Computer}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="computer-mode"
                    checked={isPlayer2Computer}
                    onCheckedChange={setIsPlayer2Computer}
                  />
                  <Label htmlFor="computer-mode">Computer AI</Label>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{player2Class}</div>
                  <div className="text-sm text-amber-300">Selected Class</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {Object.keys(CLASS_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcategory(Object.keys(CLASS_CATEGORIES[category as CategoryKey])[0]);
                  }}
                  className="flex-1 min-w-0"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {Object.keys(CLASS_CATEGORIES[selectedCategory as CategoryKey]).map((subcategory) => (
                <Button
                  key={subcategory}
                  variant={selectedSubcategory === subcategory ? "default" : "outline"}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className="flex-1 min-w-0"
                >
                  {subcategory}
                </Button>
              ))}
            </div>
          </div>

          {/* Class Grid - Enhanced Responsive Design */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
          >
            {CLASS_CATEGORIES[selectedCategory as CategoryKey][selectedSubcategory as SubcategoryKey]?.map((className) => 
              renderClassCard(className as keyof typeof PLAYER_CLASSES, 2, className === player2Class)
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Start Battle Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center pt-6"
      >
        <Button
          onClick={handleBattleStart}
          size="lg"
          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={!player1Class || !player2Class}
        >
          <Sword className="h-5 w-5 mr-2" />
          Start Battle
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};
