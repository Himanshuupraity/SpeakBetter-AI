import {
  AudioLines, BookA, Gauge, BookOpen, CalendarCheck, ChartLine, FileClock, GraduationCap, Headphones, House, LayoutGrid,
  MessagesSquare, Mic, PenLine, Settings, Target, User,
} from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'Today',
    items: [
      { to: '/', label: 'Dashboard', icon: House, end: true },
      { to: '/daily', label: 'Daily Practice', icon: CalendarCheck },
    ],
  },
  {
    label: 'Speak',
    items: [
      { to: '/speak', label: 'AI Speaking', icon: Mic },
      { to: '/conversation', label: 'Conversation', icon: MessagesSquare },
      { to: '/pronunciation', label: 'Pronunciation', icon: AudioLines },
      { to: '/speed', label: 'Speaking Speed', icon: Gauge },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/grammar', label: 'Grammar', icon: GraduationCap },
      { to: '/vocabulary', label: 'Vocabulary', icon: BookA },
      { to: '/writing', label: 'Writing', icon: PenLine },
      { to: '/reading', label: 'Reading', icon: BookOpen },
      { to: '/listening', label: 'Listening', icon: Headphones },
    ],
  },
  {
    label: 'Track',
    items: [
      { to: '/mistakes', label: 'My Mistakes', icon: Target },
      { to: '/progress', label: 'Progress', icon: ChartLine },
      { to: '/history', label: 'History', icon: FileClock },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

/** Mobile bottom navigation. `match` lists route prefixes that highlight the tab. */
export const BOTTOM_NAV = [
  { to: '/', label: 'Home', icon: House, match: ['/', '/daily'] },
  { to: '/speak', label: 'Speak', icon: Mic, match: ['/speak', '/conversation', '/pronunciation', '/speed'] },
  { to: '/learn', label: 'Learn', icon: LayoutGrid, match: ['/learn', '/grammar', '/vocabulary', '/writing', '/reading', '/listening'] },
  { to: '/progress', label: 'Progress', icon: ChartLine, match: ['/progress', '/history', '/mistakes'] },
  { to: '/settings', label: 'Profile', icon: User, match: ['/settings'] },
];
