import { useSyncExternalStore } from "react";

export const editorialEase = "cubic-bezier(0.22, 1, 0.36, 1)";

const subscribeMotionPreference = (callback: () => void) => {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
};
const motionPreference = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || prefersLightweightMotion();
const serverMotionPreference = () => false;

export function useReducedSiteMotion() {
  return useSyncExternalStore(subscribeMotionPreference, motionPreference, serverMotionPreference);
}

export function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function prefersLightweightMotion() {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean };
  }).connection;

  return Boolean(connection?.saveData) || navigator.hardwareConcurrency <= 2;
}

/** Progressive enhancement: no hidden styles are written to server-rendered content. */
export function observeSiteReveals(reducedMotion: MediaQueryList) {
  const seen = new WeakSet<Element>();
  const active = new Set<Animation>();
  let scanFrame = 0;
  const selector =
    "main [data-reveal], main [data-reveal-image], main [data-enter], main [data-enter-image], main .blog-post-content > :is(h2, h3, p, img)";

  const reveal = (element: HTMLElement) => {
    if (reducedMotion.matches || prefersLightweightMotion()) return;

    const image = element.matches("img, [data-reveal-image], [data-enter-image]");
    const delay = Math.min(Number(element.dataset.motionDelay) || 0, 0.24) * 1000;
    const animation = element.animate(
      image
        ? [{ opacity: 0.6, transform: "scale(1.015)" }, { opacity: 1, transform: "none" }]
        : [{ opacity: 0, transform: "translate3d(0, 20px, 0)" }, { opacity: 1, transform: "none" }],
      { duration: image ? 800 : 700, delay, easing: editorialEase, fill: "backwards" },
    );

    active.add(animation);
    animation.finished.then(() => {
      animation.cancel();
      active.delete(animation);
    }).catch(() => active.delete(animation));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        // Restored content above the viewport stays visible when navigating back.
        if (entry.boundingClientRect.bottom > 0) reveal(entry.target as HTMLElement);
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
  );

  const scan = () => {
    scanFrame = 0;
    if (isAdminRoute(window.location.pathname)) return;

    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (seen.has(element)) return;
      seen.add(element);
      // A revealed editorial group already animates its contents; avoid duplicate effects.
      if (element.parentElement?.closest("[data-reveal], [data-enter]")) return;
      const bounds = element.getBoundingClientRect();
      const onScreen = bounds.top < window.innerHeight && bounds.bottom > 0;

      if (reducedMotion.matches || prefersLightweightMotion()) return;
      if (element.matches("[data-enter], [data-enter-image]") && window.scrollY < 48 &&
        !document.documentElement.hasAttribute("data-page-transition")) {
        reveal(element);
      } else if (!onScreen && bounds.top >= window.innerHeight) {
        observer.observe(element);
      }
    });
  };

  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (!(node instanceof Element) || node.isConnected) continue;
        observer.unobserve(node);
        node.querySelectorAll("[data-reveal], [data-reveal-image], [data-enter], [data-enter-image], h2, h3, p, img")
          .forEach((element) => observer.unobserve(element));
        active.forEach((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target;
          if (target instanceof Element && node.contains(target)) animation.cancel();
        });
      }
    }
    const contentChanged = records.some((record) =>
      record.target instanceof Element &&
      (record.target.closest("main") || [...record.addedNodes].some((node) =>
        node instanceof Element && (node.matches("main") || node.querySelector("main")),
      )),
    );
    if (contentChanged && !scanFrame) scanFrame = window.requestAnimationFrame(scan);
  });
  const cancel = () => {
    if (!reducedMotion.matches) return;
    active.forEach((animation) => animation.cancel());
    observer.disconnect();
  };

  scan();
  mutations.observe(document.body, { childList: true, subtree: true });
  reducedMotion.addEventListener("change", cancel);

  return () => {
    window.cancelAnimationFrame(scanFrame);
    observer.disconnect();
    mutations.disconnect();
    reducedMotion.removeEventListener("change", cancel);
    active.forEach((animation) => animation.cancel());
  };
}
