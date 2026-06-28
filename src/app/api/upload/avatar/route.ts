import { storageAdapter } from '@/lib/integrations/storage';
import { requireUser } from '@/lib/auth';
import { ValidationError } from '@/lib/utils';
import { apiHandler } from '@/lib/api/handler';

/** Multipart upload of an avatar; returns a public URL to PATCH onto the profile. */
export async function POST(request: Request) {
  return apiHandler(async () => {
    await requireUser(request);
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    if (!(file instanceof Blob)) throw new ValidationError('A "file" field is required.');
    return storageAdapter.upload('avatars', file, 'avatar');
  }, { status: 201 });
}
