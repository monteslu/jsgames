// worldData.js
import { COLORS } from './constants.js';

// x = impassable wall
// w = water
// b = bush
// s = sword
// k = key
// d = door
// h = heart
// p = potion
// m = monster
// l = ladder
// f = fire
// c = chest
// t = treasure
// e = empty

export const WORLD_DATA = [
  // Row 0
  [
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x                  x',
        'x    k     s       x',
        'x   xxx            x',
        'x                  x',
        'x                   ',
        'x                   ',
        'x                  x',
        'x          xxx     x',
        'x           x      x',
        'x           x      x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: ['4,2', '9,2'], // Key and sword positions
    },
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x                  x',
        'x                  x',
        'x    bbb           x',
        'x     b            x',
        '      b             ',
        '      b             ',
        'x    bbb           x',
        'x                  x',
        'x           m      x',
        'x                  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      enemies: [
        {
          type: 'slime',
          x: 10,
          y: 5
        }
      ],
      items: []
    },
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x                  x',
        'x                  x',
        'x    bbb bbb bbb   x',
        'x    b b b   b     x',
        '     bbb bbb bbb    ',
        '     b b   b   b    ',
        'x    b b bbb bbb   x',
        'x                  x',
        'x                  x',
        'x                  x',
        'xxxxxxxx  xxxxxxxxxx',
      ],
      items: [],
      backgroundColor: COLORS.lightGreenGrass,
    },
  ],
  // Row 1
  [
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x                  x',
        'x                  x',
        'x                  x',
        'x       wwwww      x',
        'x      wwwwwww      ',
        'x     wwwwwwwww     ',
        'x      wwwwwww     x',
        'x       wwwww      x',
        'x         h        x',
        'x                  x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['9,9'] // Heart position
    },
    {
      layout: [
        'xxxxxxxx  xxxxxxxxxx',
        'x                  x',
        'x                  x',
        'x   wwwwwwwwwww    x',
        'x   w         w    x',
        '    w    d    w    x',
        '    w         w    x',
        'x   w         w    x',
        'x   wwwww=wwwww    x',
        'x                  x',
        'x  m     k         x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['8,10'] // Key position
    },
  ],
];

// Helper function to create an empty screen template
export function createEmptyScreen() {
  return {
    layout: [
      'xxxxxxxxxxxxxxxxxxxx',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'xxxxxxxxxxxxxxxxxxxx',
    ],
    items: []
  };
}

// Helper function to create a pathway screen (open on all sides)
export function createPathwayScreen() {
  return {
    layout: [
      'xxxxxxxx  xxxxxxxxxx',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      '                    ',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'x                  x',
      'xxxxxxxx  xxxxxxxxxx',
    ],
    items: []
  };
}

// Helper to create a random dungeon room
export function createDungeonRoom() {
  const layout = createEmptyScreen().layout;
  // Add random features like pillars, water, etc.
  
  return {
    layout,
    items: []
  };
}

// Helper to add items to a screen
export function addItemsToScreen(screen, items) {
  const newScreen = {
    ...screen,
    items: [...screen.items],
  };
  
  items.forEach(({type, x, y}) => {
    // Update the layout to show the item
    newScreen.layout[y] = newScreen.layout[y].substring(0, x) + 
                         type + 
                         newScreen.layout[y].substring(x + 1);
    // Add to items list
    newScreen.items.push(`${x},${y}`);
  });
  
  return newScreen;
}