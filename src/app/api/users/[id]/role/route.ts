import { updateUserRoleSchema } from '@/lib/validation';
import { userService } from '@/lib/services/user-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    const input = await parseJson(request, updateUserRoleSchema);
    return unwrapResult(await userService.updateRole(admin, id, input));
  });
}
