import { paginationQuerySchema } from '@/lib/validation';
import { profileService } from '@/lib/services/profile-service';
import { apiHandler, parseQuery } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const { id } = await params;
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    return profileService.userActivities(id, page, pageSize);
  });
}
