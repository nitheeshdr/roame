import { updateSettingsSchema } from '@/lib/validation';
import { profileService } from '@/lib/services/profile-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function PATCH(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, updateSettingsSchema);
    return unwrapResult(await profileService.updateSettings(session.id, input));
  });
}
