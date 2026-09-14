import { supabase } from './client';

export type Profile = {
  id: string;
  displayName: string | null;
  photoUrl: string | null;
  selectedTracks: string[];
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, photo_url, selected_tracks')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    displayName: data.display_name,
    photoUrl: data.photo_url,
    selectedTracks: data.selected_tracks ?? [],
  };
}

export async function updateSelectedTracks(userId: string, trackSlugs: string[]) {
  const { error } = await supabase.from('profiles').update({ selected_tracks: trackSlugs }).eq('id', userId);
  if (error) throw error;
}

export async function updateProfile(userId: string, fields: { displayName?: string; photoUrl?: string }) {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(fields.displayName !== undefined ? { display_name: fields.displayName } : {}),
      ...(fields.photoUrl !== undefined ? { photo_url: fields.photoUrl } : {}),
    })
    .eq('id', userId);
  if (error) throw error;
}
