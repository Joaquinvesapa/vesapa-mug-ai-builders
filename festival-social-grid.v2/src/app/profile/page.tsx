import { notFound } from "next/navigation";
import { signOutAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { requireUser } from "@/server/auth/current-user";
import { getProfile } from "@/server/profile/profile";
import { AvatarForm, UsernameForm } from "./profile-forms";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile?.username) notFound();

  return (
    <AppShell>
      <div className="flex items-center gap-4">
        <Avatar avatar={profile.avatar} size={64} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{profile.username}</h1>
          {profile.email && (
            <p className="truncate text-sm text-neutral-500">{profile.email}</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <UsernameForm key={profile.username} username={profile.username} />
        <AvatarForm avatar={profile.avatar} />
        <form action={signOutAction}>
          <button
            type="submit"
            className="h-12 w-full rounded-xl text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-white hover:text-neutral-900"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </AppShell>
  );
}
