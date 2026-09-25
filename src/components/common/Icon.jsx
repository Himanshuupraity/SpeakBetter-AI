/** Maps icon names stored in data files to Lucide components. */
import {
  BookOpen, Briefcase, BugPlay, Building2, Coffee, Cpu, Crown, Flame, Headset, MessagesSquare, Mic, PenLine, Plane,
  Presentation, Rocket, Scale, ShoppingBag, Sun, Target, Trophy, Users, UtensilsCrossed, Sparkles,
} from 'lucide-react';

const MAP = { BookOpen, Briefcase, BugPlay, Building2, Coffee, Cpu, Crown, Flame, Headset, MessagesSquare, Mic, PenLine, Plane, Presentation, Rocket, Scale, ShoppingBag, Sun, Target, Trophy, Users, UtensilsCrossed };

export default function Icon({ name, ...props }) {
  const Cmp = MAP[name] || Sparkles;
  return <Cmp aria-hidden="true" {...props} />;
}
