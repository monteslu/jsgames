// worldData.js

export const WORLD_DATA = [
  // Row 0
  [
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x                  x',
        'x    k             x',
        'x   xxx            x',
        'x                  x',
        'x         s        x',
        'x                  x',
        'x                  x',
        'x          xxx     x',
        'x           x      x',
        'x           x      x',
        'xxxxxxxx  xxxxxxxxx',
      ],
      items: ['2,2', '5,5'] // Key and sword positions
    },
    {
      layout: [
        'xxxxxxxxxxxxxxxxxxxx',
        'x                  x',
        'x                  x',
        'x    bbb           x',
        'x     b            x',
        '      b            ',
        'x     b            x',
        'x    bbb           x',
        'x                  x',
        'x                  x',
        'x                  x',
        'xxxxxxxx  xxxxxxxxx',
      ],
      items: []
    },
    // ... more screens for row 0
  ],
  // Row 1
  [
    {
      layout: [
        'xxxxxxxx  xxxxxxxxx',
        'x                  x',
        'x                  x',
        'x                  x',
        'x       wwwww      x',
        'x      wwwwwww     x',
        'x     wwwwwwwww    x',
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
        'xxxxxxxx  xxxxxxxxx',
        'x                  x',
        'x                  x',
        'x   wwwwwwwwwww   x',
        'x   w         w   x',
        'x   w    d    w   x',
        'x   w         w   x',
        'x   w         w   x',
        'x   wwwww=wwwww   x',
        'x                  x',
        'x        k        x',
        'xxxxxxxxxxxxxxxxxxxx',
      ],
      items: ['8,10'] // Key position
    },
    // ... more screens for row 1
  ],
  // ... more rows
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
      'xxxxxxxx  xxxxxxxxx',
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
      'xxxxxxxx  xxxxxxxxx',
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
    items: [...screen.items]
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
