// worldData.js
import { COLORS } from './constants.js';

// NPC definitions used by screens
const NPCS = {
  oldMan: {
    name: 'Elder Morrow',
    appearance: 'oldman',
    dialog: [
      'Welcome, young adventurer! Dark forces stir in the dungeon to the south.',
      'Collect three Crystals to unseal the dark chamber. Enemies guard them fiercely.',
      'The merchant to the east may have supplies. Be careful in the forest!',
      'Long ago, this land was peaceful... until the Shadow King arrived.'
    ]
  },
  guard: {
    name: 'Captain Rolf',
    appearance: 'guard',
    dialog: [
      'I guard this village. The roads east lead through dangerous forest.',
      'Orcs and goblins have been seen near the eastern hills.',
      'The witch in the swamp knows many secrets... if you dare visit her.',
      'I wish I could join you, but the village needs protection.'
    ]
  },
  merchant: {
    name: 'Zara',
    appearance: 'merchant',
    dialog: [
      'Welcome to my shop! Take whatever you need, hero.',
      'I brought these arrows all the way from the eastern kingdoms.',
      'Business has been slow since the monsters appeared...',
      'A bow can be found in the forest clearing. Very useful for ranged attack!'
    ]
  },
  fairy: {
    name: 'Lumina',
    appearance: 'fairy',
    dialog: [
      'I sense a great power within you, hero!',
      'The Crystals glow brighter when you are near. Follow their light.',
      'Press Z to swing your sword and X to shoot arrows!',
      'When your hearts are full, press A for a dagger throw!',
      'The dungeon entrance lies to the far south. Prepare well.'
    ]
  },
  villager1: {
    name: 'Farmer Gill',
    appearance: 'villager',
    dialog: [
      'My crops have been trampled by those slimes!',
      'If you could clear the field to the east, I would be grateful.',
      'Be careful near the water. Strange things lurk in the depths.'
    ]
  },
  villager2: {
    name: 'Martha',
    appearance: 'villager',
    dialog: [
      'My husband went to the graveyard and never came back...',
      'Please, if you find him, tell him dinner is getting cold.',
      'The skeletons there are restless. Something is disturbing them.'
    ]
  },
  witch: {
    name: 'Hexia',
    appearance: 'witch',
    dialog: [
      'Heh heh... a visitor! How delightful.',
      'The Crystal in the cave is guarded by a spider queen. Nasty creature.',
      'Lava flows deep underground. Watch your step or become toast!',
      'I could help you... but what fun would that be? Heh heh heh!'
    ]
  },
  ghostNPC: {
    name: 'Lost Spirit',
    appearance: 'fairy',
    dialog: [
      'I was once an adventurer like you...',
      'The boss chamber requires all three Crystals. Do not enter unprepared.',
      'My sword still lies somewhere in the ruins. You may take it.'
    ]
  },
  hermit: {
    name: 'Old Brenn',
    appearance: 'oldman',
    dialog: [
      'The trolls in the northern hills are nearly unkillable.',
      'Hit them hard and fast, then retreat. They are slow but deadly.',
      'Arrows work well against them... if you have enough.'
    ]
  },
  scoutNPC: {
    name: 'Scout Lyra',
    appearance: 'villager',
    dialog: [
      'I have been watching the orc camp to the east.',
      'Their chieftain carries a Crystal. He is massive and very strong.',
      'Beyond the orc camp lies a cursed catacomb. A giant Spider Queen nests there.',
      'Kill the Spider Queen and you will be rewarded with great vitality!',
      'Goblins are sneaky but weak. Take them out before they swarm you.',
      'The dark knights in the dungeon are the worst. They hit HARD.'
    ]
  },
  blacksmith: {
    name: 'Tormund',
    appearance: 'guard',
    dialog: [
      'I used to forge weapons before the monsters came.',
      'That sword will serve you well. Keep it sharp!',
      'The dark knights carry cursed blades. Dodge their swings!'
    ]
  }
};

export const WORLD_DATA = [
  // Row 0: Village row
  [
    // (0,0) Village West - Elder's home
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  g    g     g    x',
        'x    g       g     x',
        'x  g   g  g        x',
        'x         g      g  ',
        'x    g        g     ',
        'x  g     g         x',
        'x       g    g     x',
        'x   g          g   x',
        'x        g         x',
        'x  g        g      x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      backgroundColor: '#90C860',
      npcs: [
        { ...NPCS.oldMan, x: 5, y: 3 },
        { ...NPCS.villager2, x: 14, y: 7 }
      ]
    },
    // (1,0) Village Center - Main square
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x                  x',
        'x   ...........    x',
        'x   .         .    x',
        '    .         .     ',
        '    .    h    .     ',
        'x   .         .    x',
        'x   .         .    x',
        'x   ...........    x',
        'x         k        x',
        'x                  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,5', '9,9'],
      backgroundColor: '#90C860',
      npcs: [
        { ...NPCS.fairy, x: 15, y: 3 },
        { ...NPCS.guard, x: 2, y: 8 }
      ]
    },
    // (2,0) Village East - Merchant area
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x       g     g    x',
        'x  g       s       x',
        'x     g      g     x',
        '    g    bbb    g   ',
        '         b b        ',
        'x    g   bbb    g   ',
        'x            g     x',
        'x   g     a     g  x',
        'x      g           x',
        'x  g        g      x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['11,2', '8,8'],
      backgroundColor: '#90C860',
      npcs: [
        { ...NPCS.merchant, x: 15, y: 5 },
        { ...NPCS.blacksmith, x: 3, y: 2 }
      ]
    },
    // (3,0) Eastern Field
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  g     g    g    x',
        'x     g       g    x',
        'x  g     g     g   x',
        '      g     g       ',
        '   g     h     g    ',
        '      g     g       ',
        'x  g     g     g   x',
        'x     g       g    x',
        'x  g     g    g    x',
        'x     g       g    x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,5'],
      enemies: [
        { type: 'slime', x: 5, y: 3 },
        { type: 'slime', x: 14, y: 8 },
        { type: 'goblin', x: 16, y: 4 }
      ],
      backgroundColor: '#90C860'
    },
    // (4,0) Goblin Outpost
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  g  T     T  g   x',
        'x    g   T    g    x',
        'x  T   g    T   g  x',
        '     g    g    g   x',
        '   g    a    g     x',
        'x    g     g    g  x',
        'x  g  T      T  g  x',
        'x      g  T   g    x',
        'x  T  g      g  T  x',
        'x    g    g   g    x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['8,5'],
      enemies: [
        { type: 'goblin', x: 5, y: 3 },
        { type: 'goblin', x: 14, y: 6 },
        { type: 'goblin', x: 10, y: 8 },
        { type: 'goblin', x: 7, y: 5 }
      ],
      backgroundColor: '#80A850'
    },
    // (5,0) Coastal Cliffs
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x .. wwwwwwww ..xxxx',
        'x . wwwwwwwwww . xxx',
        'x . wwwwwwwwww .  xx',
        'x .. wwwwwwww ..    ',
        'x ... wwwwww ...    ',
        'x ....  wwww ....xxx',
        'x .....      ....xxx',
        'x ................xx',
        'x ................xx',
        'x                  x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'bat', x: 5, y: 8 },
        { type: 'bat', x: 14, y: 8 },
        { type: 'slime', x: 10, y: 9 }
      ],
      backgroundColor: '#A0B8C8'
    },
    // (6,0) Lighthouse
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x .wwwwwwwwwwwwww. x',
        'x .wwwwwwwwwwwwww. x',
        'x ..wwwwwwwwwwww.. x',
        '  ...  ......  ..   ',
        '  ..   . a  .  ..   ',
        'x ..   ......  ..xx ',
        'x ...          ...xx',
        'x ................ x',
        'x ................ x',
        'x                  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,5'],
      enemies: [
        { type: 'bat', x: 4, y: 9 },
        { type: 'slime', x: 15, y: 8 }
      ],
      backgroundColor: '#A0B8C8',
      npcs: [
        { ...NPCS.hermit, x: 12, y: 7 }
      ]
    },
    // (7,0) Beach
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x .wwwwwwwwwwwwww. x',
        'x .wwwwwwwwwwwwww. x',
        'x ..wwwwwwwwwwww.. x',
        '  ............  C  x',
        '  ..............   x',
        'x ................ x',
        'x ................ x',
        'x ................ x',
        'x ......    ...... x',
        'x        h         x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['16,4', '9,10'],
      enemies: [
        { type: 'slime', x: 5, y: 6 },
        { type: 'slime', x: 14, y: 6 },
        { type: 'slime', x: 10, y: 8 }
      ],
      backgroundColor: '#C8C090'
    },
  ],
  // Row 1: Wilderness row
  [
    // (0,1) Farm / Pond
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  g     g    g    x',
        'x     wwwww    g   x',
        'x  g wwwwwww       x',
        'x    wwwwwwww   g   ',
        'x  g  wwwwww        ',
        'x      wwww     g  x',
        'x   g        g     x',
        'x        h         x',
        'x  g         g     x',
        'x       g          x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,8'],
      enemies: [
        { type: 'slime', x: 14, y: 3 },
        { type: 'slime', x: 16, y: 7 }
      ],
      backgroundColor: '#90C860',
      npcs: [
        { ...NPCS.villager1, x: 3, y: 8 }
      ]
    },
    // (1,1) Forest Clearing
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x T    T     T     x',
        'x   T     T     T  x',
        'x T    T     T     x',
        '     T    B    T    ',
        '   T    T    T      ',
        'x    T     T    T  x',
        'x  T    T     T    x',
        'x     T    T       x',
        'x  T     T     T   x',
        'x     T      T     x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,4'],
      enemies: [
        { type: 'bat', x: 5, y: 3 },
        { type: 'bat', x: 15, y: 7 },
        { type: 'spider', x: 10, y: 8 }
      ],
      backgroundColor: '#608040'
    },
    // (2,1) Graveyard
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  G     G    G    x',
        'x     G     G      x',
        'x  G     G     G   x',
        '      G     G       ',
        '   G     G     G    ',
        'x      G     G      ',
        'x  G      G     G  x',
        'x     G      G     x',
        'x  G     *     G   x',
        'x     G     G      x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,9'],
      enemies: [
        { type: 'skeleton', x: 5, y: 4 },
        { type: 'skeleton', x: 14, y: 6 },
        { type: 'ghost', x: 10, y: 2 }
      ],
      backgroundColor: '#5D5050'
    },
    // (3,1) Secret Garden (ASS room easter egg)
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x                  x',
        'x                  x',
        'x    bbb bbb bbb   x',
        'x    b b b   b      ',
        '     bbb bbb bbb    ',
        '     b b   b   b   x',
        'x    b b bbb bbb   x',
        'x                  x',
        'x         a        x',
        'x                  x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['9,9'],
      enemies: [
        { type: 'bat', x: 4, y: 2 },
        { type: 'bat', x: 16, y: 8 }
      ],
      backgroundColor: '#90EE90',
    },
    // (4,1) Orc Camp
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  T       T    T  x',
        'x    T  .....  T   x',
        'x  T   .     .  T  x',
        '       .  h  .      ',
        '       .     .      ',
        'x  T   .....    T  x',
        'x    T       T     x',
        'x  T    T    T  T  x',
        'x    T    *    T   x',
        'x  T   T    T   T  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,4', '10,9'],
      enemies: [
        { type: 'orc', x: 6, y: 3 },
        { type: 'orc', x: 14, y: 7 },
        { type: 'goblin', x: 10, y: 2 },
        { type: 'goblin', x: 16, y: 5 }
      ],
      backgroundColor: '#6A7A40'
    },
    // (5,1) Spider Queen Lair - Deep Catacombs
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  G  x     x  G  x',
        'x    x  G x   G   x',
        'x  G    x    G  x  x',
        '    x G    G  x    x',
        '  G   x  G  x   G  x',
        'x   G    x   G    x',
        'x  x  G     x  G  x',
        'x    G  x  G    x  x',
        'x  G  x    G  x   x',
        'x    G   x   G    x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'spiderQueen', x: 10, y: 6 },
        { type: 'spider', x: 5, y: 3 },
        { type: 'spider', x: 15, y: 3 },
        { type: 'spider', x: 5, y: 9 },
        { type: 'spider', x: 15, y: 9 }
      ],
      backgroundColor: '#2A1A2A'
    },
    // (6,1) Dark Forest
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'xTT T  TT  T  TT xx ',
        'xT  TT T TT  T  T x ',
        'x TT  T  TT  T  T x ',
        'xT TT  T  TT  T     ',
        'x TT  T  TT  T      ',
        'xT TT  T  TT  T T x ',
        'x TT  T  TT  T  T x ',
        'xT TT  T  TT  T T x ',
        'x TT  T  TT  T  T x ',
        'xT TT  T  TT  T T x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'spider', x: 7, y: 3 },
        { type: 'spider', x: 13, y: 7 },
        { type: 'goblin', x: 10, y: 5 }
      ],
      backgroundColor: '#405030'
    },
    // (7,1) Wolf Den
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'xT   x  T    x T xx ',
        'x  T   x  T    T xx ',
        'xT    T   x  T  xxx ',
        '   T    x    T   T x',
        '  T   x   h   T   x ',
        'x  T     x   T  T x ',
        'xT    T    T   x  x ',
        'x   T   x  T   T xx ',
        'xT    T   x  T  xxx ',
        'x  T     T   T  x x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['10,5'],
      enemies: [
        { type: 'orc', x: 6, y: 3 },
        { type: 'orc', x: 14, y: 7 },
        { type: 'goblin', x: 10, y: 9 }
      ],
      backgroundColor: '#506040'
    },
    // (8,1) Mountain Pass
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'xxxx    xxxx    xxxx',
        'xxx  x   xx  x  xxx ',
        'xx  xx    xx  x  xx ',
        'x   xx  a  xx  xxxx ',
        'x  xx  xxx  xx    x ',
        'x   xx   xxx xx   x ',
        'x  xx  xxx  xx  xxx ',
        'x   xx   xx  xx   x ',
        'x  xx  x  xx   x  x ',
        'xxxx    xx  xxxx  xx',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['8,4'],
      enemies: [
        { type: 'bat', x: 6, y: 3 },
        { type: 'bat', x: 14, y: 7 },
        { type: 'bat', x: 10, y: 5 }
      ],
      backgroundColor: '#8090A0'
    },
  ],
  // Row 2: Swamp / Cave approach
  [
    // (0,2) Swamp
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  b www     b     x',
        'x     wwww  b      x',
        'x  b   www     b   x',
        'x    b   ww  b      ',
        'x  b       b        ',
        'x     b  b     b   x',
        'x  b     =     b   x',
        'x     b  www b     x',
        'x  b   wwww    b   x',
        'x    b  www  b     x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'swampBeast', x: 4, y: 5 },
        { type: 'slime', x: 12, y: 3 },
        { type: 'spider', x: 15, y: 8 }
      ],
      backgroundColor: '#607050',
      npcs: [
        { ...NPCS.witch, x: 16, y: 5 }
      ]
    },
    // (1,2) Cave Entrance
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x     x   x    x',
        'x    x      x     x',
        'x  x    x      x  x',
        '     x     x        ',
        '   x    d    x      ',
        'x     x    x    x  x',
        'x  x     x     x   x',
        'x    x      x      x',
        'x  x    k     x    x',
        'x     x    x       x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,9'],
      enemies: [
        { type: 'bat', x: 6, y: 3 },
        { type: 'bat', x: 14, y: 7 },
        { type: 'spider', x: 10, y: 4 }
      ],
      backgroundColor: '#4A4A4A'
    },
    // (2,2) Ruins
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x x     x     x   x',
        'x   x     x       x',
        'x x   x       x   x',
        '    x     x   x    ',
        '  x   x     x      ',
        'x   x    s      x  x',
        'x x     x    x    x',
        'x   x       x     x',
        'x x    *  x    x   x',
        'x   x     x       x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,6', '7,9'],
      enemies: [
        { type: 'ghost', x: 5, y: 3 },
        { type: 'skeleton', x: 14, y: 5 },
        { type: 'wizard', x: 10, y: 8 }
      ],
      backgroundColor: '#5A5060',
      npcs: [
        { ...NPCS.ghostNPC, x: 16, y: 2 }
      ]
    },
    // (3,2) Troll Bridge
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  T     T     T   x',
        'x     T     T      x',
        'x  T     T     T   x',
        '    wwwwwwwwwwww     ',
        '    w  =  =   w     ',
        'x   wwwwwwwwwwww   x',
        'x  T     T     T   x',
        'x     T     T      x',
        'x  T    h    T     x',
        'x     T     T      x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,9'],
      enemies: [
        { type: 'troll', x: 10, y: 2 },
        { type: 'goblin', x: 5, y: 8 },
        { type: 'goblin', x: 15, y: 8 }
      ],
      backgroundColor: '#607050',
      npcs: [
        { ...NPCS.hermit, x: 16, y: 9 }
      ]
    },
    // (4,2) Orc Fortress
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x x   x      x    x',
        'x   x   x   x   x x',
        'x x   x   x   x   x',
        '    x   x   x      ',
        '  x   x   x   x    ',
        'x   x   a   x   x  x',
        'x x   x   x   x   x',
        'x   x   x   x   x x',
        'x x   x   h   x   x',
        'x   x   x   x   x x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['8,6', '10,9'],
      enemies: [
        { type: 'orc', x: 5, y: 3 },
        { type: 'orc', x: 14, y: 7 },
        { type: 'darkKnight', x: 10, y: 5 },
        { type: 'goblin', x: 8, y: 9 }
      ],
      backgroundColor: '#4A4040'
    },
    // (5,2) Mushroom Grotto
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  b  b     b  b  x ',
        'x    b   b    b    x',
        'x  b    b   b   b  x',
        '    b  b   b  b     ',
        '   b    b    b      ',
        'x    b   b  b   b  x',
        'x  b   b    b   b  x',
        'x    b    b   b    x',
        'x  b   b    b   b  x',
        'x    b   b    b    x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'slime', x: 6, y: 3 },
        { type: 'slime', x: 14, y: 7 },
        { type: 'swampBeast', x: 10, y: 5 }
      ],
      backgroundColor: '#506848'
    },
    // (6,2) Flooded Tunnels
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x wwwwww  x    x ',
        'x   wwwwwwww   x  x ',
        'x  x ww==ww  x    x ',
        '     ww  ww         ',
        '   x  ==     x      ',
        'x    ww  ww     x  x',
        'x  x wwwwwwww x   x ',
        'x    wwwwwwww   k  x',
        'x  x   wwww   x   x ',
        'x        x      x  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['17,8'],
      enemies: [
        { type: 'bat', x: 5, y: 4 },
        { type: 'bat', x: 15, y: 6 },
        { type: 'bat', x: 10, y: 9 }
      ],
      backgroundColor: '#3A4A5A'
    },
    // (7,2) Crystal Cavern
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x    x     x  xx ',
        'x    x     x    x  x',
        'x  x   x     x   xx ',
        '     x    *    x   x',
        '   x    x    x     x',
        'x    x     x    x  x',
        'x  x    x     x  xx ',
        'x    x     x    x  x',
        'x  x    x     x  xx ',
        'x    x     x    x  x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['10,4'],
      enemies: [
        { type: 'ghost', x: 6, y: 3 },
        { type: 'ghost', x: 14, y: 7 },
        { type: 'wizard', x: 10, y: 9 }
      ],
      backgroundColor: '#3A3A5A'
    },
  ],
  // Row 3: Dungeon / Deep areas
  [
    // (0,3) Lava Cavern
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x     LLLL     x   x',
        'x   LL    LLL      x',
        'x  x  LLLL   x    x',
        'x    x    x     x  x',
        'x  x   h    x      ',
        'x    x    x     x  x',
        'x  x   LLLL  x    x',
        'x    LLL   LL      x',
        'x  x    LLLL   x   x',
        'x     x     x      x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,5'],
      enemies: [
        { type: 'fireImp', x: 6, y: 4 },
        { type: 'fireImp', x: 14, y: 4 },
        { type: 'spider', x: 10, y: 8 },
        { type: 'bat', x: 4, y: 8 }
      ],
      backgroundColor: '#3A2020'
    },
    // (1,3) Deep Dungeon
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x    x      x   x',
        'x     x    x       x',
        'x  x     x    x    x',
        'x     x     x       ',
        '   x    x      x    ',
        'x     *    x       x',
        'x  x     x    x    x',
        'x     x     x      x',
        'x  x    x      x   x',
        'x     x    a  x    x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['6,6', '12,10'],
      enemies: [
        { type: 'darkKnight', x: 5, y: 2 },
        { type: 'skeleton', x: 15, y: 8 },
        { type: 'ghost', x: 10, y: 4 },
        { type: 'wizard', x: 8, y: 9 }
      ],
      backgroundColor: '#2A2A3A'
    },
    // (2,3) Dark Knight Hall
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x   x         x    x',
        'x      x   x       x',
        'x   x     x    x   x',
        '     x        x     ',
        '   x    h    x      ',
        'x     x    x     x  x',
        'x   x     x    x   x',
        'x      x     x     x',
        'x   x     x     x  x',
        'x      x     x     x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,5'],
      enemies: [
        { type: 'darkKnight', x: 5, y: 3 },
        { type: 'darkKnight', x: 14, y: 7 },
        { type: 'skeleton', x: 10, y: 2 },
        { type: 'ghost', x: 10, y: 9 }
      ],
      backgroundColor: '#2A2030'
    },
    // (3,3) Troll Den
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x        x      x',
        'x     x   x    x   x',
        'x  x     x    x    x',
        '     x      x       ',
        '   x    h     x     ',
        'x     x    x     x  x',
        'x  x     x    x    x',
        'x     x     x      x',
        'x  x     a    x    x',
        'x     x    x       x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,5', '9,9'],
      enemies: [
        { type: 'troll', x: 6, y: 3 },
        { type: 'troll', x: 14, y: 7 },
        { type: 'goblin', x: 10, y: 2 },
        { type: 'goblin', x: 10, y: 9 }
      ],
      backgroundColor: '#3A3A2A'
    },
    // (4,3) Fire Pit
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x     LLLL    LLLL x',
        'x  LL    LL LL    Lx',
        'x  L      L L      x',
        'x     x      x     x',
        'x  x    h     x    x',
        'x     x    x       x',
        'x  L       L L     x',
        'x  LL    LL  LL   Lx',
        'x     LLLL    LLLL x',
        'x                  x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['8,5'],
      enemies: [
        { type: 'fireImp', x: 5, y: 5 },
        { type: 'fireImp', x: 15, y: 5 },
        { type: 'fireImp', x: 10, y: 2 },
        { type: 'wizard', x: 10, y: 8 }
      ],
      backgroundColor: '#3A1818'
    },
    // (5,3) Skeleton Crypt
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  G  x      G  x x ',
        'x   G    x  G      x',
        'x  x  G      x  G  x',
        'x   G    x  G   x   ',
        'x  x  G    x  G     ',
        'x    G  x    G   x x',
        'x  x  G     x  G   x',
        'x   G    x  G   x  x',
        'x  x  G      G  x  x',
        'x    G    x  G   xxx',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'skeleton', x: 6, y: 3 },
        { type: 'skeleton', x: 14, y: 5 },
        { type: 'skeleton', x: 8, y: 8 },
        { type: 'darkKnight', x: 10, y: 6 }
      ],
      backgroundColor: '#2A2A3A'
    },
    // (6,3) Lava Bridge
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x LLLLLLLLLLLLLLLL x',
        'x L              L x',
        'x L  =========  L x ',
        '  L  L       L  L   ',
        '  L  =========  L   ',
        'x L     h        L x',
        'x L  =========  L x ',
        'x L  L       L  L x ',
        'x L  =========  L x ',
        'x LLLLLLLLLLLLLLLL x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['6,6'],
      enemies: [
        { type: 'fireImp', x: 8, y: 3 },
        { type: 'fireImp', x: 14, y: 5 },
        { type: 'fireImp', x: 8, y: 8 }
      ],
      backgroundColor: '#3A1818'
    },
    // (7,3) Armory
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  x  x      x  x x ',
        'x    x  s  x   x  x ',
        'x  x    x    x    x ',
        '     x     x    x  x',
        '   x   a     x    x ',
        'x    x    C    x  x ',
        'x  x    x    x    x ',
        'x    x     x    x x ',
        'x  x    a    x    x ',
        'x    x    x    x  x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['7,2', '7,5', '10,6', '7,9'],
      enemies: [
        { type: 'skeleton', x: 12, y: 3 },
        { type: 'skeleton', x: 6, y: 7 },
        { type: 'skeleton', x: 14, y: 9 }
      ],
      backgroundColor: '#2A2A3A'
    },
  ],
  // Row 4: Boss / Endgame
  [
    // (0,4) Underground River
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x     wwwwww       x',
        'x   ww      ww     x',
        'x  ww   =    ww    x',
        'x   ww      ww     x',
        'x     wwwwww        ',
        'x          h       x',
        'x                  x',
        'x     wwwwww       x',
        'x   ww      ww     x',
        'x  ww        ww    x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['11,6'],
      enemies: [
        { type: 'swampBeast', x: 14, y: 3 },
        { type: 'bat', x: 4, y: 7 },
        { type: 'bat', x: 16, y: 7 }
      ],
      backgroundColor: '#2A3A4A'
    },
    // (1,4) Boss Antechamber
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x                  x',
        'x   LLLL    LLLL   x',
        'x   L  L    L  L   x',
        'x   LLLL    LLLL   x',
        '                    ',
        'x        h         x',
        'x                  x',
        'x   LLLL    LLLL   x',
        'x   L  L    L  L   x',
        'x   LLLL    LLLL   x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['9,6'],
      enemies: [
        { type: 'darkKnight', x: 5, y: 5 },
        { type: 'darkKnight', x: 15, y: 5 },
        { type: 'wizard', x: 10, y: 2 },
        { type: 'wizard', x: 10, y: 9 },
        { type: 'ghost', x: 10, y: 5 }
      ],
      backgroundColor: '#1A1A2A'
    },
    // (2,4) Shadow Throne (final boss room)
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x   LLLL    LLLL   x',
        'x                  x',
        'x                  x',
        'x                  x',
        '                   x',
        'x                  x',
        'x                  x',
        'x                  x',
        'x                  x',
        'x   LLLL    LLLL   x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'troll', x: 10, y: 5 },
        { type: 'darkKnight', x: 6, y: 3 },
        { type: 'darkKnight', x: 14, y: 3 },
        { type: 'darkKnight', x: 6, y: 8 },
        { type: 'darkKnight', x: 14, y: 8 },
        { type: 'fireImp', x: 4, y: 5 },
        { type: 'fireImp', x: 16, y: 5 }
      ],
      backgroundColor: '#0A0A1A'
    },
    // (3,4) Hidden Treasury
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x                  x',
        'x   C    C    C    x',
        'x                  x',
        'x     a    a       x',
        'x                  x',
        'x   C    C    C    x',
        'x                  x',
        'x      h    h      x',
        'x                  x',
        'x                  x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['4,2', '9,2', '14,2', '4,6', '9,6', '14,6', '6,4', '11,4', '7,8', '12,8'],
      enemies: [],
      backgroundColor: '#3A3020',
      npcs: [
        { ...NPCS.scoutNPC, x: 10, y: 5 }
      ]
    },
    // (4,4) Frozen Chamber
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  x  wwwwww  x  xx ',
        'x    wwwwwwww   x  x',
        'x  x  wwwwww  x  xx ',
        'x       a       x   ',
        'x  x         x      ',
        'x    x     x    x  x',
        'x  x  wwwwww  x  xx ',
        'x    wwwwwwww   x  x',
        'x  x  wwwwww  x  xx ',
        'x    x     x    x  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,4'],
      enemies: [
        { type: 'ghost', x: 6, y: 5 },
        { type: 'ghost', x: 14, y: 5 },
        { type: 'wizard', x: 10, y: 6 }
      ],
      backgroundColor: '#8090B0'
    },
    // (5,4) Dragon's Hoard
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x LLLL         LL x ',
        'x LL   C    C  LL x ',
        'x LL           LL x ',
        '  LL  C    C   LL   ',
        '  LL           LL   ',
        'x LL  C    C   LL x ',
        'x LL           LL x ',
        'x LL   C    C  LL x ',
        'x LLLL         LL x ',
        'x LLLLLLLLLLLLLLLL x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['7,2', '12,2', '7,4', '12,4', '7,6', '12,6', '7,8', '12,8'],
      enemies: [
        { type: 'fireImp', x: 5, y: 5 },
        { type: 'fireImp', x: 15, y: 5 },
        { type: 'orc', x: 10, y: 3 }
      ],
      backgroundColor: '#3A1818'
    },
    // (6,4) Throne Approach
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x    x     x  xx ',
        'x     x    x    x  x',
        'x  x    x     x  xx ',
        '     x     h    x  x',
        '   x    x     x  xx ',
        'x     x    x    x  x',
        'x  x    x     x  xx ',
        'x     x    x    x  x',
        'x  x    x     x  xx ',
        'x     x    x    x  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['11,4'],
      enemies: [
        { type: 'darkKnight', x: 6, y: 3 },
        { type: 'darkKnight', x: 14, y: 7 },
        { type: 'darkKnight', x: 10, y: 9 }
      ],
      backgroundColor: '#1A1A2A'
    },
  ],
  // Row 5: Desert Region
  [
    // (0,5) Desert Edge
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  g ............. x',
        'x   g............  x',
        'x  g ..............x',
        'x  g ...........    ',
        'x   g..........     ',
        'x  g  .........  g x',
        'x   g .........    x',
        'x  g  ............ x',
        'x   g .........  g x',
        'x  g  .........    x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'goblin', x: 12, y: 3 },
        { type: 'goblin', x: 14, y: 7 },
        { type: 'goblin', x: 10, y: 9 }
      ],
      backgroundColor: '#C8A860'
    },
    // (1,5) Sand Dunes
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x .................x',
        'x .................x',
        'x .................x',
        '  ................. ',
        '  ................. ',
        'x .................x',
        'x .................x',
        'x .................x',
        'x .................x',
        'x .................x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'orc', x: 10, y: 3 },
        { type: 'goblin', x: 6, y: 7 },
        { type: 'goblin', x: 14, y: 9 }
      ],
      backgroundColor: '#C8A860'
    },
    // (2,5) Oasis
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  .....  ........x ',
        'x  ... wwww ......x ',
        'x  ..wwwwwwww.....x ',
        '  ...ww====ww....   ',
        '  ...wwwwwwww.....  ',
        'x  ... wwww ......x ',
        'x  .....  h ......x ',
        'x  ................x',
        'x  ................x',
        'x  ................x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['13,7'],
      enemies: [
        { type: 'slime', x: 5, y: 8 },
        { type: 'slime', x: 15, y: 8 }
      ],
      backgroundColor: '#C8A860',
      npcs: [
        { ...NPCS.merchant, x: 14, y: 3 }
      ]
    },
    // (3,5) Desert Ruins
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x  ..x  x..  x..  x ',
        'x  ....x  ........x ',
        'x  ..x  ..x..  x..x ',
        '  ....x  ....  x.x  ',
        '  ..x  ..*..x....x  ',
        'x  ....x  ....x...x ',
        'x  ..x  ..x.......x ',
        'x  ....x  ...  x..x ',
        'x  ..x  ..x..  x..x ',
        'x  ....x  ........x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['10,5'],
      enemies: [
        { type: 'skeleton', x: 6, y: 3 },
        { type: 'skeleton', x: 14, y: 7 },
        { type: 'skeleton', x: 10, y: 9 }
      ],
      backgroundColor: '#B89850'
    },
    // (4,5) Scorpion Pit
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  ................x',
        'x  ...  a  ........x',
        'x  ................x',
        '  ................. ',
        '  ................. ',
        'x  ................x',
        'x  ................x',
        'x  ................x',
        'x  ................x',
        'x  ................x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,2'],
      enemies: [
        { type: 'spider', x: 6, y: 4 },
        { type: 'spider', x: 14, y: 6 },
        { type: 'spider', x: 10, y: 8 },
        { type: 'swampBeast', x: 10, y: 3 }
      ],
      backgroundColor: '#C8A860'
    },
    // (5,5) Sand Temple
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  ..xxxx  xxxx.. x ',
        'x  ..x        x.. x ',
        'x  ..x   k    x.. x ',
        '  ...x        x..   ',
        '  ...x        x..   ',
        'x  ..x        x.. x ',
        'x  ..x        x.. x ',
        'x  ..xxxx  xxxx.. x ',
        'x  ..............xx ',
        'x  ..............xx ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,3'],
      enemies: [
        { type: 'wizard', x: 9, y: 5 },
        { type: 'darkKnight', x: 9, y: 7 }
      ],
      backgroundColor: '#B89850'
    },
    // (6,5) Desert Fortress
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  ..x  x    x .. x ',
        'x  ..  x  x   ..  x ',
        'x  ..x      x ..  x ',
        '  ...  x  x   ... x ',
        '  ...x      x ... x ',
        'x  ..  x  C   ..  x ',
        'x  ..x      x ..  x ',
        'x  ..  x  x   ..  x ',
        'x  ..x  x    x .. x ',
        'x  ..  x  x   ..  x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['10,6'],
      enemies: [
        { type: 'orc', x: 6, y: 3 },
        { type: 'orc', x: 14, y: 7 },
        { type: 'troll', x: 10, y: 5 }
      ],
      backgroundColor: '#B89850'
    },
  ],
  // Row 6: Mountains
  [
    // (0,6) Foothills
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  g  T     T  g  x ',
        'x   g   T  g    T x ',
        'x  T  g    T  g   x ',
        'x   g  T  g   T g   ',
        'x  T    g   T  g    ',
        'x   g T   g    T  x ',
        'x  g    T   g  T  x ',
        'x   T g    T  g   x ',
        'x  g   T  g    T  x ',
        'x   g    T   g    x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'slime', x: 6, y: 3 },
        { type: 'slime', x: 14, y: 7 },
        { type: 'slime', x: 10, y: 5 }
      ],
      backgroundColor: '#8090A0'
    },
    // (1,6) Mountain Trail
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x xxx     xxx  xxxx ',
        'x xx  x     xx  x x ',
        'x x     x    x  xxx ',
        '    x     x    x    ',
        '  x    x     x      ',
        'x    x    x    x  x ',
        'x  x    x    x  xxx ',
        'x xx  x    xx  x  x ',
        'x xxx    xxx    xx x',
        'x xxxx  xxxx  xxx x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'bat', x: 8, y: 3 },
        { type: 'bat', x: 12, y: 7 },
        { type: 'goblin', x: 6, y: 5 },
        { type: 'goblin', x: 14, y: 5 }
      ],
      backgroundColor: '#8090A0'
    },
    // (2,6) Eagle's Nest
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  T    T    T     x',
        'x    T    T    T   x',
        'x  T    T    T     x',
        '    T   a  T    T   ',
        '  T    T    T       ',
        'x    T    T    T   x',
        'x  T    T    T     x',
        'x    T    T    T   x',
        'x  T    T    T     x',
        'x    T    T    T   x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,4'],
      enemies: [
        { type: 'bat', x: 5, y: 2 },
        { type: 'bat', x: 15, y: 2 },
        { type: 'bat', x: 5, y: 8 },
        { type: 'bat', x: 15, y: 8 },
        { type: 'bat', x: 10, y: 5 }
      ],
      backgroundColor: '#8090A0'
    },
    // (3,6) Summit
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  xxx        xxx  x',
        'x  xx  h   C   xx x ',
        'x  x               x',
        '                    ',
        '                    ',
        'x  x               x',
        'x  xx           xx x',
        'x  xxx        xxx  x',
        'x  xxxx      xxxx  x',
        'x  xxxxx    xxxxx  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['8,2', '14,2'],
      enemies: [],
      backgroundColor: '#9098A8',
      npcs: [
        { ...NPCS.hermit, x: 10, y: 5 }
      ]
    },
    // (4,6) Glacier
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  wwwwx    xwwww x ',
        'x  www   x   www  x ',
        'x  ww  x   x  ww  x ',
        '   w  x       x w x ',
        '   w x           w x',
        'x  ww  x   x  ww  x ',
        'x  www   x   www  x ',
        'x  wwwwx    xwwww x ',
        'x  wwwwwx  xwwwww x ',
        'x  wwwwwwxxwwwwww  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'ghost', x: 8, y: 3 },
        { type: 'ghost', x: 12, y: 7 },
        { type: 'ghost', x: 10, y: 5 }
      ],
      backgroundColor: '#8098B0'
    },
    // (5,6) Mine Entrance
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x  ..x...x..  xx ',
        'x  ....x  .....  xx ',
        'x  x ..  k x...  xx ',
        'x  ....x  ......xxx ',
        'x  ..x  ......x  xx ',
        'x  ....x  .....  xx ',
        'x  x ..  ..x...  xx ',
        'x  ....x  .....  xx ',
        'x  x ..x...x..   xx ',
        'x  ....x  .....  xx ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['9,3'],
      enemies: [
        { type: 'skeleton', x: 6, y: 5 },
        { type: 'skeleton', x: 14, y: 7 },
        { type: 'bat', x: 10, y: 9 }
      ],
      backgroundColor: '#706858'
    },
    // (6,6) Deep Mine
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x    x    x  x x ',
        'x    x    x    x  x ',
        'x  x  LLL  x   x xx ',
        '     LLLLL    x     ',
        '   x  LLL  x    x   ',
        'x    x  *  x   x  x ',
        'x  x    x    x    x ',
        'x    x    x    x  x ',
        'x  x    x    x  x x ',
        'x    x    x    x  x ',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['7,6'],
      enemies: [
        { type: 'fireImp', x: 8, y: 3 },
        { type: 'fireImp', x: 12, y: 7 },
        { type: 'darkKnight', x: 10, y: 9 }
      ],
      backgroundColor: '#3A2020'
    },
  ],
  // Row 7: Volcanic / Deep
  [
    // (0,7) Volcanic Rift
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x LLLL      LLLL  x ',
        'x LL   x  x   LL  x ',
        'x L  x      x  L  x ',
        'x   x    x   x  xxxx',
        'x  x   x   x   xxxxx',
        'x   x    x   x  xxxx',
        'x L  x      x  L  x ',
        'x LL   x  x   LL  x ',
        'x LLLL      LLLL  x ',
        'x LLLLLL  LLLLLL  x ',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'fireImp', x: 6, y: 4 },
        { type: 'fireImp', x: 14, y: 4 },
        { type: 'fireImp', x: 10, y: 6 },
        { type: 'fireImp', x: 6, y: 8 }
      ],
      backgroundColor: '#3A1818'
    },
    // (1,7) Magma Chamber
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x LLLLLLLLLLLLLLLL x',
        'x L              L x',
        'x L  ==========  Lxx',
        'x L  L        L  Lxx',
        'x L  ==========  Lxx',
        'x L     h        L x',
        'x L  ==========  Lxx',
        'x L  L        L  Lxx',
        'x L  ==========  Lxx',
        'x LLLLLLLLLLLLLLLL x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['8,6'],
      enemies: [
        { type: 'troll', x: 10, y: 4 },
        { type: 'wizard', x: 14, y: 6 }
      ],
      backgroundColor: '#3A1818'
    },
    // (2,7) Obsidian Halls
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x  x    x     x  xx ',
        'x     x    x    x  x',
        'x  x    x     x  xx ',
        'x     x    h    x  x',
        'x  x    x     x  xx ',
        'x     x    x    x  x',
        'x  x    x     x  xx ',
        'x     x    x    x  x',
        'x  x    x     x  xx ',
        'x     x    x    x  x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['11,4'],
      enemies: [
        { type: 'darkKnight', x: 6, y: 3 },
        { type: 'darkKnight', x: 14, y: 7 },
        { type: 'ghost', x: 10, y: 9 }
      ],
      backgroundColor: '#1A1A2A'
    },
    // (3,7) Demon Gate
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x LLLL          LLx ',
        'x LL            LLx ',
        'x LL            LLx ',
        'x                 xx',
        'x                 xx',
        'x                 xx',
        'x LL            LLx ',
        'x LL            LLx ',
        'x LLLL          LLx ',
        'x LLLLLLLLLLLLLLLLx ',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: [],
      enemies: [
        { type: 'darkKnight', x: 6, y: 4 },
        { type: 'darkKnight', x: 14, y: 4 },
        { type: 'wizard', x: 6, y: 7 },
        { type: 'wizard', x: 14, y: 7 },
        { type: 'orc', x: 10, y: 5 }
      ],
      backgroundColor: '#2A0A0A'
    },
    // (4,7) Infernal Throne
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x LLL           LLx ',
        'x LL   C    C   LLx ',
        'x L              L x',
        'x      H          x ',
        'x                  x',
        'x   C    C    C    x',
        'x L              L x',
        'x LL   C    C   LLx ',
        'x LLL           LLx ',
        'x LLLLLLLLLLLLLLLLx ',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['7,2', '12,2', '9,4', '4,6', '9,6', '14,6', '7,8', '12,8'],
      enemies: [
        { type: 'darkKnight', x: 5, y: 5 },
        { type: 'darkKnight', x: 15, y: 5 },
        { type: 'wizard', x: 10, y: 3 },
        { type: 'fireImp', x: 8, y: 7 },
        { type: 'fireImp', x: 12, y: 7 }
      ],
      backgroundColor: '#2A0A0A'
    },
  ],
];
