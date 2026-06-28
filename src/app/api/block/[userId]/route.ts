import { socialService } from '@/lib/services/social-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ userId: string }> };

export async function POST(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { userId } = await params;
    return unwrapResult(await socialService.block(session.id, userId));
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { userId } = await params;
    return unwrapResult(await socialService.unblock(session.id, userId));
  });
}
