import {
  Dumbbell,
  Users,
  Mountain,
  Palette,
  UtensilsCrossed,
  GraduationCap,
  Gamepad2,
  Leaf,
  Compass,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps a category slug to a Lucide icon. We deliberately avoid the emoji stored
 * on categories — the consumer UI uses line icons for a premium, consistent look.
 */
const ICONS: Record<string, LucideIcon> = {
  sports: Dumbbell,
  social: Users,
  outdoors: Mountain,
  arts: Palette,
  food: UtensilsCrossed,
  learning: GraduationCap,
  gaming: Gamepad2,
  wellness: Leaf,
};

export function categoryIcon(slug?: string | null): LucideIcon {
  return (slug && ICONS[slug]) || Compass;
}
