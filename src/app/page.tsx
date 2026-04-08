import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) redirect('/home');
  else redirect('/auth/login');
}
