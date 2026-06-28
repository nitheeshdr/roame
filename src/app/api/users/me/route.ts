import { updateProfileSchema } from '@/lib/validation';
import { profileService } from '@/lib/services/profile-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    return profileService.me(session.id);
  });
}

export async function PATCH(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, updateProfileSchema);
    return unwrapResult(await profileService.updateProfile(session.id, input));
  });
}
