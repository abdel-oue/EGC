import Link from "next/link";
import t from "@egc/shared/admin.json";
import AuthForm from "@/components/AuthForm";
import { signIn } from "../auth-actions";

export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto my-20 max-w-lg space-y-8 border border-line bg-panel p-8">
      <p className="font-display font-bold text-accent">ESISA GAMING CLUB</p>
      <AuthForm action={signIn} mode="login" initialError={error} />
      <Link href="/forgot-password" className="block underline">{t.forgot}</Link>
    </main>
  );
}
