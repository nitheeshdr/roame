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
} from 'lucide-react-native';

/** Category slug → Lucide line icon (consistent with the web app; no emoji). */
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
