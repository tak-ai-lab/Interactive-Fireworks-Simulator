export enum FireworkType {
  KIKU = 'KIKU',
  BOTAN = 'BOTAN',
  HEART = 'HEART',
  SMILEY = 'SMILEY',
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  position: Vector3D;
  prevPosition: Vector3D; // For drawing smooth trails
  velocity: Vector3D;
  color: string; // hsla string
  size: number;
  life: number;
  // Kiku-specific property for delayed color
  trailLife?: number;
  trailColor?: string;
  // For glow effect
  glowColor: string;
  fireworkType?: FireworkType;
}

export interface Firework {
  type: FireworkType;
  launcher: Particle;
  hasExploded: boolean;
  hue: number;
}

export interface CanvasHandles {
  launch: (type: FireworkType) => void;
  launchStarMine: () => void;
}