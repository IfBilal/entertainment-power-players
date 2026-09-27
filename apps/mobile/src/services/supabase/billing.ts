import { supabase } from './client';

export type PreviewPlan = 'monthly' | 'annual';

/** Grants the caller a reversible, server-recorded test entitlement. */
export async function activatePreviewPlan(plan: PreviewPlan): Promise<void> {
  const { error } = await supabase.rpc('activate_preview_plan', { p_plan: plan });
  if (error) throw error;
}

/** Returns the caller's effective server-side premium entitlement. */
export async function fetchPremiumAccess(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_pro');
  if (error) throw error;
  return data === true;
}
