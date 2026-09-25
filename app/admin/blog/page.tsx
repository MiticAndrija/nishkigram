import { redirect } from "next/navigation";
import Link from "next/link";
import AdminBlogManager from "@/components/AdminBlogManager";
import Navbar from "@/components/Navbar";
import { isAdminSession } from "@/lib/adminAuth";
import { getAllPosts } from "@/lib/blog";
import { getBlogCategories } from "@/lib/blogCategories";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  const posts = await getAllPosts(true);
  const categories = await getBlogCategories(true);

  return (
    <div className="min-h-screen bg-[#f4efe6] font-sans selection:bg-[#5c4a3d]/20">
      <Navbar />
      <main className="px-6 pb-20 pt-36 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <div className="mb-5 flex flex-wrap gap-3">
              <Link
                href="/admin/aktivnosti"
                className="rounded-full border border-[#5c4a3d]/20 px-4 py-2 text-sm font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8"
              >
                Aktuelnost
              </Link>
              <Link
                href="/admin/blog"
                className="rounded-full bg-[#5c4a3d] px-4 py-2 text-sm font-semibold text-[#fdfaf6]"
              >
                Admin blog
              </Link>
              <Link
                href="/admin/preporuke"
                className="rounded-full border border-[#5c4a3d]/20 px-4 py-2 text-sm font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8"
              >
                Admin preporuke
              </Link>
              <Link
                href="/admin/uploads"
                className="rounded-full border border-[#5c4a3d]/20 px-4 py-2 text-sm font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8"
              >
                Admin media
              </Link>
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#8b6f56]">
              Admin blog
            </p>
            <h1 className="font-serif text-5xl text-[#4a382b] md:text-6xl">
              Upravljanje blog objavama
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c4a3d]/75">
              Kreirajte, izmenite, obrišite, publishujte i unpublishujte blog
              postove. Javna blog strana prikazuje samo objavljene postove.
            </p>
          </div>
          <AdminBlogManager initialPosts={posts} initialCategories={categories} />
        </div>
      </main>
    </div>
  );
}
