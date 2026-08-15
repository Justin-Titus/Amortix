"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2, Menu, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationRecord,
} from "@/app/actions/notifications";

type DashboardHeaderProps = {
  onMenuToggle: () => void;
  isMenuOpen?: boolean;
};

const pageTitleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analysis": "Analysis",
  "/insights": "Insights",
  "/loans": "My Loans",
  "/calendar": "EMI Calendar",
  "/strategy": "Repayment Strategy",
  "/chat": "AI Advisor",
  "/glossary": "Glossary",
  "/profile": "Profile",
};

const pageContextMap: Record<string, string> = {
  "/dashboard": "Portfolio overview",
  "/analysis": "Scenario sandbox",
  "/insights": "Decision signals",
  "/loans": "Loan inventory",
  "/calendar": "Cashflow schedule",
  "/strategy": "Repayment planning",
  "/chat": "Advisor workspace",
  "/glossary": "Reference terms",
  "/profile": "Profile controls",
};

export default function DashboardHeader({ onMenuToggle, isMenuOpen = false }: DashboardHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Also pre-fetch notifications so the unread dot is accurate before opening the menu
      try {
        const items = await getUserNotifications();
        setNotifications(items);
      } catch (error) {
        console.error("Unable to load initial notifications:", error);
      }
    };
    initData();
  }, [pathname]);

  const pageTitle = Object.entries(pageTitleMap).find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1] ?? "Amortix";
  const pageContext = Object.entries(pageContextMap).find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1] ?? "Workspace";
  const dateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const userInitial = user?.user_metadata?.full_name?.trim()?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "U";
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const hasUnread = unreadCount > 0;

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const items = await getUserNotifications();
      setNotifications(items);
    } catch (error) {
      console.error("Unable to load notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setNotificationOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  const openNotifications = async () => {
    const nextState = !notificationOpen;
    setNotificationOpen(nextState);
    setMenuOpen(false);
    if (nextState) {
      await loadNotifications();
    }
  };

  const onMarkOneRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
      );
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  const onMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error("Unable to mark all notifications as read:", error);
    }
  };

  return (
    <header className="fixed left-0 top-0 z-40 w-full border-b border-amortix-border-light bg-white/95 px-4 backdrop-blur-md lg:left-60 lg:w-[calc(100%-240px)] lg:px-6">
      <div className="flex h-14 items-center justify-between">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-amortix-border-light bg-white text-amortix-navy hover:border-amortix-border-mid lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-dashboard-sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate font-heading text-base font-medium text-amortix-navy">{pageTitle}</h1>
          <p className="hidden text-[11px] text-amortix-slate/70 sm:block">{pageContext}</p>
        </div>

        <div ref={containerRef} className="relative flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-lg border border-amortix-border-light bg-slate-50 px-3 py-1.5 text-[12px] font-mono text-amortix-slate sm:block">
            {dateLabel}
          </div>

          <button
            type="button"
            onClick={() => {
              void openNotifications();
            }}
            aria-label="Open notifications"
            aria-expanded={notificationOpen}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-amortix-slate hover:bg-slate-100 hover:text-amortix-navy"
          >
            <Bell className="h-4 w-4" />
            {hasUnread ? <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" /> : null}
          </button>

          {notificationOpen ? (
            <div className="dropdown-menu absolute right-0 top-full z-50 mt-2 w-[min(336px,calc(100vw-24px))] sm:right-2" role="menu" aria-label="Notifications">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-medium text-amortix-navy">Notifications</p>
                <button
                  type="button"
                  onClick={() => {
                    void onMarkAllRead();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amortix-emerald hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg px-2 py-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center gap-2 px-3 py-8 text-xs text-amortix-slate">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-3 py-8 text-center text-xs text-amortix-slate">
                    You&apos;re all caught up.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="rounded-xl border border-transparent px-3 py-2.5 hover:border-slate-200 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-amortix-navy">{notification.title}</p>
                          <p className="mt-1 text-xs leading-5 text-amortix-slate">{notification.body}</p>
                        </div>
                        {!notification.isRead ? <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" /> : null}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        {notification.link ? (
                          <Link 
                            href={notification.link} 
                            onClick={() => {
                              setMenuOpen(false);
                              setNotificationOpen(false);
                            }}
                            className="dropdown-item text-xs font-medium text-amortix-emerald hover:text-emerald-700" 
                            role="menuitem"
                          >
                            Open
                          </Link>
                        ) : <span />}
                        {!notification.isRead ? (
                          <button
                            type="button"
                            onClick={() => {
                              void onMarkOneRead(notification.id);
                            }}
                            className="dropdown-item text-xs text-amortix-slate hover:text-amortix-navy"
                            role="menuitem"
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setNotificationOpen(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-medium text-white hover:ring-2 hover:ring-emerald-500/30 transition-all"
            aria-label="Open profile menu"
          >
            {userInitial}
          </button>

          {menuOpen ? (
            <div className="dropdown-menu absolute right-0 top-full z-50 mt-2 w-48" role="menu" aria-label="Profile menu">
              <Link 
                href="/profile" 
                onClick={() => {
                  setMenuOpen(false);
                  setNotificationOpen(false);
                }}
                className="dropdown-item block text-sm text-slate-700" 
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  <span>Profile</span>
                </div>
              </Link>
              <Link 
                href="/signout" 
                onClick={() => {
                  setMenuOpen(false);
                  setNotificationOpen(false);
                }}
                className="dropdown-item block text-sm text-slate-700" 
                role="menuitem"
              >
                Sign out
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
