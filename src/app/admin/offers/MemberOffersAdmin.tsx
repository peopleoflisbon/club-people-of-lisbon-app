'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface MemberOffer {
  id: string;
  submitted_by: string;
  business_name: string;
  description: string;
  discount?: string;
  link?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function MemberOffersAdmin() {
  const supabase = createClient();
  const [offers, setOffers] = useState<MemberOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('member_offers' as any).select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setOffers((data as any) || []); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await (supabase as any).from('member_offers').update({ status }).eq('id', id);
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  const pending = offers.filter(o => o.status === 'pending');
  const rest = offers.filter(o => o.status !== 'pending');

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-ink mb-1">Member-Submitted Offers</h2>
      <p className="text-sm text-stone-400 mb-5">Review and approve offers submitted by members.</p>
      {loading ? <p className="text-sm text-stone-400">Loading…</p> : (
        <div className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-stone-400">No pending submissions.</p>}
          {[...pending, ...rest].map(o => (
            <div key={o.id} className="bg-white border border-stone-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-ink">{o.business_name}</p>
                    {o.discount && <span className="text-xs px-2 py-0.5 bg-red-50 text-brand font-bold rounded">{o.discount}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${o.status === 'approved' ? 'bg-green-50 text-green-600' : o.status === 'rejected' ? 'bg-stone-100 text-stone-400' : 'bg-amber-50 text-amber-600'}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mb-1">By {o.submitted_by} · {new Date(o.created_at).toLocaleDateString('en-GB')}</p>
                  <p className="text-sm text-stone-500">{o.description}</p>
                  {o.link && <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand mt-1 inline-block">{o.link}</a>}
                </div>
                {o.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => updateStatus(o.id, 'approved')} className="text-xs px-3 py-1.5 bg-green-600 text-white font-semibold rounded">Approve</button>
                    <button onClick={() => updateStatus(o.id, 'rejected')} className="text-xs px-3 py-1.5 border border-stone-200 text-stone-500 rounded">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
