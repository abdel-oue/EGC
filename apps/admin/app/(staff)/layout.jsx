import Link from "next/link";
import t from "@egc/shared/admin.json";
import { requireStaff } from "@/lib/auth";
import { signOut } from "../auth-actions";

export default async function StaffLayout({ children }) {
  const { profile } = await requireStaff();
  const links = [
    ["/", "dashboard"],
    ["/submissions/contacts", "contacts"],
    ["/submissions/registrations", "registrations"],
    ["/submissions/legacy", "legacy"],
    ["/manage/events", "events"],
    ["/manage/members", "members"],
    ["/manage/gallery", "gallery"],
    ["/activity", "activity"],
  ];

  if (profile.role === "admin") {
    links.push(["/staff", "staff"]);
  }

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-night p-6 text-offwhite lg:sticky lg:top-0 lg:h-svh lg:overflow-y-auto">
        <p className="mb-8 font-display text-xl font-bold text-accent">ESISA GAMING CLUB</p>
        <nav aria-label={t.title} className="flex flex-wrap gap-4 lg:flex-col">
          {links.map(([href, label]) => <Link href={href} key={href} className="hover:text-accent">{t[label]}</Link>)}
        </nav>
        <p className="mt-10 break-all text-sm text-offwhite/60">{profile.email}</p>
        <form action={signOut} className="mt-6">
          <button type="submit" className="border border-offwhite/40 px-4 py-2">{t.logout}</button>
        </form>
        <a href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} className="mt-6 block text-sm text-offwhite/70">{t.publicSite}</a>
      </aside>
      <main className="min-w-0 p-6 sm:p-10">{children}</main>
    </div>
  );
}
