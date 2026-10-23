import { redirect } from "next/navigation";
import { lang } from "next/root-params";

export default async function RetiredTeamsPage() {
  redirect(`/${await lang()}/members`);
}
