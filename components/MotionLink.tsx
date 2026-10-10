"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useMotionNavigation } from "@/components/SiteMotion";

/** The original Next.js Link, including prefetching, keyboard and modified-click behavior. */
export default function MotionLink({ href, onNavigate, replace, scroll, ...props }: ComponentProps<typeof Link>) {
  const navigate = useMotionNavigation();

  return (
    <Link
      {...props}
      href={href}
      replace={replace}
      scroll={scroll}
      onNavigate={(event) => {
        if (onNavigate) {
          onNavigate(event);
          return;
        }
        if (typeof href === "string" && navigate?.(href, { replace, scroll })) event.preventDefault();
      }}
    />
  );
}
