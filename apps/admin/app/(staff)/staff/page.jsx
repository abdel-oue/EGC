import t from "@egc/shared/admin.json";
import { requireStaff } from "@/lib/auth";
import { inviteStaff, updateStaff } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";

export default async function StaffPage() {
  const { client } = await requireStaff(true);
  const { data: rows, error } = await client.from("staff_profiles").select("*").order("created_at");

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-bold uppercase">{t.staff}</h1>
      {error && <p role="alert">{t.unavailable}</p>}
      <section className="mb-12 max-w-xl border border-line bg-panel p-6">
        <h2 className="mb-6 font-display text-xl font-bold">{t.invite}</h2>
        <ActionForm action={inviteStaff} submitLabel={t.invite}>
          <label className="block">
            <span className="mb-2 block">{t.email}</span>
            <input name="email" type="email" required maxLength={120} />
          </label>
          <label className="block">
            <span className="mb-2 block">{t.role}</span>
            <select name="role" defaultValue="manager">
              <option value="manager">{t.options.manager}</option>
              <option value="admin">{t.options.admin}</option>
            </select>
          </label>
        </ActionForm>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        {rows?.map((profile) => (
          <section key={profile.user_id} className="border border-line bg-panel p-6">
            <h2 className="mb-5 break-all font-bold">{profile.email}</h2>
            <ActionForm action={updateStaff.bind(null, profile.user_id)}>
              <label className="block">
                <span className="mb-2 block">{t.role}</span>
                <select name="role" defaultValue={profile.role}>
                  <option value="manager">{t.options.manager}</option>
                  <option value="admin">{t.options.admin}</option>
                </select>
              </label>
              <label className="flex items-center gap-3">
                <input name="active" type="checkbox" defaultChecked={profile.active} className="size-5" />
                <span>{t.active}</span>
              </label>
            </ActionForm>
          </section>
        ))}
      </div>
    </>
  );
}
