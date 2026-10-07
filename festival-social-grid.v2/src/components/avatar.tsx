import { AVATAR_PATHS, AVATAR_SHAPE_LABELS, type Avatar as AvatarValue } from "@/lib/avatar";

export function Avatar({ avatar, size = 40 }: { avatar: AvatarValue; size?: number }) {
  return (
    <svg
      role="img"
      aria-label={`Avatar: ${AVATAR_SHAPE_LABELS[avatar.shape]}`}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="shrink-0"
    >
      <path d={AVATAR_PATHS[avatar.shape]} fill={avatar.color} />
    </svg>
  );
}
