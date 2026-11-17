import Link from "next/link";
import t from "@egc/shared/admin.json";
import AuthForm from "@/components/AuthForm";
import AdminBrand from "@/components/AdminBrand";
import { requireStaff } from "@/lib/auth";
import { updatePassword } from "../auth-actions";

export default async function ResetPasswordPage() {
  await requireStaff();

  return (
    <main className="admin-auth mx-auto my-20 max-w-lg space-y-8 border border-line bg-panel p-8">
      <AdminBrand />
      <AuthForm action={updatePassword} mode="reset" />
      <Link href="/">{t.dashboard}</Link>
    </main>
  );
}
