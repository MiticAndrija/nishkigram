"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const searchItems = [
  {
    title: "O nama",
    description: "Saznajte vise o Niskigramu i nasoj misiji.",
    href: "/o-nama",
    keywords: "o nama niskigram misija",
  },
  {
    title: "Blog",
    description: "Najnovije vesti, price i dogadjaji iz Nisa.",
    href: "/blog",
    keywords: "blog vesti price dogadjaji nis",
  },
  {
    title: "Preporuke",
    description: "Proverena mesta u Nisu: kafici, restorani, barovi i vise.",
    href: "/preporuke",
    keywords: "preporuke kafici restorani barovi mesta nis",
  },
  {
    title: "Instagram",
    description: "Otvorite @nishkigram profil.",
    href: "https://www.instagram.com/nishkigram/",
    keywords: "instagram nishkigram profil",
  },
];

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const isAboutPage = pathname === "/o-nama";
  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !isScrolled && !isMenuOpen;

  const navItems = [
    {
      href: isAboutPage ? "/" : "/o-nama",
      label: isAboutPage ? "Početna" : "O nama",
    },
    { href: "/blog", label: "Blog" },
    { href: "/preporuke", label: "Preporuke" },
  ];

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    const frameId = window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchItems;
    }

    return searchItems.filter((item) =>
      `${item.title} ${item.description} ${item.keywords}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (results[0]) {
      window.location.href = results[0].href;
      setIsSearchOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-4 py-3 transition-colors duration-300 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:px-8 md:py-4 ${
        isTransparent
          ? "bg-transparent text-[#fdfaf6]"
          : "bg-[#fdfaf6]/90 text-[#5c4a3d] shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-3 md:contents">
        <Link
          href="/"
          aria-label="Niškigram početna"
          className="flex min-w-0 items-center gap-2 justify-self-start transition-opacity hover:opacity-80 md:gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L8 10H16L12 2Z M8 10V22H16V10Z" />
            </svg>
          </div>
          <span className="truncate font-serif text-xl font-bold sm:text-2xl">
            Niškigram
          </span>
        </Link>

        <div className="hidden items-center gap-8 justify-self-center font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="transition-opacity hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 justify-self-end">
          <button
            type="button"
            aria-label="Otvori pretragu"
            onClick={() => setIsSearchOpen(true)}
            className={`hidden h-11 w-11 items-center justify-center rounded-full border transition-colors md:flex ${
              isTransparent
                ? "border-white/40 hover:bg-white/10"
                : "border-[#5c4a3d]/20 hover:bg-[#5c4a3d]/5"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"}
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors md:hidden ${
              isTransparent
                ? "border-white/40 hover:bg-white/10"
                : "border-[#5c4a3d]/20 hover:bg-[#5c4a3d]/5"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          id="mobile-navigation"
          className="mt-3 rounded-2xl border border-[#5c4a3d]/10 bg-[#fdfaf6] p-2 shadow-xl md:hidden"
        >
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="flex min-h-11 w-full items-center rounded-xl px-4 py-3 text-left text-base font-semibold transition-colors hover:bg-[#5c4a3d]/8"
          >
            Pretraga
          </button>
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.href}-${item.label}`}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex min-h-11 items-center rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-[#5c4a3d]/8"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}

      {isSearchOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-[#2f241d]/35 px-3 pt-20 backdrop-blur-sm sm:px-4 sm:pt-24"
          onMouseDown={() => setIsSearchOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pretraga sajta"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#5c4a3d]/15 bg-[#fdfaf6] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 border-b border-[#5c4a3d]/10 px-4 py-4 sm:px-5"
            >
              <svg
                className="h-5 w-5 shrink-0 text-[#5c4a3d]/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pretrazi Niskigram..."
                className="min-w-0 flex-1 bg-transparent text-base text-[#4a382b] outline-none placeholder:text-[#5c4a3d]/45 sm:text-lg"
              />
              <button
                type="button"
                aria-label="Zatvori pretragu"
                onClick={() => setIsSearchOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#5c4a3d]/10"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </form>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {results.length > 0 ? (
                results.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    onClick={() => setIsSearchOpen(false)}
                    className="block rounded-xl px-4 py-3 transition-colors hover:bg-[#5c4a3d]/8"
                  >
                    <span className="block font-semibold text-[#4a382b]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm text-[#5c4a3d]/70">
                      {item.description}
                    </span>
                  </a>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-[#5c4a3d]/70">
                  Nema rezultata za &quot;{query}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
