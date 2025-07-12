import type { Vector2D } from './types';

// Performance-related constants
export const KIKU_BOTAN_PARTICLE_COUNT = 300;
export const STAR_MINE_COUNT = 36;

// Physics constants
export const GRAVITY = 0.04;
export const LAUNCHER_FRICTION = 0.99;
export const PARTICLE_FRICTION = 0.97;

// Style & Rendering constants
export const KIKU_TRAIL_COLOR = 'hsl(40, 100%, 80%)';
export const CANVAS_FADE_ALPHA = 0.15; // Consistent fade for all fireworks

// Firework Shape & Explosion Parameters
export const HEART_FIREWORK_SCALE = 0.2;
export const HEART_PARTICLE_VELOCITY_SCALE = 1.2; // 4 * 0.3
export const HEART_PARTICLE_JITTER = 0.5;
export const HEART_PARTICLE_LIFE = 100; // avg of 80 + 40
export const HEART_PARTICLE_SIZE = 2.5; // avg of 2 + 1

export const SMILEY_FIREWORK_SCALE = 0.2;
export const SMILEY_PARTICLE_VELOCITY_SCALE = 1.2; // 4 * 0.3
export const SMILEY_PARTICLE_JITTER = 0.1;
export const SMILEY_PARTICLE_LIFE = 110; // avg of 100 + 20
export const SMILEY_PARTICLE_SIZE = 2;

export const SPHERE_EXPLOSION_POWER = 5; // avg of 6 + 4, reduced from 8
export const SPHERE_PARTICLE_LIFE = 100; // avg of 80 + 40
export const SPHERE_PARTICLE_SIZE = 2.5; // avg of 2 + 1


export function getHeartShape(scale: number): Vector2D[] {
    const points: Vector2D[] = [];
    for (let t = 0; t < Math.PI * 2; t += 0.1) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        points.push({ x: x * scale, y: y * scale });
    }
    return points;
}

export function getSmileyShape(scale: number): Vector2D[] {
    const points: Vector2D[] = [];
    // Face outline
    for(let i = 0; i < Math.PI * 2; i += 0.2) {
        points.push({ x: Math.cos(i) * 12 * scale, y: Math.sin(i) * 12 * scale });
    }
    // Eyes
    points.push({ x: -4 * scale, y: -4 * scale });
    points.push({ x: 4 * scale, y: -4 * scale });
    // Smile
    for(let i = Math.PI * 0.2; i < Math.PI * 0.8; i += 0.1) {
        points.push({ x: Math.cos(i) * 8 * scale, y: Math.sin(i) * 8 * scale });
    }
    return points;
}