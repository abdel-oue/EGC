import Link from "next/link";
import t from "@egc/shared/admin.json";
import { requireStaff } from "@/lib/auth";
import { signOut } from "../auth-actions";
import AdminBrand from "@/components/AdminBrand";
import StaffNav from "@/components/StaffNav";

export default async function StaffLayout({ children }) {
  const { profile } = await requireStaff();
  // Event registrations, draws and brackets live inside each event's page.
  const links = [
    ["/", "dashboard"],
    ["/events", "events"],
    ["/submissions/contacts", "contacts"],
    ["/submissions/responses", "responses"],
    ["/manage/forms", "forms"],
    ["/manage/members", "members"],
    ["/manage/gallery", "gallery"],
    ["/activity", "activity"],
  ];

  if (profile.role === "admin") {
    links.push(["/staff", "staff"]);
  }

  return (
    <div className="admin-shell min-h-dvh">
      <header className="admin-topbar bg-night text-offwhite">
        <Link href="/" aria-label={t.title}>
          <AdminBrand />
        </Link>
        <StaffNav
          links={links.map(([href, label]) => ({ href, label: t[label] }))}
          label={t.title}
        />
        <div className="admin-account">
          <a href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} className="hidden text-sm text-offwhite/70 sm:block">{t.publicSite}</a>
          <form action={signOut} title={profile.email}>
            <button type="submit" className="border border-offwhite/30 px-4 py-2 text-sm">{t.logout}</button>
          </form>
        </div>
      </header>
      <main className="admin-main mx-auto min-w-0 max-w-7xl p-4 sm:p-8">{children}</main>
    </div>
  );
}
