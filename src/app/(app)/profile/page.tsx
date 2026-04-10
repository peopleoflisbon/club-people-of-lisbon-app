import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/members/ProfileForm';

export const metadata = { title: 'Edit Profile · People Of Lisbon' };

export default async function ProfilePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const isNewMember = !profile?.full_name;

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8">

        {isNewMember && (
          <div className="bg-ink p-5 mb-6" style={{ backgroundImage: 'url(/sidebar-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="font-display text-white text-2xl leading-tight mb-1">Welcome to People Of Lisbon!</h2>
              <p className="text-stone-300 text-sm leading-relaxed">Please fill in your profile so other members can find and connect with you. Add a photo, your name, what you do, and where you live in Lisbon.</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="font-display text-3xl text-ink">My Profile</h1>
          <p className="text-stone-500 text-sm mt-1">{isNewMember ? 'Tell the community about yourself' : 'How other members see you'}</p>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
