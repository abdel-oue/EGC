import Link from "next/link";
import t from "@egc/shared/admin.json";
import AuthForm from "@/components/AuthForm";
import AdminBrand from "@/components/AdminBrand";
import { requestReset } from "../auth-actions";

export default function ForgotPasswordPage() {
  return (
    <main className="admin-auth mx-auto my-20 max-w-lg space-y-8 border border-line bg-panel p-8">
      <AdminBrand />
      <AuthForm action={requestReset} mode="forgot" />
      <Link href="/login">{t.login}</Link>
    </main>
  );
}
