# Digital Organism

A generative art piece built with Next.js and Canvas. Watch 2000 particles form emergent flocking behavior, respond to your cursor, and create mesmerizing patterns.

![Digital Organism](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)

## What It Is

A particle system that exhibits emergent behavior through simple rules:

- **2000 particles** moving independently
- **Flocking behavior** - particles align with neighbors and maintain separation
- **Flow field dynamics** - sine/cosine waves create organic motion
- **Interactive modes** - attract, repel, or flow around your cursor
- **Dynamic coloring** - hue shifts based on velocity
- **Connection lines** - particles draw links to nearby neighbors

## How It Was Made

### Core Mechanics

**Particle System**
```typescript
interface Particle {
  x, y: number;      // Position
  vx, vy: number;    // Velocity
  life: number;      // Opacity fade-in
  hue: number;       // Color (HSL)
}
```

**Three Behavioral Modes**

1. **Flow** - Particles follow a mathematical flow field:
   ```typescript
   flowX = sin(y * 0.01 + time) * 0.5
   flowY = cos(x * 0.01 + time) * 0.5
   ```
   Creates organic, liquid-like motion

2. **Attract** - Gravitational pull toward cursor:
   ```typescript
   force = min(200 / distance, 5)
   velocity += force * directionToCursor
   ```

3. **Repel** - Push away from cursor:
   ```typescript
   force = (200 - distance) / 200 * 3
   velocity -= force * directionFromCursor
   ```

**Flocking Algorithm** (inspired by Craig Reynolds' Boids)

For each particle, check nearby particles (within 30px):
- **Alignment** - Match neighbor velocities slightly
- **Separation** - Push away to avoid overlap
- **Cohesion** - Implicit through connection drawing

**Visual Effects**

- **Trail effect** - Canvas fades with `rgba(0, 0, 0, 0.05)` instead of clearing
- **Dynamic color** - Hue rotates based on speed: `hue = (hue + speed * 0.5) % 360`
- **Connection lines** - Draw lines between particles <50px apart, alpha fades with distance
- **Glow shadows** - Active mode button has matching shadow color

### Technical Implementation

**Canvas Rendering**
- 60 FPS animation loop with `requestAnimationFrame`
- Particle size scales with velocity
- HSLA colors for smooth gradients
- Line alpha based on distance for depth effect

**React Integration**
- `useRef` for canvas and particles (avoid re-renders)
- `useState` for mouse position and mode
- `useEffect` for animation loop and cleanup
- Client-side only (`
