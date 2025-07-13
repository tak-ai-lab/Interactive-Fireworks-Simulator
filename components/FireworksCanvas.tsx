import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { Firework, Particle, CanvasHandles, Vector3D } from '../types';
import { FireworkType } from '../types';
import * as C from '../constants'; // Use aliased import for constants

// --- Helper Functions ---

/**
 * Projects a 3D point to a 2D canvas space.
 */
function project(
  point3d: Vector3D,
  perspective: number,
  projectionCenter: { x: number; y: number }
): { x: number; y: number; scale: number } {
  const scale = perspective / (perspective + point3d.z);
  const x = point3d.x * scale + projectionCenter.x;
  const y = point3d.y * scale + projectionCenter.y;
  return { x, y, scale };
}

/**
 * Creates a new particle for a firework explosion.
 */
function createParticle(
    position: Vector3D,
    velocity: Vector3D,
    hue: number,
    fireworkType: FireworkType,
    isKiku: boolean
): Particle {
    const colorVariation = (Math.random() - 0.5) * 20;
    const finalHue = hue + colorVariation;

    let life: number, size: number;
    if (fireworkType === FireworkType.SMILEY) {
        life = C.SMILEY_PARTICLE_LIFE + Math.random() * 20 - 10;
        size = C.SMILEY_PARTICLE_SIZE;
    } else if (fireworkType === FireworkType.HEART) {
        life = C.HEART_PARTICLE_LIFE + Math.random() * 40 - 20;
        size = C.HEART_PARTICLE_SIZE + Math.random() - 0.5;
    } else { // Kiku & Botan
        life = C.SPHERE_PARTICLE_LIFE + Math.random() * 40 - 20;
        size = C.SPHERE_PARTICLE_SIZE + Math.random() - 0.5;
    }

    return {
        position: { ...position },
        prevPosition: { ...position },
        velocity,
        color: `hsl(${finalHue}, 100%, 70%)`,
        glowColor: `hsl(${finalHue}, 100%, 50%)`,
        size,
        life,
        trailLife: isKiku ? 20 + Math.random() * 10 : 0,
        trailColor: isKiku ? C.KIKU_TRAIL_COLOR : undefined,
        fireworkType,
    };
}


// --- Main Component ---

const FireworksCanvas = forwardRef<CanvasHandles, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworks = useRef<Firework[]>([]);
  const particles = useRef<Particle[]>([]);
  
  // 3D projection settings
  const perspective = useRef(300);
  const projectionCenter = useRef({ x: 0, y: 0 });

  const createExplosion = useCallback((firework: Firework) => {
    const newParticles: Particle[] = [];
    const baseHue = firework.hue;
    const explosionPosition = firework.launcher.position;
    const isKiku = firework.type === FireworkType.KIKU;

    const addParticle = (velocity: Vector3D) => {
        newParticles.push(createParticle(explosionPosition, velocity, baseHue, firework.type, isKiku));
    };

    if (firework.type === FireworkType.SMILEY) {
        const shapePoints = C.getSmileyShape(C.SMILEY_FIREWORK_SCALE);
        shapePoints.forEach(point => {
            const velocity = {
              x: point.x * C.SMILEY_PARTICLE_VELOCITY_SCALE + (Math.random() - 0.5) * C.SMILEY_PARTICLE_JITTER,
              y: point.y * C.SMILEY_PARTICLE_VELOCITY_SCALE + (Math.random() - 0.5) * C.SMILEY_PARTICLE_JITTER,
              z: (Math.random() - 0.5) * C.SMILEY_PARTICLE_JITTER * 2,
            };
            addParticle(velocity);
        });
    } else if (firework.type === FireworkType.HEART) {
        const shapePoints = C.getHeartShape(C.HEART_FIREWORK_SCALE);
        shapePoints.forEach(point => {
            const velocity = {
              x: point.x * C.HEART_PARTICLE_VELOCITY_SCALE + (Math.random() - 0.5) * C.HEART_PARTICLE_JITTER,
              y: point.y * C.HEART_PARTICLE_VELOCITY_SCALE + (Math.random() - 0.5) * C.HEART_PARTICLE_JITTER,
              z: (Math.random() - 0.5) * C.HEART_PARTICLE_JITTER,
            };
            addParticle(velocity);
        });
    } else { // Kiku & Botan - 3D Spherical Explosion
        const power = C.SPHERE_EXPLOSION_POWER * (0.9 + Math.random() * 0.2);
        
        for (let i = 0; i < C.KIKU_BOTAN_PARTICLE_COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const velocity = {
              x: Math.sin(phi) * Math.cos(theta) * power,
              y: Math.sin(phi) * Math.sin(theta) * power,
              z: Math.cos(phi) * power,
            };
            addParticle(velocity);
        }
    }
    
    particles.current.push(...newParticles);
  }, []);

  const launch = useCallback((type: FireworkType, powerScale = 1) => {
    const { y: centerY } = projectionCenter.current;
    const hue = type === FireworkType.SMILEY ? 60 : Math.random() * 360;
    const launcherPosition = { x: (Math.random() - 0.5) * 100, y: centerY, z: (Math.random() - 0.5) * 200 };
    
    // Calculate launch velocity to reach a nice height
    const targetY = -centerY * (0.25 + Math.random() * 0.4) * powerScale;
    const requiredHeight = launcherPosition.y - targetY;
    const initialVy = -Math.sqrt(2 * C.GRAVITY * Math.max(0, requiredHeight));

    const launcher: Particle = {
      position: launcherPosition,
      prevPosition: { ...launcherPosition },
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: initialVy,
        z: (Math.random() - 0.5) * 4
      },
      color: `hsl(${hue}, 100%, 70%)`,
      glowColor: `hsl(${hue}, 100%, 50%)`,
      size: 2,
      life: 100, // This is just for alpha, not lifetime
      fireworkType: type,
    };
    fireworks.current.push({ type, launcher, hasExploded: false, hue });
  }, []);

  const launchStarMine = useCallback(() => {
    let count = 0;
    const interval = setInterval(() => {
      const type = Math.random() < 0.5 ? FireworkType.KIKU : FireworkType.BOTAN;
      const powerScale = 0.7 + Math.random() * 0.6;
      launch(type, powerScale);
      count++;
      if (count >= C.STAR_MINE_COUNT) {
        clearInterval(interval);
      }
    }, 150);
  }, [launch]);

  useImperativeHandle(ref, () => ({
    launch,
    launchStarMine,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        perspective.current = rect.width * 0.8;
        projectionCenter.current = { x: rect.width / 2, y: rect.height / 2 };
    };

    // --- Logic Update Functions ---
    const updatePhysics = () => {
        // Update launchers and trigger explosions
        for (let i = fireworks.current.length - 1; i >= 0; i--) {
            const fw = fireworks.current[i];
            fw.launcher.prevPosition = {...fw.launcher.position};
            fw.launcher.velocity.y += C.GRAVITY;
            fw.launcher.velocity.x *= C.LAUNCHER_FRICTION;
            fw.launcher.velocity.z *= C.LAUNCHER_FRICTION;
            fw.launcher.position.x += fw.launcher.velocity.x;
            fw.launcher.position.y += fw.launcher.velocity.y;
            fw.launcher.position.z += fw.launcher.velocity.z;

            if (fw.launcher.velocity.y >= 0) {
              fw.hasExploded = true;
              createExplosion(fw);
              fireworks.current.splice(i, 1); // Remove from array
            }
        }
        
        // Update particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.life--;
            if (p.life <= 0) {
                particles.current.splice(i, 1); // Remove particle
                continue;
            }
            
            p.prevPosition = {...p.position};
            p.velocity.y += C.GRAVITY;
            p.velocity.x *= C.PARTICLE_FRICTION;
            p.velocity.y *= C.PARTICLE_FRICTION;
            p.velocity.z *= C.PARTICLE_FRICTION;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;

            if (p.trailLife && p.trailLife > 0) {
                p.trailLife--;
            }
        }
    };
    
    // --- Rendering Functions ---
    const renderScene = () => {
        const bounds = canvas.getBoundingClientRect();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(0, 0, 0, ${C.CANVAS_FADE_ALPHA})`;
        ctx.fillRect(0, 0, bounds.width, bounds.height);
        
        ctx.globalCompositeOperation = 'lighter';

        // Draw launchers
        for (const fw of fireworks.current) {
            const p = fw.launcher;
            const current = project(p.position, perspective.current, projectionCenter.current);
            const prev = project(p.prevPosition, perspective.current, projectionCenter.current);
            
            const alpha = Math.min(1, p.life / 80) * Math.max(0, Math.min(1, current.scale * 1.5));
            if (alpha <= 0) continue;

            ctx.lineWidth = p.size * current.scale;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
        }

        // Draw explosion particles
        for (const p of particles.current) {
            const current = project(p.position, perspective.current, projectionCenter.current);
            
            const alpha = Math.min(1, p.life / 80) * Math.max(0, Math.min(1, current.scale * 1.5));
            if (alpha <= 0) continue;

            const color = p.trailLife && p.trailLife > 0 ? p.trailColor! : p.color;
            ctx.globalAlpha = alpha;

            if (p.fireworkType === FireworkType.BOTAN || p.fireworkType === FireworkType.HEART || p.fireworkType === FireworkType.SMILEY) {
                ctx.beginPath();
                ctx.arc(current.x, current.y, p.size * current.scale * 0.5, 0, Math.PI * 2, false);
                ctx.fillStyle = color;
                ctx.fill();
            } else { // Kiku is drawn with trails
                const prev = project(p.prevPosition, perspective.current, projectionCenter.current);
                ctx.lineWidth = p.size * current.scale;
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(current.x, current.y);
                ctx.stroke();
            }
        }
        
        ctx.globalAlpha = 1;
    };

    // --- Main Animation Loop ---
    const animate = () => {
      updatePhysics();
      renderScene();
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [createExplosion, launch]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
});

FireworksCanvas.displayName = 'FireworksCanvas';

export default FireworksCanvas;