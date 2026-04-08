import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

// Server-side Supabase client (for use in Server Components)
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });

// Route handler Supabase client (for use in API routes)
export const createRouteClient = () =>
  createRouteHandlerClient<Database>({ cookies });
