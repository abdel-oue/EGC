import Link from "next/link";
import t from "@egc/shared/admin.json";
import { requireStaff } from "@/lib/auth";
import { signOut } from "../auth-actions";
import AdminBrand from "@/components/AdminBrand";
import StaffNav from "@/components/StaffNav";

export default async function StaffLayout({ children }) {
  const { profile } = await requireStaff();
  const links = [
    ["/", "dashboard"],
    ["/submissions/contacts", "contacts"],
    ["/submissions/registrations", "registrations"],
    ["/submissions/responses", "responses"],
    ["/submissions/legacy", "legacy"],
    ["/manage/events", "events"],
    ["/manage/members", "members"],
    ["/manage/gallery", "gallery"],
    ["/manage/forms", "forms"],
    ["/activity", "activity"],
  ];

  if (profile.role === "admin") {
    links.push(["/staff", "staff"]);
  }

  return (
    <div className="admin-shell min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="admin-sidebar bg-night p-6 text-offwhite lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
        <Link href="/" aria-label={t.title} className="mb-7 block">
          <AdminBrand />
        </Link>
        <StaffNav
          links={links.map(([href, label]) => ({ href, label: t[label] }))}
          label={t.title}
        />
        <div className="admin-account">
          <p className="break-all text-sm text-offwhite/60">{profile.email}</p>
          <form action={signOut} className="mt-4">
            <button type="submit" className="border border-offwhite/30 px-4 py-2">{t.logout}</button>
          </form>
          <a href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} className="mt-5 block text-sm text-offwhite/70">{t.publicSite}</a>
        </div>
      </aside>
      <main className="admin-main min-w-0 p-6 sm:p-10">{children}</main>
    </div>
  );
}
