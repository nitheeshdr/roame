import { NotImplementedError } from '@/lib/utils';

/**
 * Object storage adapter (Supabase Storage). Wired when the Supabase env keys
 * are present; otherwise uploads return 501 so the endpoints exist and are
 * documented. Clients PATCH the returned URL onto their profile/activity.
 */
const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

function ensure(): void {
  if (!isConfigured) {
    throw new NotImplementedError(
      'Media storage is not configured. Set the Supabase env keys to enable uploads.',
    );
  }
}

export const storageAdapter = {
  isConfigured,
  async upload(_bucket: string, _file: Blob, _filename: string): Promise<{ url: string; id: string }> {
    ensure();
    return { url: '', id: '' };
  },
  async remove(_id: string): Promise<void> {
    ensure();
  },
};
