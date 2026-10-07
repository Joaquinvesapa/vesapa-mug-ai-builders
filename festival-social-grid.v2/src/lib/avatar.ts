/** Abstract shapes a person can pick as avatar (RF-16). */
export const AVATAR_SHAPES = ["circle", "square", "triangle", "diamond", "hexagon", "star"] as const;

export type AvatarShape = (typeof AVATAR_SHAPES)[number];

export type Avatar = { shape: AvatarShape; color: string };

export const DEFAULT_AVATAR: Avatar = { shape: "circle", color: "#7c3aed" };

export function isAvatarShape(value: string): value is AvatarShape {
  return (AVATAR_SHAPES as readonly string[]).includes(value);
}

/** Free color (RF-17) as a 6-digit hex, normalized to lowercase; null if invalid. */
export function normalizeAvatarColor(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}

/** SVG geometry for each shape in a 100 × 100 viewBox. */
export const AVATAR_PATHS: Record<AvatarShape, string> = {
  circle: "M50 4a46 46 0 1 1 0 92a46 46 0 1 1 0-92z",
  square: "M10 10h80v80H10z",
  triangle: "M50 6L95 90H5z",
  diamond: "M50 3L97 50L50 97L3 50z",
  hexagon: "M50 4L90 27v46L50 96L10 73V27z",
  star: "M50 4l13 29l32 3l-24 21l7 31l-28-16l-28 16l7-31L5 36l32-3z",
};

export const AVATAR_SHAPE_LABELS: Record<AvatarShape, string> = {
  circle: "Círculo",
  square: "Cuadrado",
  triangle: "Triángulo",
  diamond: "Rombo",
  hexagon: "Hexágono",
  star: "Estrella",
};
