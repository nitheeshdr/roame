import { userService } from '@/lib/services/user-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    await requireAdmin();
    const { id } = await params;
    return userService.getById(id);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    return unwrapResult(await userService.softDelete(admin, id));
  });
}
