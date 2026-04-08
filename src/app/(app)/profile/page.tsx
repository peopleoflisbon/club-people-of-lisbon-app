import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/members/ProfileForm';

export const metadata = { title: 'Edit Profile · People Of Lisbon' };

export default async function ProfilePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain"><div className="max-w-2xl mx-auto px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ink">My Profile</h1>
        <p className="text-stone-500 text-sm mt-1">How other members see you</p>
      </div>
      <ProfileForm profile={profile} />
    </div></div>
  );
}
