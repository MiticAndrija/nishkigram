"use client";

import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { editorialEase, isAdminRoute, observeSiteReveals, prefersLightweightMotion } from "@/lib/siteMotion";

type NavigationOptions = { replace?: boolean; scroll?: boolean };
type MotionNavigation = (href: string, options: NavigationOptions) => boolean;
const NavigationContext = createContext<MotionNavigation | null>(null);

export function useMotionNavigation() {
  return useContext(NavigationContext);
}

export default function SiteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useRef<Lenis | null>(null);
  const activeTransition = useRef<ViewTransition | null>(null);
  const pending = useRef<{
    resolve: () => void;
    transition: ViewTransition;
    timeout: ReturnType<typeof setTimeout>;
  } | null>(null);
  const entered = useRef(false);
  const exitAnimation = useRef<Animation | null>(null);
  const entryAnimation = useRef<Animation | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const configure = () => {
      if (preference.matches || prefersLightweightMotion()) {
        lenis.current?.destroy();
        lenis.current = null;
        delete document.documentElement.dataset.siteMotion;
        entryAnimation.current?.cancel();
        exitAnimation.current?.cancel();
        activeTransition.current?.skipTransition();
        return;
      }

      if (!isAdminRoute(window.location.pathname)) document.documentElement.dataset.siteMotion = "ready";
      if (!lenis.current) {
        lenis.current = new Lenis({
          autoRaf: true,
          lerp: 0.14,
          smoothWheel: true,
          syncTouch: false,
          anchors: { duration: 0.65 },
          stopInertiaOnNavigate: true,
          prevent: (node) => node.getAttribute("role") === "dialog" || node.isContentEditable ||
            node.matches("input, textarea, select, [data-lenis-prevent]"),
          virtualScroll: ({ event }) => !isAdminRoute(window.location.pathname) && !event.ctrlKey && !event.shiftKey,
        });
      }
    };
    const stopInertia = () => lenis.current?.scrollTo(window.scrollY, { immediate: true, force: true });
    configure();
    const stopReveals = observeSiteReveals(preference);
    preference.addEventListener("change", configure);
    window.addEventListener("popstate", stopInertia);

    return () => {
      stopReveals();
      preference.removeEventListener("change", configure);
      window.removeEventListener("popstate", stopInertia);
      lenis.current?.destroy();
      lenis.current = null;
      delete document.documentElement.dataset.siteMotion;
      entryAnimation.current?.cancel();
      exitAnimation.current?.cancel();
      activeTransition.current?.skipTransition();
      delete document.documentElement.dataset.pageTransition;
      if (pending.current) {
        clearTimeout(pending.current.timeout);
        pending.current.resolve();
        pending.current.transition.skipTransition();
        pending.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (isAdminRoute(pathname)) delete document.documentElement.dataset.siteMotion;
    else if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && !prefersLightweightMotion()) {
      document.documentElement.dataset.siteMotion = "ready";
    }
    const navigation = pending.current;
    exitAnimation.current?.cancel();
    exitAnimation.current = null;
    if (navigation) {
      clearTimeout(navigation.timeout);
      navigation.resolve();
      pending.current = null;
    } else if (entered.current && !isAdminRoute(pathname) &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !prefersLightweightMotion()) {
      // History and browsers without View Transitions keep native routing and scroll restoration.
      entryAnimation.current?.cancel();
      entryAnimation.current = document.querySelector("main")?.animate(
        [{ opacity: 0.18, transform: "translate3d(0, 12px, 0)" }, { opacity: 1, transform: "none" }],
        { duration: 400, easing: editorialEase },
      ) ?? null;
      const animation = entryAnimation.current;
      animation?.finished.then(() => animation.cancel()).catch(() => {});
    }
    entered.current = true;
    const frame = window.requestAnimationFrame(() => lenis.current?.resize());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const navigate = useCallback<MotionNavigation>((href, options) => {
    if (document.hidden ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || prefersLightweightMotion() ||
      isAdminRoute(pathname)) return false;

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === pathname ||
      isAdminRoute(destination.pathname)) return false;

    if (pending.current) {
      clearTimeout(pending.current.timeout);
      pending.current.resolve();
      pending.current.transition.skipTransition();
      pending.current = null;
    }
    lenis.current?.resize();
    entryAnimation.current?.cancel();
    exitAnimation.current?.cancel();
    activeTransition.current?.skipTransition();

    const pushRoute = () => {
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
    };
    if (!document.startViewTransition) {
      // Start routing immediately while the existing page fades out.
      exitAnimation.current = document.querySelector("main")?.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0.45, transform: "translate3d(0, -8px, 0)" }],
        { duration: 180, easing: editorialEase },
      ) ?? null;
      const animation = exitAnimation.current;
      animation?.finished.then(() => animation.cancel()).catch(() => {});
      pushRoute();
      return true;
    }
    document.documentElement.dataset.pageTransition = "active";

    let resolveCommit: () => void = () => {};
    const committed = new Promise<void>((resolve) => { resolveCommit = resolve; });
    const transition = document.startViewTransition(() => {
      pushRoute();
      return committed;
    });
    transition.ready.catch(() => {});
    activeTransition.current = transition;
    const timeout = setTimeout(() => {
      // A slow route displays its normal loading state; motion never holds navigation open.
      resolveCommit();
      transition.skipTransition();
      if (pending.current?.transition === transition) pending.current = null;
    }, 650);
    pending.current = { resolve: resolveCommit, transition, timeout };
    transition.finished.catch(() => {}).finally(() => {
      clearTimeout(timeout);
      if (activeTransition.current === transition) {
        activeTransition.current = null;
        delete document.documentElement.dataset.pageTransition;
      }
      if (pending.current?.transition === transition) {
        resolveCommit();
        pending.current = null;
      }
    });
    return true;
  }, [pathname, router]);

  return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}
