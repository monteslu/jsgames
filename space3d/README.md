# Space 3D

Three.js WebGL remake of the Space shooter game. Same gameplay, 3D renderer.

## What Changed from space/

The original `space/` game uses Canvas 2D (`ctx.fillRect`, `ctx.beginPath`, etc.). This version uses three.js with a WebGL renderer and an orthographic camera for the same 2D side-scrolling gameplay but with:

- **3D ship meshes** — player ship has cone fuselage, box wings, sphere cockpit, cylinder engine pods with glow. Enemy ships are spinning octahedrons with cone prongs.
- **3D particle explosions** — tumbling polyhedra (octahedrons, tetrahedrons, icosahedrons) with depth, rotation, emissive glow, and z-axis spread.
- **Shader nebula clouds** — GLSL fragment shader with 5-octave fbm noise, animated, radial falloff. Not textures.
- **Parallax starfield** — 3 depth layers of stars at different scroll speeds.
- **Phong lighting** — ambient + directional + point light that follows the player ship. All ship materials use `MeshPhongMaterial` with specular highlights.
- **3D bullets** — capsule geometry with trailing glow cone.
- **Boss** — multi-part mesh with health bar, tracking AI, bullet spawning.

## Game Logic

Identical to `space/`:
- Arrow keys to move, Z to shoot
- Red/yellow/blue enemy types with different movement patterns (straight, sine wave, complex sine)
- Boss every 13 enemies with increasing difficulty
- Score: +10/15/50 per kill, -1 per shot, -50 for collision, -10 for missed enemy
- Music: random level tracks loop, crossfade to random boss tracks on boss spawn, back to level on boss kill. Never repeats the same track consecutively.

## Audio

Same audio system as `space/`:
- **SFX**: explosion, laser, powerdown, boss laser, boss explosion (MP3, via Web Audio API)
- **Music**: 4 level tracks + 4 boss tracks (OGG Vorbis, 128kbps)
- Level music: 0.8 volume, 1.5s fade in/out
- Boss music: 1.0 volume, 0.5s fade in
- SFX: 0.3 volume (reduced so music is audible)

## Building for wasmcart

```bash
# Install deps
npm install

# Bundle (three.js + game code → single file)
npx esbuild index_src.js --bundle --format=esm --outfile=main.js

# Pack as wasmcart-jsgame cart
cd ../wasmcart-jsgame
bash pack_game.sh /tmp/space3d_pack/ examples/space3d/space3d.wasc "Space 3D"
```

The bundled `main.js` (1.1MB) includes three.js and all game modules. wasmcart-jsgame's QuickJS runtime evaluates it as an ES module. Three.js WebGL calls go through the wasmcart GL ABI to the host GPU.

## Running

```bash
# Browser (development)
npx serve .

# wasmcart (retroemu SDL)
node retroemu/bin/cli.js examples/space3d/space3d.wasc --video sdl --res 640x480

# wasmcart (native host)
wasmcart-run examples/space3d/space3d.wasc --res 640x480
```

## Files

| File | What |
|------|------|
| `index_src.js` | Game source (ES module imports) |
| `main.js` | Bundled output (esbuild, includes three.js) |
| `boss3d.js` | Boss class with 3D mesh, AI, bullets |
| `particles3d.js` | 3D particle explosion system |
| `nebula.js` | GLSL shader nebula clouds |
| `input.js` | Keyboard + gamepad input (shared with space/) |
| `sfx.js` | Sound effects + music system (shared with space/) |
| `sounds/` | SFX (MP3) |
| `music/` | Level + boss tracks (OGG) |
