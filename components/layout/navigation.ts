import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  showDot?: boolean;
};

export const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3, label: "My Loans", href: "/loans" },
  { icon: Target, label: "Strategy", href: "/strategy" },
  { icon: TrendingUp, label: "Analysis", href: "/analysis" },
  { icon: CalendarDays, label: "EMI Calendar", href: "/calendar" },
  { icon: Activity, label: "Insights", href: "/insights" },
  { icon: Sparkles, label: "AI Advisor", href: "/chat" },
];

export const toolsNavItems: NavItem[] = [
  { icon: BookOpen, label: "Glossary", href: "/glossary" },
  { icon: UserRound, label: "Profile", href: "/profile" },
];

export const mobileBottomItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3, label: "Loans", href: "/loans" },
  { icon: Target, label: "Strategy", href: "/strategy" },
  { icon: TrendingUp, label: "Analysis", href: "/analysis" },
  { icon: MessageSquare, label: "AI Advisor", href: "/chat" },
];
