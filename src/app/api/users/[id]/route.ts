import { profileService } from '@/lib/services/profile-service';
import { apiHandler } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

/** Public profile (respects privacy / soft delete). */
export async function GET(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    const { id } = await params;
    return profileService.publicProfile(id);
  });
}
