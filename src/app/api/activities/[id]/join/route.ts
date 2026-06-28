import { participantService } from '@/lib/services/participant-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    return unwrapResult(await participantService.join(session.id, id));
  });
}
