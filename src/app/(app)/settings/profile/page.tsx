import { getSessionUser, getProfile } from "@/lib/data/user";
import { ProfileForm } from "@/components/settings/profile-form";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Profile settings" };

export default async function ProfileSettingsPage() {
  const { user } = await getSessionUser();
  if (!user) return null;
  const profile = await getProfile(user.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            MailCraft AI uses this to personalize your emails and sign-off automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} fallbackEmail={user.email ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Deleting your account removes your profile, companies, templates, and email history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
