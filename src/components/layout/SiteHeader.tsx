"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_SECTIONS } from "@/lib/constants/nav";

interface SiteHeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  dataSource?: "loading" | "api" | "mock";
}

/** NASA meatball vector logo. */
function NasaLogo() {
  return (
    <svg
      className="h-11 w-11 flex-shrink-0 drop-shadow-[0_0_6px_rgba(20,90,180,0.35)]"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NASA Logo"
    >
      <circle cx="50" cy="50" r="45" fill="#0b3d91" />
      <circle cx="28" cy="30" r="1.3" fill="#ffffff" />
      <circle cx="42" cy="21" r="1.1" fill="#ffffff" />
      <circle cx="62" cy="24" r="1.4" fill="#ffffff" />
      <circle cx="72" cy="34" r="1" fill="#ffffff" />
      <circle cx="25" cy="65" r="1.2" fill="#ffffff" />
      <circle cx="36" cy="75" r="1" fill="#ffffff" />
      <circle cx="66" cy="73" r="1.3" fill="#ffffff" />
      <circle cx="75" cy="61" r="1.1" fill="#ffffff" />
      <path
        d="M 14 68 C 32 76, 68 38, 86 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.9"
      />
      <path
        d="M 18 32 C 35 16, 70 68, 84 74"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path d="M 10 66 L 47 22 L 54 25 L 91 20 L 53 33 L 49 29 Z" fill="#fc3d21" />
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="800"
        fontSize="21"
        letterSpacing="1.5"
      >
        NASA
      </text>
    </svg>
  );
}

export function SiteHeader({ activeSection, onNavigate, dataSource }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  /* Close the mobile menu on outside click or Escape. */
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        !navRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="relative flex h-[62px] flex-shrink-0 items-center justify-between border-b border-border-subtle bg-gradient-to-b from-[#0f161f] to-[#0c1219] px-[22px]">
      <div className="flex items-center gap-3.5">
        <NasaLogo />
        <div>
          <h1 className="text-[18px] font-medium leading-tight tracking-[0.28em] text-[#eef4fa]">
            SPHEREx SKY HUNTER
          </h1>
          <p className="mt-0.5 text-[11px] font-light italic tracking-[0.03em] text-[#8b9cb0]">
            A Citizen Science Portal for Transient &amp; Planet X Hunting
          </p>
        </div>
        {dataSource === "mock" && (
          <span
            className="ml-2 rounded border border-cyan-muted/50 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-cyan-bright"
            title="Backend unreachable — showing mock data"
          >
            MOCK DATA
          </span>
        )}
        {dataSource === "api" && (
          <span className="ml-2 rounded border border-cyan-muted/50 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-cyan-bright">
            LIVE API
          </span>
        )}
      </div>

      <button
        ref={menuButtonRef}
        className="rounded border border-border-panel bg-panel px-2.5 py-1.5 text-sm text-text-primary md:hidden"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        ☰
      </button>

      <nav
        ref={navRef}
        id="site-nav"
        className={`absolute left-0 right-0 top-[62px] z-50 flex-col gap-2.5 border-b border-border-panel bg-[#0f161f] px-5 py-3 md:static md:z-auto md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:px-0 md:py-0 ${
          menuOpen ? "flex" : "hidden"
        }`}
      >
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`relative cursor-pointer border-0 bg-transparent pb-1.5 pt-1.5 text-[11.5px] font-normal tracking-[0.08em] transition-colors duration-200 ${
              activeSection === section.id
                ? "text-[#eef5fc] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-cyan after:shadow-[0_0_6px_var(--color-cyan)]"
                : "text-[#96a7ba] hover:text-[#eef5fc]"
            }`}
            onClick={() => {
              onNavigate(section.id);
              setMenuOpen(false);
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
