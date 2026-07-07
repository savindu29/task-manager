import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Deterministic avatar colours: the same owner id always maps to the same
// swatch, so an owner is recognisable at a glance across rows/cards.
const OWNER_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

export function ownerColor(id: number): string {
  const index = Math.abs(id * 2654435761) % OWNER_COLORS.length;
  return OWNER_COLORS[index];
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface OwnerAvatarProps {
  id: number;
  name: string;
  className?: string;
}

/** Small avatar with initials on a colour derived from the owner id. */
export function OwnerAvatar({ id, name, className }: OwnerAvatarProps) {
  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarFallback
        className={cn("text-[0.625rem] font-medium text-white", ownerColor(id))}
      >
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
}
