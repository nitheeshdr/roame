import { z } from 'zod';
import { profileService } from '@/lib/services/profile-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

const avatarSchema = z.object({ avatarUrl: z.string().url() });

/** Set the avatar URL (upload the image via /api/upload/avatar first). */
export async function PATCH(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { avatarUrl } = await parseJson(request, avatarSchema);
    return unwrapResult(await profileService.updateProfile(session.id, { avatarUrl }));
  });
}
