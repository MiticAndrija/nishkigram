import Link from "next/link";

const footerLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Preporuke", href: "/preporuke" },
  { label: "O nama", href: "/o-nama" },
  { label: "Kontakt", href: "https://www.instagram.com/nishkigram/" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#5c4a3d]/10 bg-[#fdfaf6] px-6 py-8 text-[#5c4a3d] md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/"
            className="font-serif text-2xl font-bold text-[#4a382b] transition-opacity hover:opacity-75"
          >
            Niškigram
          </Link>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#5c4a3d]/70">
            Lokalni vodič kroz priče, mesta i ritam Niša.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-[#5c4a3d]/65">
            © {currentYear} Ni<Link href="/admin/blog" className="text-inherit cursor-default">sk</Link>igram. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
