import type { ReactNode } from "react";

export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      data-reveal
      data-motion-delay={delay}
    >
      {children}
    </div>
  );
}
