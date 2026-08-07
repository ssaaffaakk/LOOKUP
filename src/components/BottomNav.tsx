"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Tonight",
    href: "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2C6.029 2 2 6.029 2 11s4.029 9 9 9 9-4.029 9-9c0-.46-.035-.912-.102-1.354A6.5 6.5 0 0 1 13.354 3.102 9.06 9.06 0 0 0 11 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill={active ? "currentColor" : "none"}
          strokeLinejoin="round"
        />
        {!active && (
          <>
            <circle cx="8" cy="9" r="0.75" fill="currentColor" />
            <circle cx="14" cy="7" r="0.5" fill="currentColor" />
            <circle cx="10" cy="14" r="0.5" fill="currentColor" />
          </>
        )}
      </svg>
    ),
  },
  {
    label: "Identify",
    href: "/identify",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="10"
          cy="10"
          r="6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          fill={active ? "currentColor" : "none"}
        />
        <path
          d="M15 15L19.5 19.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[52px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 transition-colors duration-150 ${
                active ? "text-accent" : "text-text-tertiary"
              }`}
            >
              {tab.icon(active)}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
